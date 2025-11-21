from flask import Flask, request, jsonify
import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)

MODEL_DIR = '.'
SEQ_LENGTH = 60  # Enhanced sequence length

CALIBRATION_ALPHA = float(os.environ.get('CALIBRATION_ALPHA', '0.7'))  # Increased confidence in model
CLAMP_PCT = float(os.environ.get('CLAMP_PCT', '0.1'))  # Tighter bounds

MARKET_CROPS = {
    'davangere': ['Cotton', 'Maize', 'Ragi', 'Rice', 'Tomato'],
    'gangavathi': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'HBhalli': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'hospet': ['Maize', 'Ragi', 'Rice', 'Tomato']
}

# Enhanced caches
_lstm_cache = {}
_xgb_cache = None
_ensemble_cache = None


def _ensure_price_scaler(obj):
    """Handle both old and new scaler formats"""
    if isinstance(obj, dict) and 'price_scaler' in obj:
        return obj['price_scaler']
    return obj


def load_enhanced_lstm_model_and_scaler(market: str, crop: str):
    """Load enhanced LSTM model with advanced architecture"""
    key = (market, crop)
    if key in _lstm_cache:
        return _lstm_cache[key]
    
    # Try enhanced model first, fallback to regular model
    model_paths = [
        f'lstm_enhanced_{market}_{crop}.keras',
        f'lstm_{market}_{crop}.keras'
    ]
    
    scaler_paths = [
        f'lstm_enhanced_{market}_{crop}_scaler.pkl',
        f'lstm_{market}_{crop}_scaler.pkl'
    ]
    
    model = None
    scalers = None
    
    for model_path, scaler_path in zip(model_paths, scaler_paths):
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            try:
                model = load_model(model_path, compile=False)
                scalers = joblib.load(scaler_path)
                print(f"Loaded enhanced model: {model_path}")
                break
            except Exception as e:
                print(f"Error loading {model_path}: {e}")
                continue
    
    if model is not None and scalers is not None:
        _lstm_cache[key] = (model, scalers)
        return model, scalers
    
    return None, None


def load_enhanced_xgb():
    """Load enhanced XGBoost and ensemble models"""
    global _xgb_cache, _ensemble_cache
    
    if _xgb_cache is not None and _ensemble_cache is not None:
        return _xgb_cache, _ensemble_cache
    
    try:
        # Load enhanced models
        xgb_model = joblib.load('xgb_enhanced_crop_recommendation.pkl')
        ensemble_models = joblib.load('ensemble_crop_recommendation.pkl')
        scaler = joblib.load('ensemble_scaler.pkl')
        le_market = joblib.load('xgb_le_market.pkl')
        le_crop = joblib.load('xgb_le_crop.pkl')
        feature_selector = joblib.load('feature_selector.pkl')
        selected_features = joblib.load('selected_features.pkl')
        
        _xgb_cache = (xgb_model, le_market, le_crop, feature_selector, selected_features)
        _ensemble_cache = (ensemble_models, scaler)
        
        print("Loaded enhanced XGBoost and ensemble models")
        return _xgb_cache, _ensemble_cache
        
    except Exception as e:
        print(f"Error loading enhanced models: {e}")
        # Fallback to regular models
        try:
            model = joblib.load('xgb_crop_recommendation.pkl')
            le_market = joblib.load('xgb_le_market.pkl')
            le_crop = joblib.load('xgb_le_crop.pkl')
            
            _xgb_cache = (model, le_market, le_crop, None, None)
            _ensemble_cache = None
            return _xgb_cache, _ensemble_cache
        except Exception as e2:
            print(f"Error loading fallback models: {e2}")
            return None, None


def pad_or_truncate_history(history):
    """Enhanced sequence padding with better handling"""
    arr = list(map(float, history))
    if len(arr) >= SEQ_LENGTH:
        arr = arr[-SEQ_LENGTH:]
    else:
        if not arr:
            arr = [0.0]
        # Use linear interpolation for better padding
        if len(arr) > 1:
            step = (arr[-1] - arr[0]) / (len(arr) - 1)
            while len(arr) < SEQ_LENGTH:
                arr.append(arr[-1] + step)
        else:
            arr = arr + [arr[-1]] * (SEQ_LENGTH - len(arr))
    return np.array(arr).reshape(-1, 1)


def get_anchor(anchor_price, last_price):
    """Enhanced anchor price calculation"""
    try:
        if anchor_price is not None:
            anchor = float(anchor_price)
        else:
            # Handle case where last_price might be an array
            if hasattr(last_price, '__len__') and len(last_price) > 0:
                anchor = float(last_price[-1])  # Use last element if it's an array
            else:
                anchor = float(last_price)
        
        # Add some trend consideration
        if hasattr(last_price, '__len__') and len(last_price) > 1:
            recent_trend = np.mean(np.diff(last_price[-5:]))  # Last 5 points trend
            anchor = anchor * (1 + 0.1 * np.sign(recent_trend))  # Slight trend adjustment
        return anchor
    except Exception:
        # Fallback: try to get the last element if it's an array
        if hasattr(last_price, '__len__') and len(last_price) > 0:
            return float(last_price[-1])
        return float(last_price)


def build_enhanced_lstm_features(prices_scaled):
    """Build enhanced features for LSTM prediction matching training"""
    p = prices_scaled.flatten()
    
    def roll_mean(x, w):
        return np.convolve(x, np.ones(w)/w, mode='same')
    
    def roll_std(x, w):
        result = np.zeros_like(x)
        for i in range(len(x)):
            start = max(0, i - w + 1)
            result[i] = np.std(x[start:i+1])
        return result
    
    def roll_min(x, w):
        result = np.zeros_like(x)
        for i in range(len(x)):
            start = max(0, i - w + 1)
            result[i] = np.min(x[start:i+1])
        return result
    
    def roll_max(x, w):
        result = np.zeros_like(x)
        for i in range(len(x)):
            start = max(0, i - w + 1)
            result[i] = np.max(x[start:i+1])
        return result
    
    # Multiple time windows for moving averages
    ma_windows = [3, 7, 14, 21, 30, 45, 60]
    ma_features = []
    for w in ma_windows:
        if w <= len(p):
            ma_features.append(roll_mean(p, w))
    
    # Multiple time windows for standard deviation
    std_windows = [7, 14, 21, 30]
    std_features = []
    for w in std_windows:
        if w <= len(p):
            std_features.append(roll_std(p, w))
    
    # Min/Max features
    min_features = [roll_min(p, 7), roll_min(p, 14), roll_min(p, 30)]
    max_features = [roll_max(p, 7), roll_max(p, 14), roll_max(p, 30)]
    
    # Price ratios and relative positions
    eps = 1e-6
    price_ratios = []
    for i, ma in enumerate(ma_features[:4]):  # Use first 4 MA features
        price_ratios.append(p / (ma + eps))
    
    # Volatility features
    volatility_features = []
    for std in std_features:
        volatility_features.append(std / (roll_mean(p, 14) + eps))
    
    # Trend features
    trend_features = np.zeros_like(p)
    for i in range(1, len(p)):
        trend_features[i] = p[i] - p[i-1]
    
    # Momentum features
    momentum_features = []
    for w in [3, 7, 14]:
        if w <= len(p):
            momentum = np.zeros_like(p)
            for i in range(w, len(p)):
                momentum[i] = p[i] - p[i-w]
            momentum_features.append(momentum)
    
    # Price position within recent range
    range_position = []
    for w in [7, 14, 30]:
        if w <= len(p):
            min_vals = roll_min(p, w)
            max_vals = roll_max(p, w)
            pos = (p - min_vals) / (max_vals - min_vals + eps)
            range_position.append(pos)
    
    # Combine all features
    all_features = [p] + ma_features + std_features + min_features + max_features + \
                   price_ratios + volatility_features + [trend_features] + \
                   momentum_features + range_position
    
    # Ensure all features have the same length
    min_length = min(len(f) for f in all_features if len(f) > 0)
    features_array = np.column_stack([f[:min_length] for f in all_features])
    
    return features_array


def build_enhanced_features_for_prediction(market, crop, month, year=None):
    """Build enhanced features for crop recommendation"""
    if year is None:
        year = datetime.now().year
    
    # Market encoding (same as training)
    market_encoding = {'davangere': 0, 'gangavathi': 1, 'hospet': 2, 'hbhalli': 3, 'HBhalli': 3}
    market_enc = market_encoding.get(market.lower(), 0)
    
    # Create comprehensive feature set matching training features
    features = {
        'market_enc': market_enc,
        'year': year,
        'month': month,
        'day': 15,  # Mid-month
        'day_of_year': month * 30 + 15,  # Approximate
        'week_of_year': month * 4 + 2,  # Approximate
        'quarter': (month - 1) // 3 + 1,
        'is_month_start': 1 if month in [1, 4, 7, 10] else 0,  # Start of quarters
        'is_month_end': 1 if month in [3, 6, 9, 12] else 0,  # End of quarters
        'price': 1000,  # Default price
        'price_ma_7': 1000,  # Default moving average
        'price_ma_30': 1000,  # Default moving average
        'price_std_7': 50,  # Default standard deviation
        'price_std_30': 100,  # Default standard deviation
        'price_min_7': 950,  # Default minimum
        'price_max_7': 1050,  # Default maximum
        'price_range_7': 100,  # Default range
        'price_volatility': 0.05,  # Default volatility
        'price_momentum': 0,  # Default momentum
        'price_change_pct': 0,  # Default change
        'market_volume': 100,  # Default volume
        'price_trend': 0  # Default trend
    }
    
    return features


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'enhanced': True})


@app.route('/predict', methods=['POST'])
def predict():
    """Enhanced prediction endpoint with ensemble methods"""
    data = request.json or {}
    task = data.get('task')

    if task == 'price_forecast':
        market = data.get('market')
        crop = data.get('crop')
        history = data.get('history') or []
        anchor_price = data.get('anchor_price')
        
        if not (market and crop):
            return jsonify({'error': 'Missing market or crop'}), 400
        
        # Load enhanced LSTM model
        model, scalers = load_enhanced_lstm_model_and_scaler(market, crop)
        if model is None or scalers is None:
            return jsonify({'error': f'Enhanced model for {market}-{crop} not found'}), 404
        
        # Enhanced sequence preparation
        seq = pad_or_truncate_history(history)
        last_price = float(seq[-1][0])
        anchor = get_anchor(anchor_price, seq.flatten())
        
        # Use enhanced scalers
        if isinstance(scalers, dict):
            price_scaler = scalers['price_scaler']
            feature_scaler = scalers.get('feature_scaler')
        else:
            price_scaler = _ensure_price_scaler(scalers)
            feature_scaler = None
        
        # Enhanced prediction with multiple attempts
        predictions = []
        for _ in range(3):  # Multiple predictions for stability
            try:
                input_scaled = price_scaler.transform(seq)
                
                # If we have feature scaler, use enhanced features
                if feature_scaler is not None:
                    # Build enhanced features matching training
                    enhanced_features = build_enhanced_lstm_features(input_scaled)
                    enhanced_features = feature_scaler.transform(enhanced_features)
                    X_pred = enhanced_features.reshape(1, SEQ_LENGTH, enhanced_features.shape[1])
                else:
                    X_pred = input_scaled.reshape(1, SEQ_LENGTH, 1)
                
                pred_scaled = model.predict(X_pred, verbose=0)
                model_pred = float(price_scaler.inverse_transform(pred_scaled)[0][0])
                predictions.append(model_pred)
                
            except Exception as e:
                print(f"Prediction attempt failed: {e}")
                continue
        
        if not predictions:
            return jsonify({'error': 'Prediction failed'}), 500
        
        # Use median prediction for stability
        model_pred = np.median(predictions)
        
        # Enhanced blending with confidence weighting
        confidence = min(1.0, len(history) / SEQ_LENGTH)  # Higher confidence with more history
        blended = CALIBRATION_ALPHA * confidence * model_pred + (1.0 - CALIBRATION_ALPHA * confidence) * anchor
        
        # Tighter bounds with confidence
        lo = anchor * (1.0 - CLAMP_PCT * confidence)
        hi = anchor * (1.0 + CLAMP_PCT * confidence)
        blended = max(lo, min(hi, blended))
        
        # Add confidence score
        confidence_score = min(0.95, confidence * CALIBRATION_ALPHA)
        
        return jsonify({
            'forecast': float(blended),
            'model_pred': float(model_pred),
            'anchor_price': float(anchor),
            'last_price': float(last_price),
            'confidence': float(confidence_score),
            'prediction_range': [float(lo), float(hi)],
            'enhanced': True
        })

    elif task == 'crop_recommendation':
        """Enhanced crop recommendation with ensemble methods"""
        market = data.get('market')
        crop = data.get('crop', 'Rice')  # Default crop if not provided
        month = data.get('month')
        date_str = data.get('date')
        top_k = int(data.get('top_k', 5))  # Increased default recommendations
        
        if not market:
            return jsonify({'error': 'Missing market'}), 400
        
        # Parse date/month
        if month is None and date_str:
            try:
                month = datetime.fromisoformat(date_str).month
                year = datetime.fromisoformat(date_str).year
            except Exception:
                month = datetime.utcnow().month
                year = datetime.utcnow().year
        else:
            month = month or datetime.utcnow().month
            year = datetime.utcnow().year
        
        # Load enhanced models
        xgb_data, ensemble_data = load_enhanced_xgb()
        if xgb_data is None:
            return jsonify({'error': 'Enhanced recommendation models not available'}), 500
        
        xgb_model, le_market, le_crop, feature_selector, selected_features = xgb_data
        
        try:
            # Build enhanced features
            features = build_enhanced_features_for_prediction(market, crop, month, year)
            
            # Encode market
            try:
                m_enc = le_market.transform([market])[0]
                features['market_enc'] = m_enc
            except Exception:
                return jsonify({'error': f'Unknown market: {market}'}), 400
            
            # Prepare feature vector with all training features
            feature_columns = [
                'market_enc', 'year', 'month', 'day', 'day_of_year', 'week_of_year', 
                'quarter', 'is_month_start', 'is_month_end', 'price', 'price_ma_7', 
                'price_ma_30', 'price_std_7', 'price_std_30', 'price_min_7', 
                'price_max_7', 'price_range_7', 'price_volatility', 'price_momentum', 
                'price_change_pct', 'market_volume', 'price_trend'
            ]
            
            feature_vector = [features[col] for col in feature_columns]
            
            # XGBoost prediction
            xgb_features = np.array([feature_vector])
            if feature_selector:
                xgb_features = feature_selector.transform(xgb_features)
            
            if hasattr(xgb_model, 'predict_proba'):
                xgb_proba = xgb_model.predict_proba(xgb_features)[0]
                xgb_indices = np.argsort(xgb_proba)[::-1]
                xgb_crops = le_crop.inverse_transform(xgb_indices)
                xgb_scores = xgb_proba[xgb_indices]
            else:
                xgb_pred = xgb_model.predict(xgb_features)
                xgb_crops = le_crop.inverse_transform(xgb_pred)
                xgb_scores = [0.8] * len(xgb_crops)  # Default confidence
            
            # Ensemble prediction if available
            if ensemble_data is not None:
                ensemble_models, ensemble_scaler = ensemble_data
                
                # Scale features for ensemble
                ensemble_features = ensemble_scaler.transform(xgb_features)
                
                # Get ensemble predictions
                ensemble_predictions = []
                ensemble_probabilities = []
                
                for name, model in ensemble_models.items():
                    if name in ['svm', 'lr']:
                        pred = model.predict(ensemble_features)
                        prob = model.predict_proba(ensemble_features)
                    else:
                        pred = model.predict(xgb_features)
                        prob = model.predict_proba(xgb_features)
                    
                    ensemble_predictions.append(pred)
                    ensemble_probabilities.append(prob)
                
                # Weighted ensemble
                weights = [0.3, 0.25, 0.2, 0.15, 0.1]  # XGB, RF, GB, SVM, LR
                ensemble_probs = np.zeros_like(ensemble_probabilities[0])
                for i, prob in enumerate(ensemble_probabilities):
                    ensemble_probs += weights[i] * prob
                
                ensemble_indices = np.argsort(ensemble_probs[0])[::-1]
                ensemble_crops = le_crop.inverse_transform(ensemble_indices)
                ensemble_scores = ensemble_probs[0][ensemble_indices]
                
                # Combine XGBoost and ensemble results
                combined_crops = {}
                for i, crop in enumerate(xgb_crops):
                    combined_crops[crop] = xgb_scores[i] * 0.6  # XGBoost weight
                
                for i, crop in enumerate(ensemble_crops):
                    if crop in combined_crops:
                        combined_crops[crop] += ensemble_scores[i] * 0.4  # Ensemble weight
                    else:
                        combined_crops[crop] = ensemble_scores[i] * 0.4
                
                # Sort by combined scores
                final_crops = sorted(combined_crops.items(), key=lambda x: x[1], reverse=True)
                recommended_crops = [crop for crop, score in final_crops]
                confidence_scores = [score for crop, score in final_crops]
            else:
                recommended_crops = xgb_crops
                confidence_scores = xgb_scores
            
            # Filter by market availability
            allowed = MARKET_CROPS.get(market, None)
            if allowed:
                filtered_crops = []
                filtered_scores = []
                for crop, score in zip(recommended_crops, confidence_scores):
                    if crop in allowed:
                        filtered_crops.append(crop)
                        filtered_scores.append(score)
                recommended_crops = filtered_crops
                confidence_scores = filtered_scores
            
            # Prepare detailed response
            response = {
                'market': market,
                'month': int(month),
                'year': year,
                'recommended_crops': recommended_crops[:top_k],
                'confidence_scores': [float(score) for score in confidence_scores[:top_k]],
                'enhanced': True,
                'model_type': 'ensemble' if ensemble_data else 'xgboost'
            }
            
            return jsonify(response)
            
        except Exception as e:
            return jsonify({'error': f'Prediction error: {str(e)}'}), 500

    else:
        return jsonify({'error': 'Invalid task'}), 400


if __name__ == '__main__':
    print("Starting Enhanced Crop Advisory API...")
    print("Features: Advanced LSTM + Ensemble XGBoost + Enhanced Feature Engineering")
    app.run(debug=True, host='0.0.0.0', port=5000)

