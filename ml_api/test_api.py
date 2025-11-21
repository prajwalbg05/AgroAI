import requests

url = "http://127.0.0.1:5000/predict"
payload = {
    "task": "price_forecast",
    "market": "davangere",
    "crop": "Maize",
    "history": [2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900]
}
response = requests.post(url, json=payload)
print("Status code:", response.status_code)
print("Text:", response.text)
try:
    print("JSON:", response.json())
except Exception as e:
    print("JSON decode error:", e)