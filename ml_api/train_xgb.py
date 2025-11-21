import os
import glob
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

DATA_DIR = '../data'
MARKETS = ['davangere', 'gangavathi', 'HBhalli', 'hospet']
CROPS = {
    'davangere': ['Cotton', 'Maize', 'Ragi', 'Rice', 'Tomato'],
    'gangavathi': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'HBhalli': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'hospet': ['Maize', 'Ragi', 'Rice', 'Tomato']
}

# Build a dataset for crop recommendation
rows = []
for market in MARKETS:
    folder = os.path.join(DATA_DIR, market)
    for crop in CROPS[market]:
        files = glob.glob(os.path.join(folder, f'*{crop}*.csv'))
        if not files:
            continue
        df = pd.read_csv(files[0])
        for _, row in df.iterrows():
            # Extract month as a proxy for season
            date = pd.to_datetime(row['Price Date'], errors='coerce')
            if pd.isnull(date):
                continue
            month = date.month
            rows.append({'market': market, 'month': month, 'crop': crop})

# Prepare features and labels
X = pd.DataFrame(rows)
le_market = LabelEncoder()
le_crop = LabelEncoder()
X['market_enc'] = le_market.fit_transform(X['market'])
X['crop_enc'] = le_crop.fit_transform(X['crop'])
X['month'] = X['month'].astype(int)

features = X[['market_enc', 'month']]
labels = X['crop_enc']

X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

model = xgb.XGBClassifier(objective='multi:softmax', num_class=len(le_crop.classes_))
model.fit(X_train, y_train)

# Calculate accuracy
y_pred = model.predict(X_test)
accuracy = (y_pred == y_test).mean()
print(f'XGBoost Model Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)')

joblib.dump(model, 'xgb_crop_recommendation.pkl')
joblib.dump(le_market, 'xgb_le_market.pkl')
joblib.dump(le_crop, 'xgb_le_crop.pkl')
print('XGBoost model and encoders saved.')
