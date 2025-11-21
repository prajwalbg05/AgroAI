import os
import re
import glob
import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from sklearn.preprocessing import MinMaxScaler

DATA_DIR = '../data'
MARKETS = ['davangere', 'gangavathi', 'HBhalli', 'hospet']
CROPS = {
    'davangere': ['Cotton', 'Maize', 'Ragi', 'Rice', 'Tomato'],
    'gangavathi': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'HBhalli': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'hospet': ['Maize', 'Ragi', 'Rice', 'Tomato']
}

SEQ_LENGTH = 30
MIN_DATA_POINTS = 120


def find_crop_file(folder: str, crop: str):
    pattern = re.compile(rf'(^|[\W_]){re.escape(crop)}([\W_]|$)', re.IGNORECASE)
    for fname in os.listdir(folder):
        if fname.lower().endswith('.csv') and pattern.search(fname):
            return os.path.join(folder, fname)
    return None


def load_price_series(market, crop):
    folder = os.path.join(DATA_DIR, market)
    fpath = find_crop_file(folder, crop)
    if not fpath:
        print(f"No matching CSV for {market}-{crop}")
        return None
    df = pd.read_csv(fpath)
    price_col = 'Modal Price (Rs./Quintal)'
    date_col = 'Price Date'
    if price_col not in df.columns or date_col not in df.columns:
        print(f"Missing required columns in {fpath}")
        return None
    df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
    df[price_col] = pd.to_numeric(df[price_col], errors='coerce')
    df = df.dropna(subset=[date_col, price_col]).sort_values(date_col)
    # 3-point median smoothing
    prices = df[price_col].rolling(window=3, min_periods=1, center=True).median().values.reshape(-1, 1)
    return prices


def build_features(prices_np: np.ndarray):
    # prices_np shape (N,1)
    p = prices_np.flatten()
    def roll_mean(x, w):
        s = pd.Series(x).rolling(window=w, min_periods=1).mean().values
        return s
    def roll_std(x, w):
        s = pd.Series(x).rolling(window=w, min_periods=2).std(ddof=0).fillna(0).values
        return s
    ma7 = roll_mean(p, 7)
    ma14 = roll_mean(p, 14)
    ma30 = roll_mean(p, 30)
    std7 = roll_std(p, 7)
    std14 = roll_std(p, 14)
    std30 = roll_std(p, 30)
    # ratios (scale-free)
    eps = 1e-6
    r_ma7 = p / (ma7 + eps)
    r_ma14 = p / (ma14 + eps)
    r_ma30 = p / (ma30 + eps)
    r_std7 = std7 / (ma7 + eps)
    r_std14 = std14 / (ma14 + eps)
    r_std30 = std30 / (ma30 + eps)
    feats = np.column_stack([p, r_ma7, r_ma14, r_ma30, r_std7, r_std14, r_std30])
    return feats


def create_sequences(feats: np.ndarray, targets: np.ndarray, seq_length: int):
    Xs, ys = [], []
    for i in range(len(feats) - seq_length):
        Xs.append(feats[i:i+seq_length, :])
        ys.append(targets[i+seq_length])
    return np.array(Xs), np.array(ys)


def build_model(input_dim: int):
    model = Sequential([
        LSTM(96, return_sequences=True, input_shape=(SEQ_LENGTH, input_dim)),
        Dropout(0.2),
        LSTM(48),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mae')
    return model


def train_lstm_for_crop(market, crop):
    prices = load_price_series(market, crop)
    if prices is None or len(prices) < MIN_DATA_POINTS:
        print(f"Not enough data for {market}-{crop} ({len(prices) if prices is not None else 0} rows)")
        return None, None
    price_scaler = MinMaxScaler()
    price_scaled = price_scaler.fit_transform(prices).flatten()
    feats = build_features(prices)
    # replace first column with scaled price
    feats[:, 0] = price_scaled
    targets = price_scaled.reshape(-1, 1)

    split_idx = int(len(feats) * 0.85)
    train_feats = feats[:split_idx]
    test_feats = feats[split_idx - SEQ_LENGTH:]
    train_t = targets[:split_idx]
    test_t = targets[split_idx - SEQ_LENGTH:]

    X_train, y_train = create_sequences(train_feats, train_t, SEQ_LENGTH)
    X_test, y_test = create_sequences(test_feats, test_t, SEQ_LENGTH)

    model = build_model(input_dim=feats.shape[1])
    callbacks = [
        EarlyStopping(patience=10, restore_best_weights=True, monitor='val_loss'),
        ReduceLROnPlateau(patience=5, factor=0.5, min_lr=1e-5, monitor='val_loss')
    ]
    model.fit(X_train, y_train, epochs=60, batch_size=32, validation_split=0.15, callbacks=callbacks, verbose=2)

    y_pred = model.predict(X_test, verbose=0)
    # invert scaling of price channel
    y_test_inv = price_scaler.inverse_transform(y_test)
    y_pred_inv = price_scaler.inverse_transform(y_pred)
    mape = np.mean(np.abs((y_test_inv - y_pred_inv) / np.maximum(1e-6, np.abs(y_test_inv)))) * 100.0
    print(f"Test MAPE for {market}-{crop}: {mape:.2f}% (n={len(y_test_inv)})")

    return model, price_scaler


if __name__ == '__main__':
    for market in MARKETS:
        for crop in CROPS[market]:
            print(f"\n--- Training for {market}-{crop} ---")
            model, scaler = train_lstm_for_crop(market, crop)
            if model:
                model_path = f'lstm_{market}_{crop}.keras'
                scaler_path = f'lstm_{market}_{crop}_scaler.pkl'
                model.save(model_path, include_optimizer=False)
                import joblib
                joblib.dump({'price_scaler': scaler}, scaler_path)
                print(f'Saved model to {model_path} and scaler to {scaler_path}')
            else:
                print(f"Skipped {market}-{crop} due to insufficient data or errors.")
