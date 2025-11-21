# 🏗️ AgroAI System Architecture

## **Three-Tier Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   React Frontend│  │  Voice Commands │  │  Mobile Support │  │
│  │   - Multi-lang  │  │  - Speech Rec  │  │  - PWA Ready    │  │
│  │   - Real-time   │  │  - Voice Nav    │  │  - Responsive   │  │
│  │   - Interactive │  │  - 3 Languages  │  │  - Touch UI     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼ HTTP/API Calls
┌─────────────────────────────────────────────────────────────────┐
│                         BUSINESS LAYER                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Express Server │  │  Data Processing│  │  AI Integration │  │
│  │  - REST APIs    │  │  - CSV Parsing  │  │  - OpenAI/Groq  │  │
│  │  - CORS Support │  │  - Web Scraping │  │  - Chat Logic   │  │
│  │  - Error Handle │  │  - Data Cache   │  │  - Context Mgmt │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼ HTTP/API Calls
┌─────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   ML API Server │  │  Model Storage  │  │  Data Sources   │  │
│  │  - Flask API    │  │  - LSTM Models  │  │  - Agmarknet    │  │
│  │  - TensorFlow   │  │  - XGBoost      │  │  - Live Prices  │  │
│  │  - Predictions  │  │  - Scalers      │  │  - Weather API  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## **Data Flow Architecture**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Agmarknet │    │  Live Price │    │   Weather   │    │   User      │
│   CSV Data  │    │   Scraping  │    │     API     │    │   Input     │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA PROCESSING LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │   CSV       │  │   Web       │  │   Weather   │  │   Feature   ││
│  │   Parser    │  │   Scraper   │  │   Parser    │  │ Engineering ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ML MODEL LAYER                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │ Attention  │  │   XGBoost   │  │   Feature   │  │   Model    ││
│  │   LSTM     │  │  Ensemble   │  │   Scaling   │  │  Caching   ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PREDICTION OUTPUT                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │   Price    │  │   Crop      │  │ Confidence │  │   Error     ││
│  │ Prediction │  │Recommendation│  │   Score    │  │  Handling   ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

## **Component Interaction Flow**

```
User Request → Frontend → Backend API → ML API → Model Inference → Response
     │            │           │           │           │            │
     │            │           │           │           │            │
     ▼            ▼           ▼           ▼           ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│  Voice  │  │  React  │  │ Express │  │  Flask  │  │ LSTM/   │  │ JSON    │
│Command  │  │Component│  │  Server │  │   API   │  │XGBoost  │  │Response │
└─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘
     │            │           │           │           │            │
     │            │           │           │           │            │
     └────────────┴───────────┴───────────┴───────────┴────────────┘
```

## **Model Architecture Details**

### **Attention-Enhanced LSTM Model**

```
Input Sequence (60 timesteps × 5 features)
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    INPUT LAYER                              │
│  Shape: (batch_size, 60, 5)                                │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                BIDIRECTIONAL LSTM LAYERS                    │
│  LSTM1: 128 units (forward + backward)                    │
│  LSTM2: 64 units (forward + backward)                     │
│  Output: (batch_size, 60, 128) → (batch_size, 60, 64)    │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                MULTI-HEAD ATTENTION                        │
│  Heads: 8                                                  │
│  Key Dimension: 64                                         │
│  Attention(Q,K,V) = softmax(QK^T/√d_k)V                   │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              RESIDUAL CONNECTION + LAYER NORM             │
│  Output = LayerNorm(Attention + LSTM2)                    │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                FINAL LSTM LAYER                            │
│  LSTM3: 32 units (forward + backward)                     │
│  Output: (batch_size, 60, 32)                             │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│              GLOBAL AVERAGE POOLING                        │
│  Output: (batch_size, 32)                                 │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DENSE LAYERS                            │
│  Dense1: 128 units (ReLU)                                 │
│  Dense2: 64 units (ReLU)                                  │
│  Dense3: 32 units (ReLU)                                  │
│  Output: 1 unit (Linear) - Price Prediction               │
└─────────────────────────────────────────────────────────────┘
```

## **Feature Engineering Pipeline**

```
Raw Price Data
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    PREPROCESSING                           │
│  • Outlier Detection (IQR method)                          │
│  • Savitzky-Golay Smoothing                               │
│  • Robust Scaling                                         │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                 FEATURE ENGINEERING                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Price    │  │ Technical   │  │ Statistical │        │
│  │  Features  │  │Indicators  │  │  Features   │        │
│  │            │  │            │  │            │        │
│  │• Raw Price │  │• RSI       │  │• Volatility │        │
│  │• MA(7,14,30)│  │• Bollinger │  │• Momentum   │        │
│  │• Price Diff│  │• MACD      │  │• Seasonality│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    SEQUENCE CREATION                       │
│  • Sliding Window: 60 timesteps                            │
│  • Feature Matrix: (samples, 60, 5)                       │
│  • Target: Next day price                                 │
└─────────────────────────────────────────────────────────────┘
```

## **API Endpoint Structure**

```
Frontend (Port 3000)
    │
    ├── / (Home Page)
    ├── /live-prices (Price Tracking)
    ├── /price-prediction (AI Predictions)
    └── /crop-advisory (Recommendations)
           │
           ▼
Backend API (Port 4000)
    │
    ├── GET  /api/prices/live
    ├── GET  /api/history/:market/:crop
    ├── POST /api/predict
    ├── GET  /api/recommendations
    ├── POST /api/chat
    ├── POST /chat (Groq)
    └── GET  /api/weather
           │
           ▼
ML API (Port 5000)
    │
    ├── POST /predict (Price Forecast)
    ├── POST /predict (Crop Recommendation)
    ├── GET  /health
    └── Model Loading & Caching
```

## **Deployment Configuration**

```
Production Environment
┌─────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER                           │
│  • Nginx/HAProxy                                           │
│  • SSL Termination                                        │
│  • Rate Limiting                                          │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVERS                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Frontend   │  │   Backend   │  │    ML API   │        │
│  │  (React)    │  │  (Node.js)  │  │  (Python)  │        │
│  │  Port 3000  │  │  Port 4000  │  │  Port 5000 │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA STORAGE                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Model     │  │   Cache     │  │   Logs      │        │
│  │  Storage    │  │  (Redis)    │  │  (Files)    │        │
│  │  (Files)    │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

This architecture provides a scalable, maintainable, and efficient system for agricultural decision-making with AI-powered insights.
