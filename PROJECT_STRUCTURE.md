# AgroAI Project Structure

Complete file structure and organization of the AgroAI Agricultural AI Platform.

```
F:\NEW CROP ADVISORY/
│
├── 📁 frontend/                    # Main frontend application bundle
│   ├── 📄 index.html               # Application shell
│   ├── 📄 styles.css               # Primary stylesheet
│   ├── 📄 script_attention.js      # Frontend logic + data fetching
│   └── 📄 translations.js          # Multi-language dictionary
├── 📄 README.md                     # Project documentation
├── 📄 COMPLETE_DEPLOYMENT_GUIDE.md  # Complete deployment instructions
├── 📄 PROJECT_STRUCTURE.md         # This file
├── 📄 package.json                  # Root package.json for Vercel
├── 📄 vercel.json                   # Vercel deployment configuration
│
├── 📁 .vscode/                      # VS Code configuration
│   ├── settings.json                # VS Code settings (Code Runner config)
│   └── launch.json                  # Debug configurations
│
├── 📁 .git/                         # Git repository (version control)
│
├── 📁 api/                          # Vercel serverless functions
│   └── index.js                     # Serverless wrapper for Express backend
│
├── 📁 backend/                       # Node.js Express Backend API
│   ├── 📄 server.js                 # Main Express server
│   ├── 📄 package.json              # Node.js dependencies
│   ├── 📄 package-lock.json         # Dependency lock file
│   ├── 📄 chatController.js         # GPT chat controller
│   ├── 📄 groqChatController.js      # Groq AI chat controller
│   ├── 📄 firebase.js               # Firebase configuration (if used)
│   ├── 📄 .env                      # Environment variables (local, not in git)
│   │
│   └── 📁 Model Files (LSTM models for backend)/
│       ├── lstm_davangere_Cotton.keras
│       ├── lstm_davangere_Cotton_scaler.pkl
│       ├── lstm_davangere_Maize.keras
│       ├── lstm_davangere_Maize_scaler.pkl
│       ├── lstm_davangere_Ragi.keras
│       ├── lstm_davangere_Ragi_scaler.pkl
│       ├── lstm_davangere_Rice.keras
│       ├── lstm_davangere_Rice_scaler.pkl
│       ├── lstm_davangere_Tomato.keras
│       ├── lstm_davangere_Tomato_scaler.pkl
│       ├── lstm_gangavathi_Maize.keras
│       ├── lstm_gangavathi_Maize_scaler.pkl
│       ├── lstm_gangavathi_Rice.keras
│       ├── lstm_gangavathi_Rice_scaler.pkl
│       ├── lstm_HBhalli_Maize.keras
│       ├── lstm_HBhalli_Maize_scaler.pkl
│       ├── lstm_HBhalli_Ragi.keras
│       ├── lstm_HBhalli_Ragi_scaler.pkl
│       ├── lstm_hospet_Tomato.keras
│       └── lstm_hospet_Tomato_scaler.pkl
│
├── 📁 ml_api/                        # Python Flask ML API
│   ├── 📄 app_attention.py          # Main Flask application (Attention-Enhanced LSTM)
│   ├── 📄 app.py                     # Alternative Flask app
│   ├── 📄 app_enhanced.py            # Enhanced Flask app
│   ├── 📄 requirements.txt           # Python dependencies
│   ├── 📄 runtime.txt                # Python version specification
│   ├── 📄 Procfile                   # Process file for Railway/Heroku
│   ├── 📄 Dockerfile                 # Docker container configuration
│   ├── 📄 .dockerignore             # Docker ignore patterns
│   ├── 📄 build.sh                   # Build script
│   ├── 📄 oci-deploy.sh              # Oracle Cloud deployment script
│   │
│   ├── 📄 DEPLOYMENT.md              # ML API deployment guide (Render/Railway)
│   ├── 📄 OCI_DEPLOYMENT.md          # Oracle Cloud deployment guide
│   ├── 📄 OCI_QUICK_START.md         # OCI quick start guide
│   ├── 📄 STEP_BY_STEP_DEPLOYMENT.md # Detailed step-by-step OCI guide
│   │
│   ├── 📄 render.yaml                # Render.com configuration
│   │
│   ├── 📁 Model Files (LSTM Models)/
│   │   ├── 📄 ensemble_crop_recommendation.pkl    # Ensemble model for crop recommendations
│   │   ├── 📄 ensemble_scaler.pkl                 # Ensemble scaler
│   │   ├── 📄 feature_selector.pkl                # Feature selector
│   │   ├── 📄 selected_features.pkl               # Selected features
│   │   │
│   │   ├── 📁 Attention LSTM Models/
│   │   │   ├── lstm_attention_davangere_Cotton.keras
│   │   │   ├── lstm_attention_davangere_Cotton_scaler.pkl
│   │   │   ├── lstm_attention_davangere_Maize.keras
│   │   │   ├── lstm_attention_davangere_Maize_scaler.pkl
│   │   │   ├── lstm_attention_davangere_Ragi.keras
│   │   │   ├── lstm_attention_davangere_Ragi_scaler.pkl
│   │   │   ├── lstm_attention_davangere_Rice.keras
│   │   │   ├── lstm_attention_davangere_Rice_scaler.pkl
│   │   │   ├── lstm_attention_davangere_Tomato.keras
│   │   │   ├── lstm_attention_davangere_Tomato_scaler.pkl
│   │   │   ├── lstm_attention_gangavathi_Maize.keras
│   │   │   ├── lstm_attention_gangavathi_Maize_scaler.pkl
│   │   │   ├── lstm_attention_gangavathi_Rice.keras
│   │   │   ├── lstm_attention_gangavathi_Rice_scaler.pkl
│   │   │   ├── lstm_attention_HBhalli_Maize.keras
│   │   │   ├── lstm_attention_HBhalli_Maize_scaler.pkl
│   │   │   ├── lstm_attention_HBhalli_Ragi.keras
│   │   │   ├── lstm_attention_HBhalli_Ragi_scaler.pkl
│   │   │   ├── lstm_attention_hospet_Rice.keras
│   │   │   ├── lstm_attention_hospet_Rice_scaler.pkl
│   │   │   ├── lstm_attention_hospet_Tomato.keras
│   │   │   └── lstm_attention_hospet_Tomato_scaler.pkl
│   │   │
│   │   ├── 📁 Enhanced LSTM Models/
│   │   │   ├── lstm_enhanced_davangere_Cotton.keras
│   │   │   ├── lstm_enhanced_davangere_Cotton_scaler.pkl
│   │   │   ├── lstm_enhanced_davangere_Maize.keras
│   │   │   ├── lstm_enhanced_davangere_Maize_scaler.pkl
│   │   │   ├── lstm_enhanced_davangere_Ragi.keras
│   │   │   ├── lstm_enhanced_davangere_Ragi_scaler.pkl
│   │   │   ├── lstm_enhanced_davangere_Rice.keras
│   │   │   ├── lstm_enhanced_davangere_Rice_scaler.pkl
│   │   │   ├── lstm_enhanced_davangere_Tomato.keras
│   │   │   ├── lstm_enhanced_davangere_Tomato_scaler.pkl
│   │   │   ├── lstm_enhanced_gangavathi_Maize.keras
│   │   │   ├── lstm_enhanced_gangavathi_Maize_scaler.pkl
│   │   │   ├── lstm_enhanced_gangavathi_Rice.keras
│   │   │   ├── lstm_enhanced_gangavathi_Rice_scaler.pkl
│   │   │   ├── lstm_enhanced_HBhalli_Maize.keras
│   │   │   ├── lstm_enhanced_HBhalli_Maize_scaler.pkl
│   │   │   ├── lstm_enhanced_HBhalli_Ragi.keras
│   │   │   ├── lstm_enhanced_HBhalli_Ragi_scaler.pkl
│   │   │   ├── lstm_enhanced_hospet_Rice.keras
│   │   │   ├── lstm_enhanced_hospet_Rice_scaler.pkl
│   │   │   ├── lstm_enhanced_hospet_Tomato.keras
│   │   │   └── lstm_enhanced_hospet_Tomato_scaler.pkl
│   │   │
│   │   └── 📁 Regular LSTM Models/
│   │       ├── lstm_davangere_Cotton.keras
│   │       ├── lstm_davangere_Cotton_scaler.pkl
│   │       ├── lstm_davangere_Maize.keras
│   │       ├── lstm_davangere_Maize_scaler.pkl
│   │       ├── lstm_davangere_Ragi.keras
│   │       ├── lstm_davangere_Ragi_scaler.pkl
│   │       ├── lstm_davangere_Rice.keras
│   │       ├── lstm_davangere_Rice_scaler.pkl
│   │       ├── lstm_davangere_Tomato.keras
│   │       ├── lstm_davangere_Tomato_scaler.pkl
│   │       ├── lstm_gangavathi_Cotton.keras
│   │       ├── lstm_gangavathi_Cotton_scaler.pkl
│   │       ├── lstm_gangavathi_Maize.keras
│   │       ├── lstm_gangavathi_Maize_scaler.pkl
│   │       ├── lstm_gangavathi_Rice.keras
│   │       ├── lstm_gangavathi_Rice_scaler.pkl
│   │       ├── lstm_HBhalli_Maize.keras
│   │       ├── lstm_HBhalli_Maize_scaler.pkl
│   │       ├── lstm_HBhalli_Ragi.keras
│   │       ├── lstm_HBhalli_Ragi_scaler.pkl
│   │       ├── lstm_hospet_Tomato.keras
│   │       └── lstm_hospet_Tomato_scaler.pkl
│   │
│   ├── 📁 Training Scripts/
│   │   ├── train_attention_lstm.py      # Train attention-enhanced LSTM models
│   │   ├── train_lstm.py                # Train regular LSTM models
│   │   ├── train_lstm_enhanced.py       # Train enhanced LSTM models
│   │   ├── train_xgb.py                 # Train XGBoost models
│   │   └── train_xgb_enhanced.py         # Train enhanced XGBoost models
│   │
│   ├── 📁 Testing Scripts/
│   │   ├── test_api.py                  # Test ML API endpoints
│   │   ├── test_attention_api.py        # Test attention API
│   │   ├── test_enhanced_api.py         # Test enhanced API
│   │   ├── test_enhanced_deployment.py  # Test deployment
│   │   ├── final_attention_test.py       # Final attention model tests
│   │   ├── demo_attention_models.py      # Demo attention models
│   │   └── batch_predict.py             # Batch prediction script
│   │
│   └── 📁 Additional Files/
│       ├── xgb_crop_recommendation.pkl      # XGBoost crop recommendation model
│       ├── xgb_enhanced_crop_recommendation.pkl
│       ├── xgb_le_crop.pkl                  # Label encoder for crops
│       ├── xgb_le_market.pkl                 # Label encoder for markets
│       ├── predictions.csv                   # Prediction results
│       └── predictions.json                  # Prediction results (JSON)
│
├── 📁 data/                          # Agricultural price data (CSV files)
│   ├── 📁 davangere/
│   │   ├── Agmarknet_Price_Report_cotton_Davangere.csv
│   │   ├── Agmarknet_Price_Report_Maize_Davangere.csv
│   │   ├── Agmarknet_Price_Report_Ragi_Davangere.csv
│   │   ├── Agmarknet_Price_Report_Rice_Davangere.csv
│   │   └── Agmarknet_Price_Report_Tomato_Davangere.csv
│   │
│   ├── 📁 gangavathi/
│   │   ├── Agmarknet_Price_Report_Cotton_Gangavathi.csv
│   │   ├── Agmarknet_Price_Report_Maize_Gangavathi.csv
│   │   ├── Agmarknet_Price_Report_Ragi_Gangavathi.csv
│   │   └── Agmarknet_Price_Report_Rice_Gangavathi.csv
│   │
│   ├── 📁 HBhalli/
│   │   ├── Agmarknet_Price_Report_HBHalli_Cotton.csv
│   │   ├── Agmarknet_Price_Report_Maize_HBHalli.csv
│   │   ├── Agmarknet_Price_Report_Ragi_HBHalli.csv
│   │   └── Agmarknet_Price_Report_Rice_HBHalli.csv
│   │
│   └── 📁 hospet/
│       ├── Agmarknet_Price_Report_Hospet_Maize.csv
│       ├── Agmarknet_Price_Report_Hospet_Rice.csv
│       ├── Agmarknet_Price_Report_Hospet_Tomato.csv
│       └── Agmarknet_Price_Report_Hospete_Ragi.csv
│
└── 📁 Documentation/
    ├── CODE_REVIEW_GUIDE.md           # Code review guidelines
    ├── PRESENTATION_GUIDE.md          # Presentation guide
    └── SYSTEM_ARCHITECTURE.md         # System architecture documentation
```

---

## 📂 Directory Descriptions

### Root Level
- **Frontend Folder**: `frontend/` (contains `index.html`, `styles.css`, `script_attention.js`, `translations.js`)
- **Configuration**: `package.json`, `vercel.json`
- **Documentation**: `README.md`, `COMPLETE_DEPLOYMENT_GUIDE.md`

### `/frontend/`
- Production-ready static SPA stored under `frontend/`
- Components: `index.html` shell + `script_attention.js`, `styles.css`, `translations.js`
- Zero build tooling—open `frontend/index.html` or host the folder via any static server

### `/api/`
- Vercel serverless function wrapper for Express backend

### `/backend/`
- Node.js Express API server
- Handles live prices, chat, weather, recommendations
- Connects to ML API for predictions

### `/ml_api/`
- Python Flask ML API
- TensorFlow/Keras LSTM models
- Price prediction and crop recommendation endpoints
- Deployment scripts and configurations

### `/data/`
- Historical price data from Agmarknet
- CSV files organized by market (city)
- Used for training and fallback data

## 🔑 Key Files

### Frontend
- `frontend/index.html` - Main application entry point
- `frontend/script_attention.js` - All frontend logic (1984 lines)
- `frontend/styles.css` - Application styling
- `frontend/translations.js` - Multi-language support (4 languages)

### Backend
- `backend/server.js` - Express API server
- `backend/groqChatController.js` - AI chat integration

### ML API
- `ml_api/app_attention.py` - Main Flask application
- `ml_api/requirements.txt` - Python dependencies

### Deployment
- `vercel.json` - Vercel configuration
- `ml_api/oci-deploy.sh` - Oracle Cloud deployment script
- `ml_api/Dockerfile` - Docker configuration

---

## 📊 File Statistics

- **Total Files**: 200+ files
- **Model Files**: 33+ .keras files + scalers
- **Data Files**: 16 CSV files
- **Code Files**: ~20 Python files, ~10 JavaScript files
- **Documentation**: 8+ markdown files

---

## 🎯 Entry Points

### For Development
- **Frontend**: Open `index.html` in browser
- **Backend**: `cd backend && npm start` (port 4000)
- **ML API**: `cd ml_api && python app_attention.py` (port 5000)

### For Production
- **Frontend + Backend**: Deploy to Vercel
- **ML API**: Deploy to Oracle Cloud (or Render/Railway)

---

## 📝 Notes

- Model files are large (several MB each) - not ideal for Git
- Consider using Git LFS for model files in production
- `.env` files are gitignored (contains API keys)
- `node_modules/` and `venv/` are gitignored
- All model files are included in repository for deployment
- Legacy Vite/Tailwind React frontend has been removed; the static root frontend is the single source of truth

---

## 🔄 Deployment Flow

```
GitHub Repository
    │
    ├──→ Vercel (Frontend + Backend)
    │    └──→ Connects to ML API
    │
    └──→ Oracle Cloud (ML API)
         └──→ Serves predictions
```

---

This structure supports:
- ✅ Multi-language frontend
- ✅ Voice assistant features
- ✅ AI-powered chat
- ✅ ML price predictions
- ✅ Crop recommendations
- ✅ Live price data
- ✅ Multiple deployment options

