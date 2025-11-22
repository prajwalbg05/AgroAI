# AgroAI - Agricultural AI Platform

An intelligent farming companion for market insights and crop management with AI-powered predictions and voice assistance.

## Features

- 🌾 Live crop prices from multiple markets
- 📊 AI-powered price predictions using Attention-Enhanced LSTM
- 🌱 Crop advisory recommendations
- 🗣️ Voice assistant with speech recognition
- 🌍 Multi-language support (English, Hindi, Kannada, Telugu)

## 🚀 Deployment

### Complete Deployment Guide

**👉 Start here: [COMPLETE_DEPLOYMENT_GUIDE.md](./COMPLETE_DEPLOYMENT_GUIDE.md)**

This comprehensive guide covers deploying the entire project:
- ML API to Oracle Cloud Always Free (recommended)
- Frontend + Backend to Vercel
- Connecting everything together
- Testing and troubleshooting

### Quick Overview

1. **Deploy ML API** → Oracle Cloud Always Free (30 min)
   - See: `ml_api/STEP_BY_STEP_DEPLOYMENT.md`
   
2. **Deploy Frontend + Backend** → Vercel (20 min)
   - Framework: "Other" or "Static Site"
   - Environment Variables: `GROQ_API_KEY`, `ML_API_URL`

3. **Connect & Test** → Verify everything works (10 min)

### Alternative ML API Deployment

If you prefer not to use Oracle Cloud:
- **Render**: See `ml_api/DEPLOYMENT.md`
- **Railway**: See `ml_api/DEPLOYMENT.md`
- **Fly.io**: See `ml_api/DEPLOYMENT.md`

## Local Development

### Backend
```bash
cd backend
npm install
npm start
```

### ML API
```bash
cd ml_api
pip install -r requirements.txt
python app_attention.py
```

### Frontend
Simply open `index.html` in a browser or use a local server.

## Project Structure

```
├── api/              # Vercel serverless functions
├── backend/          # Node.js Express backend
├── ml_api/           # Python Flask ML API
├── data/             # CSV price data
├── index.html        # Main frontend file
├── script_attention.js
├── styles.css
├── translations.js
└── vercel.json       # Vercel configuration
```

## License

ISC

