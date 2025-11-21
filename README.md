# AgroAI - Agricultural AI Platform

An intelligent farming companion for market insights and crop management with AI-powered predictions and voice assistance.

## Features

- 🌾 Live crop prices from multiple markets
- 📊 AI-powered price predictions using Attention-Enhanced LSTM
- 🌱 Crop advisory recommendations
- 🗣️ Voice assistant with speech recognition
- 🌍 Multi-language support (English, Hindi, Kannada, Telugu)

## Deployment to Vercel

### Step 1: Framework Selection

When deploying to Vercel:

1. **Framework Preset**: Choose **"Other"** or **"Static Site"** (since the frontend is pure HTML/CSS/JS)
2. **Root Directory**: Leave as default (root of repository)
3. **Build Command**: Leave empty (no build needed)
4. **Output Directory**: Leave empty (serves from root)

### Step 2: Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

- `GROQ_API_KEY` - Your Groq API key for AI chat
- `OPENWEATHER_API_KEY` - OpenWeather API key (optional, for weather features)
- `ML_API_URL` - URL of your deployed ML API (see Step 3)

### Step 3: Deploy ML API Separately

The ML API (`ml_api/app_attention.py`) with TensorFlow models should be deployed separately on:
- **Render** (recommended)
- **Railway**
- **Fly.io**

After deployment, set `ML_API_URL` in Vercel environment variables to point to your ML API.

### Step 4: Deploy

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect `vercel.json` and deploy
3. Your app will be live at `https://your-project.vercel.app`

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

