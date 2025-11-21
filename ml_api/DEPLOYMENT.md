# ML API Deployment Guide

This guide explains how to deploy the AgroAI ML API separately to various cloud platforms.

## Option 1: Render (Recommended - Free Tier Available)

### Steps:

1. **Create a Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `prajwalbg05/AgroAI`

3. **Configure Service**
   - **Name**: `agroai-ml-api`
   - **Environment**: `Python 3`
   - **Root Directory**: `ml_api`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app_attention:app --bind 0.0.0.0:$PORT`

4. **Environment Variables** (Optional)
   - `PORT`: `5000` (usually auto-set)
   - `CALIBRATION_ALPHA`: `0.8`
   - `CLAMP_PCT`: `0.08`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes first time)
   - Your API will be at: `https://agroai-ml-api.onrender.com`

6. **Update Vercel Environment Variable**
   - In Vercel dashboard, add:
   - `ML_API_URL` = `https://agroai-ml-api.onrender.com`

---

## Option 2: Railway

### Steps:

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**
   - Railway will auto-detect Python
   - Set **Root Directory**: `ml_api`
   - It will use `Procfile` automatically

4. **Environment Variables**
   - Add `PORT` (auto-set by Railway)
   - Add `CALIBRATION_ALPHA`: `0.8`
   - Add `CLAMP_PCT`: `0.08`

5. **Deploy**
   - Railway will auto-deploy
   - Get your URL from the service dashboard
   - Update `ML_API_URL` in Vercel

---

## Option 3: Fly.io

### Steps:

1. **Install Fly CLI**
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login to Fly**
   ```bash
   fly auth login
   ```

3. **Initialize App** (from ml_api directory)
   ```bash
   cd ml_api
   fly launch
   ```

4. **Configure**
   - Follow prompts
   - Use Dockerfile (already created)
   - Set app name: `agroai-ml-api`

5. **Deploy**
   ```bash
   fly deploy
   ```

6. **Get URL**
   - Your app will be at: `https://agroai-ml-api.fly.dev`
   - Update `ML_API_URL` in Vercel

---

## Option 4: Docker (Any Platform)

If you prefer Docker deployment:

1. **Build Image**
   ```bash
   cd ml_api
   docker build -t agroai-ml-api .
   ```

2. **Run Locally** (test)
   ```bash
   docker run -p 5000:5000 agroai-ml-api
   ```

3. **Push to Registry**
   - Push to Docker Hub, GitHub Container Registry, or your platform's registry

4. **Deploy**
   - Use the Docker image on any platform that supports Docker

---

## Important Notes

### Model Files
- All `.keras` and `.pkl` model files must be included in the deployment
- They're already in the repository, so they'll be deployed automatically

### First Deployment
- First deployment may take 10-15 minutes due to TensorFlow installation
- Subsequent deployments are faster (2-5 minutes)

### Free Tier Limitations
- **Render**: Free tier spins down after 15 min inactivity (cold start ~30s)
- **Railway**: $5/month credit, then pay-as-you-go
- **Fly.io**: Generous free tier, no spin-down

### CORS
- The API should allow requests from your Vercel frontend
- Flask CORS is already configured in the code

### Testing After Deployment
```bash
curl https://your-ml-api-url.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "model_type": "attention_enhanced_lstm",
  "version": "2.0"
}
```

---

## Troubleshooting

### Build Fails
- Check that all model files are committed to Git
- Verify `requirements.txt` has correct versions
- Check build logs for specific errors

### API Not Responding
- Verify PORT environment variable is set
- Check that gunicorn is installed
- Review application logs

### CORS Errors
- Ensure Flask-CORS is installed
- Check that frontend URL is allowed

---

## Update Vercel After Deployment

Once your ML API is deployed:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update: `ML_API_URL` = `https://your-ml-api-url.onrender.com`
3. Redeploy your Vercel project

Your frontend will now use the deployed ML API!

