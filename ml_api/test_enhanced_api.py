#!/usr/bin/env python3
"""
Test script for the enhanced API endpoints
"""

import requests
import json
import time

def test_enhanced_api():
    """Test the enhanced API endpoints"""
    base_url = "http://localhost:5000"
    
    print("🚀 Testing Enhanced API Deployment")
    print("=" * 50)
    
    # Test 1: Health check
    print("1. Testing Health Endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            if data.get('enhanced'):
                print("✅ Enhanced API is active!")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test 2: Price prediction
    print("\n2. Testing Price Prediction...")
    try:
        payload = {
            "task": "price_forecast",
            "market": "davangere", 
            "crop": "Tomato",
            "anchor_price": 1500,
            "history": [[1500], [1520], [1480], [1550], [1490]]  # Sample history
        }
        
        response = requests.post(
            f"{base_url}/predict", 
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Price prediction successful!")
            print(f"   Prediction: ₹{data.get('prediction', 'N/A')}")
            print(f"   Confidence: {data.get('confidence', 'N/A')}")
            print(f"   Model used: {data.get('model_type', 'N/A')}")
        else:
            print(f"❌ Price prediction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Price prediction error: {e}")
    
    # Test 3: Crop recommendation (if available)
    print("\n3. Testing Crop Recommendation...")
    try:
        payload = {
            "task": "crop_recommendation",
            "market": "davangere",
            "month": 6,
            "temperature": 25,
            "humidity": 60,
            "rainfall": 100,
            "soil_type": "red",
            "area": 2.5
        }
        
        response = requests.post(
            f"{base_url}/predict", 
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Crop recommendation successful!")
            print(f"   Recommended crop: {data.get('recommended_crop', 'N/A')}")
            print(f"   Confidence: {data.get('confidence', 'N/A')}")
        else:
            print(f"❌ Crop recommendation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Crop recommendation error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Enhanced API Test Complete!")
    print("=" * 50)

if __name__ == "__main__":
    test_enhanced_api()
