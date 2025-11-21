import requests
import json
import time

# Test the attention-enhanced API
API_URL = "http://127.0.0.1:5000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{API_URL}/health")
        print("🔍 Health Check:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_price_prediction(market, crop, anchor_price=None):
    """Test price prediction with attention models"""
    try:
        payload = {
            "task": "price_forecast",
            "market": market,
            "crop": crop,
            "anchor_price": anchor_price
        }
        
        print(f"\n🔮 Testing Price Prediction for {market}-{crop}:")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{API_URL}/predict", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Prediction successful!")
            print(f"Predicted Price: ₹{result['prediction']:.2f}")
            print(f"Model Type: {result['model_type']}")
            print(f"Confidence: {result['confidence']}")
            return True
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        return False

def test_crop_recommendation(market, month=None):
    """Test crop recommendation"""
    try:
        payload = {
            "task": "crop_recommendation",
            "market": market,
            "month": month
        }
        
        print(f"\n🌾 Testing Crop Recommendation for {market}:")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(f"{API_URL}/predict", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Recommendation successful!")
            print(f"Model Type: {result['model_type']}")
            print("Recommendations:")
            for rec in result['recommendations']:
                print(f"  - {rec['crop']}: {rec['probability']:.2%} ({rec['confidence']})")
            return True
        else:
            print(f"❌ Recommendation failed: {response.status_code}")
            print(f"Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"❌ Recommendation error: {e}")
        return False

def main():
    print("🚀 Testing Attention-Enhanced LSTM API")
    print("=" * 50)
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    
    # Test health
    if not test_health():
        print("❌ Server not responding. Please check if the API is running.")
        return
    
    print("\n" + "=" * 50)
    print("🧪 Running Attention-Enhanced Model Tests")
    print("=" * 50)
    
    # Test cases for price predictions
    test_cases = [
        ("davangere", "Cotton", 5500),
        ("davangere", "Rice", 4500),
        ("davangere", "Tomato", 2000),
        ("HBhalli", "Maize", 1800),
        ("HBhalli", "Ragi", 2200),
        ("hospet", "Rice", 4200),
        ("hospet", "Tomato", 1500),
        ("gangavathi", "Maize", 1900),
        ("gangavathi", "Rice", 4400)
    ]
    
    successful_predictions = 0
    total_predictions = len(test_cases)
    
    for market, crop, anchor_price in test_cases:
        if test_price_prediction(market, crop, anchor_price):
            successful_predictions += 1
        time.sleep(1)  # Small delay between requests
    
    # Test crop recommendations
    print("\n" + "=" * 50)
    print("🌾 Testing Crop Recommendations")
    print("=" * 50)
    
    recommendation_tests = [
        ("davangere", 6),  # June
        ("HBhalli", 9),    # September
        ("hospet", 12),    # December
    ]
    
    successful_recommendations = 0
    total_recommendations = len(recommendation_tests)
    
    for market, month in recommendation_tests:
        if test_crop_recommendation(market, month):
            successful_recommendations += 1
        time.sleep(1)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    print(f"✅ Successful Predictions: {successful_predictions}/{total_predictions}")
    print(f"✅ Successful Recommendations: {successful_recommendations}/{total_recommendations}")
    
    if successful_predictions == total_predictions and successful_recommendations == total_recommendations:
        print("🎉 All tests passed! Attention-enhanced models are working perfectly!")
    else:
        print("⚠️  Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    main()
