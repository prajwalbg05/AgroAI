
import os
import re
import glob
import pandas as pd
import numpy as np
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional, Conv1D, MaxPooling1D, Flatten, Input, concatenate, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import MinMaxScaler, RobustScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

DATA_DIR = '../data'
MARKETS = ['davangere', 'gangavathi', 'HBhalli', 'hospet']
CROPS = {
    'davangere': ['Cotton', 'Maize', 'Ragi', 'Rice', 'Tomato'],
    'gangavathi': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'HBhalli': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'hospet': ['Maize', 'Ragi', 'Rice', 'Tomato']
}

SEQ_LENGTH = 60  # Increased sequence length for better context
MIN_DATA_POINTS = 100  # Reduced minimum data points


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
    
    # Enhanced data preprocessing
    prices = df[price_col].values
    
    # Outlier detection and removal using IQR
    Q1 = np.percentile(prices, 25)
    Q3 = np.percentile(prices, 75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    # Remove outliers but keep track of indices
    mask = (prices >= lower_bound) & (prices <= upper_bound)
    prices_clean = prices[mask]
    
    # If too many outliers removed, use original data
    if len(prices_clean) < len(prices) * 0.7:
        prices_clean = prices
        print(f"Warning: Too many outliers detected for {market}-{crop}, using original data")
    
    # Advanced smoothing: Savitzky-Golay filter if enough data points
    if len(prices_clean) > 10:
        from scipy.signal import savgol_filter
        window_length = min(11, len(prices_clean) if len(prices_clean) % 2 == 1 else len(prices_clean) - 1)
        if window_length >= 5:
            prices_clean = savgol_filter(prices_clean, window_length, 3)
    
    return prices_clean.reshape(-1, 1)


def build_advanced_features(prices_np: np.ndarray):
    """Enhanced feature engineering with more sophisticated features"""
    p = prices_np.flatten()
    
    def roll_mean(x, w):
        return pd.Series(x).rolling(window=w, min_periods=1).mean().values
    
    def roll_std(x, w):
        return pd.Series(x).rolling(window=w, min_periods=2).std(ddof=0).fillna(0).values
    
    def roll_min(x, w):
        return pd.Series(x).rolling(window=w, min_periods=1).min().values
    
    def roll_max(x, w):
        return pd.Series(x).rolling(window=w, min_periods=1).max().values
    
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
    trend_features = []
    for i in range(1, len(p)):
        trend_features.append(p[i] - p[i-1])
    trend_features = np.array([0] + trend_features)  # Add 0 for first element
    
    # Momentum features
    momentum_features = []
    for w in [3, 7, 14]:
        if w <= len(p):
            momentum = pd.Series(p).diff(w).fillna(0).values
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


def create_sequences(feats: np.ndarray, targets: np.ndarray, seq_length: int):
    Xs, ys = [], []
    for i in range(len(feats) - seq_length):
        Xs.append(feats[i:(i + seq_length)])
        ys.append(targets[i + seq_length])
    return np.array(Xs), np.array(ys)


def build_hybrid_model(input_dim: int):
    """Enhanced hybrid model with CNN + Bidirectional LSTM"""
    
    # Input layer
    input_layer = Input(shape=(SEQ_LENGTH, input_dim))
    
    # CNN branch for local pattern detection
    conv1 = Conv1D(filters=64, kernel_size=3, activation='relu', padding='same')(input_layer)
    conv1 = BatchNormalization()(conv1)
    conv1 = Dropout(0.2)(conv1)
    
    conv2 = Conv1D(filters=32, kernel_size=5, activation='relu', padding='same')(conv1)
    conv2 = BatchNormalization()(conv2)
    conv2 = Dropout(0.2)(conv2)
    
    maxpool = MaxPooling1D(pool_size=2)(conv2)
    
    # LSTM branch for sequential pattern detection
    lstm1 = Bidirectional(LSTM(128, return_sequences=True, dropout=0.2, recurrent_dropout=0.2))(maxpool)
    lstm1 = BatchNormalization()(lstm1)
    
    lstm2 = Bidirectional(LSTM(64, return_sequences=True, dropout=0.2, recurrent_dropout=0.2))(lstm1)
    lstm2 = BatchNormalization()(lstm2)
    
    lstm3 = LSTM(32, dropout=0.2, recurrent_dropout=0.2)(lstm2)
    lstm3 = BatchNormalization()(lstm3)
    
    # Dense layers
    dense1 = Dense(64, activation='relu')(lstm3)
    dense1 = BatchNormalization()(dense1)
    dense1 = Dropout(0.3)(dense1)
    
    dense2 = Dense(32, activation='relu')(dense1)
    dense2 = BatchNormalization()(dense2)
    dense2 = Dropout(0.2)(dense2)
    
    output = Dense(1, activation='linear')(dense2)
    
    model = Model(inputs=input_layer, outputs=output)
    
    # Enhanced optimizer with learning rate scheduling
    optimizer = Adam(learning_rate=0.001, beta_1=0.9, beta_2=0.999, epsilon=1e-8)
    
    model.compile(optimizer=optimizer, loss='mse', metrics=['mae', 'mape'])
    
    return model


def train_enhanced_lstm_for_crop(market, crop):
    """Enhanced training function with better data handling and validation"""
    
    prices = load_price_series(market, crop)
    if prices is None or len(prices) < MIN_DATA_POINTS:
        print(f"Not enough data for {market}-{crop} ({len(prices) if prices is not None else 0} rows)")
        return None, None
    
    print(f"Training enhanced model for {market}-{crop} with {len(prices)} data points")
    
    # Use RobustScaler for better outlier handling
    price_scaler = RobustScaler()
    price_scaled = price_scaler.fit_transform(prices).flatten()
    
    # Build advanced features
    feats = build_advanced_features(prices)
    
    # Scale features
    feature_scaler = RobustScaler()
    feats_scaled = feature_scaler.fit_transform(feats)
    
    # Replace first column with scaled price
    feats_scaled[:, 0] = price_scaled
    targets = price_scaled.reshape(-1, 1)
    
    # Better train-test split with time series considerations
    split_idx = int(len(feats_scaled) * 0.8)  # 80-20 split for more training data
    
    train_feats = feats_scaled[:split_idx]
    test_feats = feats_scaled[split_idx - SEQ_LENGTH:]
    train_t = targets[:split_idx]
    test_t = targets[split_idx - SEQ_LENGTH:]
    
    X_train, y_train = create_sequences(train_feats, train_t, SEQ_LENGTH)
    X_test, y_test = create_sequences(test_feats, test_t, SEQ_LENGTH)
    
    if len(X_train) == 0 or len(X_test) == 0:
        print(f"Insufficient sequences for {market}-{crop}")
        return None, None
    
    # Build enhanced model
    model = build_hybrid_model(input_dim=feats_scaled.shape[1])
    
    # Enhanced callbacks
    callbacks = [
        EarlyStopping(
            patience=20, 
            restore_best_weights=True, 
            monitor='val_loss',
            mode='min'
        ),
        ReduceLROnPlateau(
            patience=10, 
            factor=0.3, 
            min_lr=1e-6, 
            monitor='val_loss',
            mode='min'
        ),
        ModelCheckpoint(
            f'best_model_{market}_{crop}.keras',
            monitor='val_loss',
            save_best_only=True,
            mode='min'
        )
    ]
    
    # Enhanced training with more epochs and better validation
    history = model.fit(
        X_train, y_train,
        epochs=100,  # Increased epochs
        batch_size=16,  # Smaller batch size for better convergence
        validation_split=0.2,
        callbacks=callbacks,
        verbose=1
    )
    
    # Load best model
    if os.path.exists(f'best_model_{market}_{crop}.keras'):
        model.load_weights(f'best_model_{market}_{crop}.keras')
        os.remove(f'best_model_{market}_{crop}.keras')  # Clean up
    
    # Enhanced evaluation
    y_pred = model.predict(X_test, verbose=0)
    
    # Invert scaling
    y_test_inv = price_scaler.inverse_transform(y_test)
    y_pred_inv = price_scaler.inverse_transform(y_pred)
    
    # Calculate multiple metrics
    mape = np.mean(np.abs((y_test_inv - y_pred_inv) / np.maximum(1e-6, np.abs(y_test_inv)))) * 100.0
    mae = mean_absolute_error(y_test_inv, y_pred_inv)
    mse = mean_squared_error(y_test_inv, y_pred_inv)
    rmse = np.sqrt(mse)
    
    # Calculate directional accuracy (trend prediction accuracy)
    actual_direction = np.diff(y_test_inv.flatten())
    predicted_direction = np.diff(y_pred_inv.flatten())
    directional_accuracy = np.mean(np.sign(actual_direction) == np.sign(predicted_direction)) * 100
    
    print(f"Enhanced Test Results for {market}-{crop}:")
    print(f"  MAPE: {mape:.2f}%")
    print(f"  MAE: {mae:.2f}")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  Directional Accuracy: {directional_accuracy:.2f}%")
    print(f"  Test samples: {len(y_test_inv)}")
    
    # Save model and scalers
    model_path = f'lstm_enhanced_{market}_{crop}.keras'
    scaler_path = f'lstm_enhanced_{market}_{crop}_scaler.pkl'
    feature_scaler_path = f'lstm_enhanced_{market}_{crop}_feature_scaler.pkl'
    
    model.save(model_path, include_optimizer=False)
    
    import joblib
    joblib.dump({
        'price_scaler': price_scaler,
        'feature_scaler': feature_scaler
    }, scaler_path)
    
    print(f'Saved enhanced model to {model_path} and scalers to {scaler_path}')
    
    return model, {'price_scaler': price_scaler, 'feature_scaler': feature_scaler}


if __name__ == '__main__':
    print("Training Enhanced LSTM Models with Advanced Architecture...")
    print("=" * 60)
    
    successful_models = 0
    total_models = 0
    
    for market in MARKETS:
        for crop in CROPS[market]:
            total_models += 1
            print(f"\n--- Training Enhanced Model for {market}-{crop} ---")
            
            try:
                model, scalers = train_enhanced_lstm_for_crop(market, crop)
                if model is not None:
                    successful_models += 1
            except Exception as e:
                print(f"Error training {market}-{crop}: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"Training Complete: {successful_models}/{total_models} models trained successfully")
    print("Enhanced models saved with '_enhanced_' prefix")
