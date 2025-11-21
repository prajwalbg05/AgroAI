import os
import glob
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.feature_selection import SelectKBest, f_classif
import joblib
import warnings
warnings.filterwarnings('ignore')

# Try to import Optuna for hyperparameter optimization
try:
    import optuna
    OPTUNA_AVAILABLE = True
except ImportError:
    OPTUNA_AVAILABLE = False
    print("Optuna not available. Install with: pip install optuna")

DATA_DIR = '../data'
MARKETS = ['davangere', 'gangavathi', 'HBhalli', 'hospet']
CROPS = {
    'davangere': ['Cotton', 'Maize', 'Ragi', 'Rice', 'Tomato'],
    'gangavathi': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'HBhalli': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'hospet': ['Maize', 'Ragi', 'Rice', 'Tomato']
}


def build_enhanced_dataset():
    """Build enhanced dataset with advanced feature engineering"""
    rows = []
    
    for market in MARKETS:
        folder = os.path.join(DATA_DIR, market)
        for crop in CROPS[market]:
            files = glob.glob(os.path.join(folder, f'*{crop}*.csv'))
            if not files:
                continue
            
            df = pd.read_csv(files[0])
            df['Price Date'] = pd.to_datetime(df['Price Date'], errors='coerce')
            df = df.dropna(subset=['Price Date'])
            
            # Extract temporal features
            df['year'] = df['Price Date'].dt.year
            df['month'] = df['Price Date'].dt.month
            df['day'] = df['Price Date'].dt.day
            df['day_of_year'] = df['Price Date'].dt.dayofyear
            df['week_of_year'] = df['Price Date'].dt.isocalendar().week
            df['quarter'] = df['Price Date'].dt.quarter
            df['is_month_start'] = df['Price Date'].dt.is_month_start.astype(int)
            df['is_month_end'] = df['Price Date'].dt.is_month_end.astype(int)
            
            # Price features
            df['price'] = pd.to_numeric(df['Modal Price (Rs./Quintal)'], errors='coerce')
            df = df.dropna(subset=['price'])
            
            # Advanced price features
            df['price_ma_7'] = df['price'].rolling(window=7, min_periods=1).mean()
            df['price_ma_30'] = df['price'].rolling(window=30, min_periods=1).mean()
            df['price_std_7'] = df['price'].rolling(window=7, min_periods=1).std()
            df['price_std_30'] = df['price'].rolling(window=30, min_periods=1).std()
            df['price_min_7'] = df['price'].rolling(window=7, min_periods=1).min()
            df['price_max_7'] = df['price'].rolling(window=7, min_periods=1).max()
            df['price_range_7'] = df['price_max_7'] - df['price_min_7']
            df['price_volatility'] = df['price_std_7'] / df['price_ma_7']
            df['price_momentum'] = df['price'] - df['price'].shift(1)
            df['price_change_pct'] = df['price'].pct_change()
            
            # Market-specific features
            df['market_volume'] = len(df)  # Proxy for market activity
            df['price_trend'] = df['price'].rolling(window=14, min_periods=1).apply(
                lambda x: 1 if x.iloc[-1] > x.iloc[0] else -1, raw=False
            )
            
            for _, row in df.iterrows():
                if pd.notna(row['month']):
                    rows.append({
                        'market': market,
                        'crop': crop,
                        'year': row['year'],
                        'month': row['month'],
                        'day': row['day'],
                        'day_of_year': row['day_of_year'],
                        'week_of_year': row['week_of_year'],
                        'quarter': row['quarter'],
                        'is_month_start': row['is_month_start'],
                        'is_month_end': row['is_month_end'],
                        'price': row['price'],
                        'price_ma_7': row['price_ma_7'],
                        'price_ma_30': row['price_ma_30'],
                        'price_std_7': row['price_std_7'],
                        'price_std_30': row['price_std_30'],
                        'price_min_7': row['price_min_7'],
                        'price_max_7': row['price_max_7'],
                        'price_range_7': row['price_range_7'],
                        'price_volatility': row['price_volatility'],
                        'price_momentum': row['price_momentum'],
                        'price_change_pct': row['price_change_pct'],
                        'market_volume': row['market_volume'],
                        'price_trend': row['price_trend']
                    })
    
    return pd.DataFrame(rows)


def optimize_xgb_hyperparameters(X, y):
    """Optimize XGBoost hyperparameters using Optuna or grid search"""
    
    def objective(trial):
        params = {
            'objective': 'multi:softmax',
            'num_class': len(np.unique(y)),
            'n_estimators': trial.suggest_int('n_estimators', 100, 1000),
            'max_depth': trial.suggest_int('max_depth', 3, 10),
            'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3),
            'subsample': trial.suggest_float('subsample', 0.6, 1.0),
            'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
            'reg_alpha': trial.suggest_float('reg_alpha', 0, 10),
            'reg_lambda': trial.suggest_float('reg_lambda', 0, 10),
            'random_state': 42,
            'n_jobs': -1
        }
        
        model = xgb.XGBClassifier(**params)
        cv_scores = cross_val_score(model, X, y, cv=3, scoring='accuracy')
        return cv_scores.mean()
    
    if OPTUNA_AVAILABLE:
        study = optuna.create_study(direction='maximize')
        study.optimize(objective, n_trials=50)
        return study.best_params
    else:
        # Fallback to good default parameters
        return {
            'objective': 'multi:softmax',
            'num_class': len(np.unique(y)),
            'n_estimators': 500,
            'max_depth': 6,
            'learning_rate': 0.1,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'reg_alpha': 1,
            'reg_lambda': 1,
            'random_state': 42,
            'n_jobs': -1
        }


def create_ensemble_model(X, y):
    """Create ensemble model with multiple algorithms"""
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train multiple models
    models = {
        'xgb': xgb.XGBClassifier(
            objective='multi:softmax',
            num_class=len(np.unique(y)),
            n_estimators=500,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=1,
            reg_lambda=1,
            random_state=42,
            n_jobs=-1
        ),
        'rf': RandomForestClassifier(
            n_estimators=300,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        ),
        'gb': GradientBoostingClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            random_state=42
        ),
        'svm': SVC(
            kernel='rbf',
            C=1.0,
            gamma='scale',
            probability=True,
            random_state=42
        ),
        'lr': LogisticRegression(
            max_iter=1000,
            random_state=42,
            n_jobs=-1
        )
    }
    
    # Train models
    trained_models = {}
    for name, model in models.items():
        if name == 'svm' or name == 'lr':
            model.fit(X_train_scaled, y_train)
        else:
            model.fit(X_train, y_train)
        trained_models[name] = model
    
    # Create ensemble predictions
    def ensemble_predict(X_data, X_data_scaled):
        predictions = []
        probabilities = []
        
        for name, model in trained_models.items():
            if name == 'svm' or name == 'lr':
                pred = model.predict(X_data_scaled)
                prob = model.predict_proba(X_data_scaled)
            else:
                pred = model.predict(X_data)
                prob = model.predict_proba(X_data)
            
            predictions.append(pred)
            probabilities.append(prob)
        
        # Weighted voting based on individual model performance
        weights = [0.3, 0.25, 0.2, 0.15, 0.1]  # XGB, RF, GB, SVM, LR
        
        # Weighted probability ensemble
        ensemble_probs = np.zeros_like(probabilities[0])
        for i, prob in enumerate(probabilities):
            ensemble_probs += weights[i] * prob
        
        ensemble_pred = np.argmax(ensemble_probs, axis=1)
        return ensemble_pred, ensemble_probs
    
    # Evaluate ensemble
    ensemble_pred, ensemble_probs = ensemble_predict(X_test, X_test_scaled)
    ensemble_accuracy = accuracy_score(y_test, ensemble_pred)
    
    print("Individual Model Accuracies:")
    for name, model in trained_models.items():
        if name == 'svm' or name == 'lr':
            pred = model.predict(X_test_scaled)
        else:
            pred = model.predict(X_test)
        acc = accuracy_score(y_test, pred)
        print(f"  {name.upper()}: {acc:.4f} ({acc*100:.2f}%)")
    
    print(f"Ensemble Accuracy: {ensemble_accuracy:.4f} ({ensemble_accuracy*100:.2f}%)")
    
    return trained_models, scaler, ensemble_accuracy


def main():
    print("Building Enhanced Crop Recommendation Dataset...")
    print("=" * 60)
    
    # Build enhanced dataset
    df = build_enhanced_dataset()
    print(f"Dataset shape: {df.shape}")
    print(f"Features: {df.columns.tolist()}")
    
    # Prepare features and labels
    le_market = LabelEncoder()
    le_crop = LabelEncoder()
    
    # Encode categorical variables
    df['market_enc'] = le_market.fit_transform(df['market'])
    df['crop_enc'] = le_crop.fit_transform(df['crop'])
    
    # Select features
    feature_columns = [
        'market_enc', 'year', 'month', 'day', 'day_of_year', 'week_of_year', 
        'quarter', 'is_month_start', 'is_month_end', 'price', 'price_ma_7', 
        'price_ma_30', 'price_std_7', 'price_std_30', 'price_min_7', 
        'price_max_7', 'price_range_7', 'price_volatility', 'price_momentum', 
        'price_change_pct', 'market_volume', 'price_trend'
    ]
    
    X = df[feature_columns].fillna(0)
    y = df['crop_enc']
    
    print(f"Feature matrix shape: {X.shape}")
    print(f"Target distribution:\n{y.value_counts().sort_index()}")
    
    # Feature selection
    selector = SelectKBest(score_func=f_classif, k=15)
    X_selected = selector.fit_transform(X, y)
    
    selected_features = [feature_columns[i] for i in selector.get_support(indices=True)]
    print(f"Selected features: {selected_features}")
    
    # Optimize hyperparameters
    print("\nOptimizing XGBoost hyperparameters...")
    best_params = optimize_xgb_hyperparameters(X_selected, y)
    print(f"Best parameters: {best_params}")
    
    # Train optimized XGBoost model
    print("\nTraining optimized XGBoost model...")
    xgb_model = xgb.XGBClassifier(**best_params)
    xgb_model.fit(X_selected, y)
    
    # Cross-validation
    cv_scores = cross_val_score(xgb_model, X_selected, y, cv=5, scoring='accuracy')
    print(f"XGBoost CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Create ensemble model
    print("\nTraining ensemble model...")
    ensemble_models, scaler, ensemble_acc = create_ensemble_model(X_selected, y)
    
    # Save models and encoders
    print("\nSaving models...")
    joblib.dump(xgb_model, 'xgb_enhanced_crop_recommendation.pkl')
    joblib.dump(ensemble_models, 'ensemble_crop_recommendation.pkl')
    joblib.dump(scaler, 'ensemble_scaler.pkl')
    joblib.dump(le_market, 'xgb_le_market.pkl')
    joblib.dump(le_crop, 'xgb_le_crop.pkl')
    joblib.dump(selector, 'feature_selector.pkl')
    joblib.dump(selected_features, 'selected_features.pkl')
    
    print(f"Enhanced XGBoost Accuracy: {cv_scores.mean():.4f} ({cv_scores.mean()*100:.2f}%)")
    print(f"Ensemble Model Accuracy: {ensemble_acc:.4f} ({ensemble_acc*100:.2f}%)")
    print("Enhanced models saved successfully!")


if __name__ == '__main__':
    main()

