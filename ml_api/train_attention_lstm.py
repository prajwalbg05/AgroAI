import os
import re
import pandas as pd
import numpy as np
from tensorflow.keras.models import Model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Bidirectional, Input, concatenate, BatchNormalization, Attention, MultiHeadAttention, LayerNormalization, GlobalAveragePooling1D
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import RobustScaler
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

SEQ_LENGTH = 60  # Enhanced sequence length
MIN_DATA_POINTS = 100  # Minimum data points required

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
    
    # Multiple time windows
    ma7 = roll_mean(p, 7)
    ma14 = roll_mean(p, 14)
    ma30 = roll_mean(p, 30)
    ma60 = roll_mean(p, 60)
    
    std7 = roll_std(p, 7)
    std14 = roll_std(p, 14)
    std30 = roll_std(p, 30)
    
    min7 = roll_min(p, 7)
    min14 = roll_min(p, 14)
    min30 = roll_min(p, 30)
    
    max7 = roll_max(p, 7)
    max14 = roll_max(p, 14)
    max30 = roll_max(p, 30)
    
    # Price ratios (scale-free features)
    eps = 1e-6
    r_ma7 = p / (ma7 + eps)
    r_ma14 = p / (ma14 + eps)
    r_ma30 = p / (ma30 + eps)
    r_ma60 = p / (ma60 + eps)
    
    # Volatility ratios
    r_std7 = std7 / (ma7 + eps)
    r_std14 = std14 / (ma14 + eps)
    r_std30 = std30 / (ma30 + eps)
    
    # Range ratios
    r_min7 = p / (min7 + eps)
    r_min14 = p / (min14 + eps)
    r_min30 = p / (min30 + eps)
    
    r_max7 = p / (max7 + eps)
    r_max14 = p / (max14 + eps)
    r_max30 = p / (max30 + eps)
    
    # Price momentum (rate of change)
    momentum_1 = np.diff(p, prepend=p[0])
    momentum_3 = pd.Series(p).diff(3).fillna(0).values
    momentum_7 = pd.Series(p).diff(7).fillna(0).values
    
    # Technical indicators
    rsi_14 = calculate_rsi(p, 14)
    bollinger_upper, bollinger_lower = calculate_bollinger_bands(p, 20, 2)
    bollinger_position = (p - bollinger_lower) / (bollinger_upper - bollinger_lower + eps)
    
    # Combine all features
    features = np.column_stack([
        p,  # Original price
        ma7, ma14, ma30, ma60,  # Moving averages
        std7, std14, std30,  # Standard deviations
        min7, min14, min30,  # Minimums
        max7, max14, max30,  # Maximums
        r_ma7, r_ma14, r_ma30, r_ma60,  # Price ratios
        r_std7, r_std14, r_std30,  # Volatility ratios
        r_min7, r_min14, r_min30,  # Min ratios
        r_max7, r_max14, r_max30,  # Max ratios
        momentum_1, momentum_3, momentum_7,  # Momentum
        rsi_14, bollinger_position  # Technical indicators
    ])
    
    return features

def calculate_rsi(prices, window=14):
    """Calculate Relative Strength Index"""
    delta = pd.Series(prices).diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50).values

def calculate_bollinger_bands(prices, window=20, num_std=2):
    """Calculate Bollinger Bands"""
    rolling_mean = pd.Series(prices).rolling(window=window).mean()
    rolling_std = pd.Series(prices).rolling(window=window).std()
    upper_band = rolling_mean + (rolling_std * num_std)
    lower_band = rolling_mean - (rolling_std * num_std)
    return upper_band.fillna(method='bfill').values, lower_band.fillna(method='bfill').values

def create_sequences(feats: np.ndarray, targets: np.ndarray, seq_length: int):
    Xs, ys = [], []
    for i in range(len(feats) - seq_length):
        Xs.append(feats[i:i+seq_length, :])
        ys.append(targets[i+seq_length])
    return np.array(Xs), np.array(ys)

def build_attention_lstm_model(input_dim: int):
    """Build Attention-Enhanced LSTM model with Multi-Head Attention"""
    
    # Input layer
    input_layer = Input(shape=(SEQ_LENGTH, input_dim), name='input_sequence')
    
    # Bidirectional LSTM layers with attention
    lstm1 = Bidirectional(LSTM(128, return_sequences=True, dropout=0.2, recurrent_dropout=0.2))(input_layer)
    lstm1 = LayerNormalization()(lstm1)
    
    lstm2 = Bidirectional(LSTM(64, return_sequences=True, dropout=0.2, recurrent_dropout=0.2))(lstm1)
    lstm2 = LayerNormalization()(lstm2)
    
    # Multi-Head Attention mechanism
    attention_output = MultiHeadAttention(
        num_heads=8, 
        key_dim=64,
        dropout=0.1
    )(lstm2, lstm2)
    
    # Add & Norm (Residual connection)
    attention_output = LayerNormalization()(attention_output + lstm2)
    
    # Additional LSTM layer after attention
    lstm3 = Bidirectional(LSTM(32, return_sequences=True, dropout=0.2, recurrent_dropout=0.2))(attention_output)
    lstm3 = LayerNormalization()(lstm3)
    
    # Global Average Pooling to reduce sequence dimension
    pooled = GlobalAveragePooling1D()(lstm3)
    
    # Dense layers with attention-inspired architecture
    dense1 = Dense(128, activation='relu')(pooled)
    dense1 = BatchNormalization()(dense1)
    dense1 = Dropout(0.3)(dense1)
    
    dense2 = Dense(64, activation='relu')(dense1)
    dense2 = BatchNormalization()(dense2)
    dense2 = Dropout(0.2)(dense2)
    
    dense3 = Dense(32, activation='relu')(dense2)
    dense3 = BatchNormalization()(dense3)
    dense3 = Dropout(0.1)(dense3)
    
    # Output layer
    output = Dense(1, activation='linear', name='price_prediction')(dense3)
    
    model = Model(inputs=input_layer, outputs=output)
    
    # Enhanced optimizer with learning rate scheduling
    optimizer = Adam(learning_rate=0.001, beta_1=0.9, beta_2=0.999, epsilon=1e-8)
    
    model.compile(
        optimizer=optimizer, 
        loss='mse', 
        metrics=['mae', 'mape']
    )
    
    return model

def train_attention_lstm_for_crop(market, crop):
    """Train Attention-Enhanced LSTM model for specific crop"""
    
    prices = load_price_series(market, crop)
    if prices is None or len(prices) < MIN_DATA_POINTS:
        print(f"Not enough data for {market}-{crop} ({len(prices) if prices is not None else 0} rows)")
        return None, None
    
    print(f"Training Attention-Enhanced LSTM for {market}-{crop} with {len(prices)} data points")
    
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
    split_idx = int(len(feats_scaled) * 0.8)  # 80-20 split
    
    train_feats = feats_scaled[:split_idx]
    test_feats = feats_scaled[split_idx - SEQ_LENGTH:]
    train_t = targets[:split_idx]
    test_t = targets[split_idx - SEQ_LENGTH:]
    
    X_train, y_train = create_sequences(train_feats, train_t, SEQ_LENGTH)
    X_test, y_test = create_sequences(test_feats, test_t, SEQ_LENGTH)
    
    if len(X_train) == 0 or len(X_test) == 0:
        print(f"Insufficient sequences for {market}-{crop}")
        return None, None
    
    # Build attention-enhanced model
    model = build_attention_lstm_model(input_dim=feats_scaled.shape[1])
    
    # Enhanced callbacks
    callbacks = [
        EarlyStopping(
            patience=25,  # Increased patience for attention models
            restore_best_weights=True, 
            monitor='val_loss',
            mode='min'
        ),
        ReduceLROnPlateau(
            patience=15,  # Increased patience
            factor=0.3, 
            min_lr=1e-6, 
            monitor='val_loss',
            mode='min'
        ),
        ModelCheckpoint(
            f'best_attention_model_{market}_{crop}.keras',
            monitor='val_loss',
            save_best_only=True,
            mode='min'
        )
    ]
    
    # Enhanced training with more epochs for attention models
    history = model.fit(
        X_train, y_train,
        epochs=150,  # Increased epochs for attention models
        batch_size=16,  # Smaller batch size for better convergence
        validation_split=0.2,
        callbacks=callbacks,
        verbose=1
    )
    
    # Load best model
    if os.path.exists(f'best_attention_model_{market}_{crop}.keras'):
        model.load_weights(f'best_attention_model_{market}_{crop}.keras')
        os.remove(f'best_attention_model_{market}_{crop}.keras')  # Clean up
    
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
    
    print(f"Attention-Enhanced LSTM Results for {market}-{crop}:")
    print(f"  MAPE: {mape:.2f}%")
    print(f"  MAE: {mae:.2f}")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  Directional Accuracy: {directional_accuracy:.2f}%")
    print(f"  Test samples: {len(y_test_inv)}")
    
    # Save model and scalers
    model_path = f'lstm_attention_{market}_{crop}.keras'
    scaler_path = f'lstm_attention_{market}_{crop}_scaler.pkl'
    
    model.save(model_path, include_optimizer=False)
    
    import joblib
    joblib.dump({
        'price_scaler': price_scaler,
        'feature_scaler': feature_scaler
    }, scaler_path)
    
    print(f'Saved attention-enhanced model to {model_path} and scalers to {scaler_path}')
    
    return model, {'price_scaler': price_scaler, 'feature_scaler': feature_scaler}

if __name__ == '__main__':
    print("Training Attention-Enhanced LSTM Models...")
    print("=" * 60)
    
    successful_models = 0
    total_models = 0
    
    for market in MARKETS:
        for crop in CROPS[market]:
            total_models += 1
            print(f"\n--- Training Attention Model for {market}-{crop} ---")
            model, scalers = train_attention_lstm_for_crop(market, crop)
            if model is not None:
                successful_models += 1
            else:
                print(f"Skipped {market}-{crop} due to insufficient data or errors.")
    
    print(f"\n{'='*60}")
    print(f"Training Complete: {successful_models}/{total_models} models trained successfully")
    print("Attention-enhanced models saved with '_attention_' prefix")
