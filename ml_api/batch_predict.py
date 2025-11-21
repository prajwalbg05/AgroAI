import os
import re
import json
import csv
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
import joblib

DATA_DIR = '../data'
MARKETS = ['davangere', 'gangavathi', 'HBhalli', 'hospet']
CROPS = {
    'davangere': ['Cotton', 'Maize', 'Ragi', 'Rice', 'Tomato'],
    'gangavathi': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'HBhalli': ['Cotton', 'Maize', 'Ragi', 'Rice'],
    'hospet': ['Maize', 'Ragi', 'Rice', 'Tomato']
}
SEQ_LENGTH = 10


def find_crop_file(folder: str, crop: str):
    pattern = re.compile(rf'(^|[\W_]){re.escape(crop)}([\W_]|$)', re.IGNORECASE)
    for fname in os.listdir(folder):
        if fname.lower().endswith('.csv') and pattern.search(fname):
            return os.path.join(folder, fname)
    return None


def get_last_10_prices(market: str, crop: str):
    folder = os.path.join(DATA_DIR, market)
    fpath = find_crop_file(folder, crop)
    if not fpath:
        return None, f'CSV not found for {market}-{crop}'
    df = pd.read_csv(fpath)
    price_col = 'Modal Price (Rs./Quintal)'
    date_col = 'Price Date'
    if price_col not in df.columns or date_col not in df.columns:
        return None, f'Missing columns in {fpath}'
    df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
    df[price_col] = pd.to_numeric(df[price_col], errors='coerce')
    df = df.dropna(subset=[date_col, price_col]).sort_values(date_col)
    prices = df[price_col].values.tolist()
    if len(prices) < SEQ_LENGTH:
        return None, f'Only {len(prices)} points'
    return prices[-SEQ_LENGTH:], None


def predict_one(market: str, crop: str):
    model_path_keras = f'lstm_{market}_{crop}.keras'
    scaler_path = f'lstm_{market}_{crop}_scaler.pkl'
    if not (os.path.exists(model_path_keras) and os.path.exists(scaler_path)):
        return None, f'Model/scaler missing'
    history, err = get_last_10_prices(market, crop)
    if err:
        return None, err
    model = load_model(model_path_keras, compile=False)
    scaler = joblib.load(scaler_path)
    seq = np.array(history).reshape(-1, 1)
    seq_scaled = scaler.transform(seq)
    X = seq_scaled.reshape(1, SEQ_LENGTH, 1)
    y_scaled = model.predict(X, verbose=0)
    y = scaler.inverse_transform(y_scaled)[0][0]
    return float(y), None


def main():
    results = []
    for market in MARKETS:
        for crop in CROPS[market]:
            pred, err = predict_one(market, crop)
            results.append({
                'market': market,
                'crop': crop,
                'forecast': pred,
                'error': err
            })
            status = f'{market}-{crop}: ' + (f'{pred:.2f}' if pred is not None else f'ERROR: {err}')
            print(status)

    # Save
    with open('predictions.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    with open('predictions.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['market', 'crop', 'forecast', 'error'])
        writer.writeheader()
        for r in results:
            writer.writerow(r)
    print('Saved predictions to predictions.json and predictions.csv')


if __name__ == '__main__':
    main()
