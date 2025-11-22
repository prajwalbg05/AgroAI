# Complete Deployment Guide - AgroAI Project

This guide will help you deploy your **entire AgroAI project** to production, including:
- ✅ ML API (Oracle Cloud - Always Free)
- ✅ Frontend + Backend (Vercel)
- ✅ Connecting everything together

**Total deployment time: ~1 hour**

---

## 📋 Overview

Your project has 3 components:

1. **ML API** (`ml_api/`) - Python Flask with TensorFlow models
   - Deploy to: **Oracle Cloud Always Free**
   - URL: `http://<OCI_IP>:5000`

2. **Backend** (`backend/`) - Node.js Express API
   - Deploy to: **Vercel** (as serverless functions)
   - URL: `https://your-app.vercel.app/api/*`

3. **Frontend** (`index.html`, `script_attention.js`, etc.)
   - Deploy to: **Vercel** (static files)
   - URL: `https://your-app.vercel.app`

---

## 🎯 Deployment Strategy

```
┌─────────────────┐
│   Vercel        │
│  (Frontend +    │
│   Backend)      │
│                 │
│  Frontend ──────┼──> User Browser
│  Backend  ──────┼──> ML API (OCI)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Oracle Cloud   │
│  (ML API)       │
│                 │
│  Flask +        │
│  TensorFlow     │
└─────────────────┘
```

---

## PART 1: Deploy ML API to Oracle Cloud (30 minutes)

### Step 1: Create OCI Account
1. Go to https://cloud.oracle.com
2. Click "Start for Free"
3. Sign up and verify email
4. Add payment method (verification only)

### Step 2: Create VM
1. OCI Console → Compute → Instances → Create Instance
2. **Name**: `agroai-ml-api-vm`
3. **Image**: Ubuntu 22.04
4. **Shape**: VM.Standard.A1.Flex
   - OCPUs: `2`
   - Memory: `12 GB`
5. **Networking**: Use default VCN, assign public IP ✅
6. **SSH Keys**: Generate new key pair (SAVE THE KEY!)
7. Click "Create"
8. **Note your Public IP** (e.g., `123.456.789.012`)

### Step 3: Configure Firewall
1. VCN → Security Lists → Default Security List
2. Add Ingress Rule:
   - Source: `0.0.0.0/0`
   - Protocol: TCP
   - Port: `5000`
   - Description: `AgroAI ML API`

### Step 4: Connect & Deploy
**Windows (PuTTY):**
1. Convert key to .ppk using PuTTYgen
2. Connect with PuTTY using your Public IP

**Mac/Linux:**
```bash
chmod 400 your-key.key
ssh -i your-key.key ubuntu@<PUBLIC_IP>
```

**Once connected, run:**
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Git
sudo apt-get install -y git

# Clone repository
cd ~
git clone https://github.com/prajwalbg05/AgroAI.git
cd AgroAI/ml_api

# Deploy
chmod +x oci-deploy.sh
./oci-deploy.sh
```

**Wait 10-15 minutes** for installation to complete.

### Step 5: Test ML API
```bash
# On your VM
curl http://localhost:5000/health

# From your computer
curl http://<YOUR_PUBLIC_IP>:5000/health
```

Expected response:
```json
{"status":"healthy","model_type":"attention_enhanced_lstm","version":"2.0"}
```

**✅ ML API is now live at: `http://<YOUR_PUBLIC_IP>:5000`**

**Save this URL - you'll need it for Vercel!**

---

## PART 2: Deploy Frontend + Backend to Vercel (20 minutes)

### Step 1: Prepare Your Code

Make sure all files are committed and pushed to GitHub:

```bash
# Check status
git status

# If there are uncommitted changes
git add .
git commit -m "Prepare for deployment"
git push
```

### Step 2: Connect Vercel to GitHub

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New..." → "Project"
4. Import your repository: `prajwalbg05/AgroAI`
5. Click "Import"

### Step 3: Configure Vercel Project

**Framework Preset:**
- Select **"Other"** or **"Static Site"**

**Root Directory:**
- Leave as default (root of repository)

**Build Command:**
- Leave empty (no build needed)

**Output Directory:**
- Leave empty (serves from root)

**Install Command:**
- Leave empty

### Step 4: Add Environment Variables

Click "Environment Variables" and add:

1. **GROQ_API_KEY**
   - Value: `your_groq_api_key_here` (Get from https://console.groq.com)
   - Environments: All (Production, Preview, Development)

2. **ML_API_URL**
   - Value: `http://<YOUR_OCI_PUBLIC_IP>:5000`
   - Replace `<YOUR_OCI_PUBLIC_IP>` with your actual OCI VM IP
   - Example: `http://123.456.789.012:5000`
   - Environments: All

3. **OPENWEATHER_API_KEY** (Optional)
   - Value: Your OpenWeather API key (if you have one)
   - Environments: All

### Step 5: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for deployment
3. Your app will be live at: `https://your-project-name.vercel.app`

**✅ Frontend + Backend are now live on Vercel!**

---

## PART 3: Verify Everything Works (10 minutes)

### Test 1: Frontend Loads
1. Open your Vercel URL: `https://your-project.vercel.app`
2. You should see the AgroAI dashboard
3. ✅ Frontend is working!

### Test 2: Live Prices
1. Click "Live Prices" in sidebar
2. Prices should load
3. ✅ Backend API is working!

### Test 3: Price Predictions
1. Click "Price Predictions"
2. Select location: "Davangere"
3. Select crop: "Rice"
4. Click "Generate Prediction"
5. Should show prediction (may take a few seconds)
6. ✅ ML API connection is working!

### Test 4: AI Assistant
1. Click "AI Assistant"
2. Type: "What are the current rice prices?"
3. Should get a real AI response (not fixed answers)
4. ✅ Groq API is working!

### Test 5: Voice Assistant
1. In AI Assistant page
2. Click "🎤 Start Voice" button
3. Speak a question
4. Should transcribe and respond
5. ✅ Voice features are working!

---

## 🔧 Troubleshooting

### ML API Not Responding

**Check OCI VM:**
```bash
# SSH into your VM
ssh -i key.key ubuntu@<OCI_IP>

# Check service status
sudo systemctl status agroai-ml-api

# View logs
sudo journalctl -u agroai-ml-api -n 50

# Restart if needed
sudo systemctl restart agroai-ml-api
```

**Check Security List:**
- Verify port 5000 is open in OCI Security List
- Test: `curl http://<OCI_IP>:5000/health` from your computer

### Vercel Can't Connect to ML API

**Check Environment Variable:**
1. Vercel Dashboard → Settings → Environment Variables
2. Verify `ML_API_URL` is correct
3. Make sure it's `http://` not `https://` (unless you set up SSL)
4. Redeploy after changing

**Check CORS:**
- ML API should allow requests from Vercel domain
- Flask CORS is already configured in the code

### Frontend Shows Errors

**Check Browser Console:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

**Common Issues:**
- API URLs not set correctly
- Environment variables not loaded
- CORS errors (check ML API)

### AI Assistant Not Working

**Check Groq API Key:**
1. Verify `GROQ_API_KEY` in Vercel environment variables
2. Test Groq API directly (if needed)

**Check Backend Logs:**
- Vercel Dashboard → Deployments → Functions → View logs

---

## 📝 Important Notes

### OCI Public IP Changes
- **Your OCI Public IP may change** if you stop/start the instance
- **Solution**: Create a Reserved Public IP in OCI (free)
  1. OCI Console → Networking → IP Management → Reserved Public IPs
  2. Create Reserved IP
  3. Assign to your instance
  4. Update Vercel `ML_API_URL` with new IP

### Vercel Deployment
- **Automatic deployments** on every Git push
- **Preview deployments** for pull requests
- **Production URL** stays the same

### Free Tier Limits

**OCI Always Free:**
- ✅ No time limits
- ✅ 2 OCPUs, 12 GB RAM
- ✅ 10 GB Object Storage
- ✅ 10 TB data egress/month

**Vercel Free:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions included

---

## 🎉 Deployment Complete!

Your AgroAI project is now fully deployed:

- ✅ **Frontend**: `https://your-project.vercel.app`
- ✅ **Backend API**: `https://your-project.vercel.app/api/*`
- ✅ **ML API**: `http://<OCI_IP>:5000`

### Share Your App

Your public URL is:
```
https://your-project.vercel.app
```

Share this with users - they can access your full application!

---

## 🔄 Updating Your Deployment

### Update ML API
```bash
# SSH into OCI VM
ssh -i key.key ubuntu@<OCI_IP>

# Update code
cd ~/AgroAI
git pull
cd ml_api

# Update dependencies (if requirements.txt changed)
source /opt/agroai-ml-api/venv/bin/activate
pip install -r requirements.txt

# Restart service
sudo systemctl restart agroai-ml-api
```

### Update Frontend/Backend
```bash
# Make changes locally
# Commit and push
git add .
git commit -m "Update frontend"
git push

# Vercel will auto-deploy!
```

---

## 📚 Additional Resources

- **Detailed ML API Deployment**: `ml_api/STEP_BY_STEP_DEPLOYMENT.md`
- **OCI Quick Start**: `ml_api/OCI_QUICK_START.md`
- **Vercel Documentation**: https://vercel.com/docs

---

## ✅ Final Checklist

Before considering deployment complete:

- [ ] ML API deployed to OCI and accessible
- [ ] Frontend + Backend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] ML_API_URL points to correct OCI IP
- [ ] Frontend loads correctly
- [ ] Live Prices page works
- [ ] Price Predictions work (connects to ML API)
- [ ] AI Assistant works (connects to Groq)
- [ ] Voice features work
- [ ] All pages accessible and functional

**If all checked, congratulations! Your project is live! 🚀**

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review service logs (OCI and Vercel)
3. Verify all environment variables are set
4. Test each component individually
5. Check browser console for frontend errors

Good luck with your deployment! 🎊

