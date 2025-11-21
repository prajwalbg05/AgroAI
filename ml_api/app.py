from flask import Flask, request, jsonify
import os
import joblib
import numpy as np
from datetime import datetime
from tensorflow.keras.models import load_model

app = Flask(__name__)

MODEL_DIR = '.'
SEQ_LENGTH = 30

CALIBRATION_ALPHA = float(os.environ.get('CALIBRATION_ALPHA', '0.6'))
CLAMP_PCT = float(os.environ.get('CLAMP_PCT', '0.15'))

MARKET_CROPS = {
    'davangere': ['Cotton', 'Maize', 'Ragi', 'Rice', 'Tomato'],
    'gangavathi': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'HBhalli': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'hospet': ['Maize', 'Ragi', 'Rice', 'Tomato']
}

# Lazy caches
_lstm_cache = {}
_xgb_cache = None


def _ensure_price_scaler(obj):
    # New training saves {'price_scaler': scaler}; older saved scaler directly
    if isinstance(obj, dict) and 'price_scaler' in obj:
        return obj['price_scaler']
    return obj


def load_lstm_model_and_scaler(market: str, crop: str):
    key = (market, crop)
    if key in _lstm_cache:
        return _lstm_cache[key]
    model_path_keras = os.path.join(MODEL_DIR, f'lstm_{market}_{crop}.keras')
    model_path_h5 = os.path.join(MODEL_DIR, f'lstm_{market}_{crop}.h5')
    scaler_path = os.path.join(MODEL_DIR, f'lstm_{market}_{crop}_scaler.pkl')
    if os.path.exists(model_path_keras) and os.path.exists(scaler_path):
        model = load_model(model_path_keras, compile=False)
        scaler = _ensure_price_scaler(joblib.load(scaler_path))
        _lstm_cache[key] = (model, scaler)
        return model, scaler
    if os.path.exists(model_path_h5) and os.path.exists(scaler_path):
        model = load_model(model_path_h5, compile=False)
        scaler = _ensure_price_scaler(joblib.load(scaler_path))
        _lstm_cache[key] = (model, scaler)
        return model, scaler
    return None, None


def pad_or_truncate_history(history):
    # Ensure array of length SEQ_LENGTH using last value padding if short
    arr = list(map(float, history))
    if len(arr) >= SEQ_LENGTH:
        arr = arr[-SEQ_LENGTH:]
    else:
        if not arr:
            arr = [0.0]
        arr = arr + [arr[-1]] * (SEQ_LENGTH - len(arr))
    return np.array(arr).reshape(-1, 1)


def get_anchor(anchor_price, last_price):
    try:
        return float(anchor_price) if anchor_price is not None else float(last_price)
    except Exception:
        return float(last_price)


def load_xgb():
    global _xgb_cache
    if _xgb_cache is not None:
        return _xgb_cache
    model_path = os.path.join(MODEL_DIR, 'xgb_crop_recommendation.pkl')
    le_market_path = os.path.join(MODEL_DIR, 'xgb_le_market.pkl')
    le_crop_path = os.path.join(MODEL_DIR, 'xgb_le_crop.pkl')
    if not (os.path.exists(model_path) and os.path.exists(le_market_path) and os.path.exists(le_crop_path)):
        return None
    model = joblib.load(model_path)
    le_market = joblib.load(le_market_path)
    le_crop = joblib.load(le_crop_path)
    _xgb_cache = (model, le_market, le_crop)
    return _xgb_cache


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/predict', methods=['POST'])
def predict():
    data = request.json or {}
    task = data.get('task')

    if task == 'price_forecast':
        market = data.get('market')
        crop = data.get('crop')
        history = data.get('history') or []
        anchor_price = data.get('anchor_price')
        if not (market and crop):
            return jsonify({'error': 'Missing market or crop'}), 400
        model, scaler = load_lstm_model_and_scaler(market, crop)
        if model is None or scaler is None:
            return jsonify({'error': f'Model for {market}-{crop} not found'}), 404
        seq = pad_or_truncate_history(history)
        last_price = float(seq[-1][0])
        anchor = get_anchor(anchor_price, last_price)
        input_scaled = scaler.transform(seq)
        X_pred = input_scaled.reshape(1, SEQ_LENGTH, 1)
        pred_scaled = model.predict(X_pred)
        model_pred = float(scaler.inverse_transform(pred_scaled)[0][0])
        blended = CALIBRATION_ALPHA * model_pred + (1.0 - CALIBRATION_ALPHA) * anchor
        lo = anchor * (1.0 - CLAMP_PCT)
        hi = anchor * (1.0 + CLAMP_PCT)
        blended = max(lo, min(hi, blended))
        return jsonify({'forecast': blended, 'model_pred': model_pred, 'anchor_price': anchor, 'last_price': last_price})

    elif task == 'crop_recommendation':
        # Inputs: market (required), month (optional 1-12) or date (YYYY-MM-DD)
        market = data.get('market')
        month = data.get('month')
        date_str = data.get('date')
        top_k = int(data.get('top_k', 3))
        if not market:
            return jsonify({'error': 'Missing market'}), 400
        if month is None and date_str:
            try:
                month = datetime.fromisoformat(date_str).month
            except Exception:
                month = datetime.utcnow().month
        if month is None:
            month = datetime.utcnow().month
        bundle = load_xgb()
        if bundle is None:
            return jsonify({'error': 'Recommendation model not available'}), 500
        model, le_market, le_crop = bundle
        try:
            m_enc = le_market.transform([market])[0]
        except Exception:
            # unseen market
            return jsonify({'error': f'Unknown market: {market}'}), 400
        features = np.array([[m_enc, int(month)]])
        # Use predict_proba to rank
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(features)[0]
            indices = np.argsort(proba)[::-1]
            crops_all = le_crop.inverse_transform(indices)
        else:
            preds = model.predict(features)
            crops_all = le_crop.inverse_transform(preds)
        allowed = MARKET_CROPS.get(market, None)
        ranked = [c for c in crops_all if (allowed is None or c in allowed)]
        return jsonify({'market': market, 'month': int(month), 'recommended_crops': ranked[:top_k]})

    else:
        return jsonify({'error': 'Invalid task'}), 400


if __name__ == '__main__':
    app.run(debug=True) 
