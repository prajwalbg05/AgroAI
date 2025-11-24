# 🚀 Step-by-Step Deployment Guide - AgroAI Project

This guide will walk you through deploying your AgroAI project step by step. Follow each section in order.

---

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ A GitHub account
- ✅ A Vercel account (free tier works)
- ✅ An Oracle Cloud account (for ML API - free tier available)
- ✅ A Groq API key (get from https://console.groq.com)
- ✅ Git installed on your computer

---

## 🎯 Project Overview

Your project has 3 main components:

1. **ML API** (Python Flask) → Deploy to Oracle Cloud
2. **Backend** (Node.js Express) → Deploy to Vercel
3. **Frontend** (HTML/JS) → Deploy to Vercel

---

## PART 1: Prepare Your Code (5 minutes)

### Step 1.1: Commit All Changes

Make sure all your code is committed to Git:

```bash
# Navigate to your project directory
cd "F:\NEW CROP ADVISORY"

# Check status
git status

# If there are uncommitted changes, commit them
git add .
git commit -m "Prepare for deployment - fix environment variables"
git push origin main
```

### Step 1.2: Verify Files Are Ready

Ensure these files exist:
- ✅ `vercel.json` (Vercel configuration)
- ✅ `api/index.js` (Vercel serverless function)
- ✅ `backend/server.js` (Backend server)
- ✅ `index.html` (Frontend)
- ✅ `ml_api/app_attention.py` (ML API)

---

## PART 2: Deploy ML API to Oracle Cloud (30-45 minutes)

### Step 2.1: Create Oracle Cloud Account

1. Go to https://cloud.oracle.com
2. Click **"Start for Free"**
3. Fill in your details and verify email
4. Add payment method (for verification only - won't be charged on free tier)

### Step 2.2: Create Virtual Machine

1. Log into Oracle Cloud Console
2. Navigate to: **Compute** → **Instances** → **Create Instance**

3. Configure the instance:
   - **Name**: `agroai-ml-api-vm`
   - **Image**: Select **Ubuntu 22.04**
   - **Shape**: Select **VM.Standard.A1.Flex**
     - OCPUs: `2`
     - Memory: `12 GB`
   - **Networking**: 
     - ✅ Check "Assign a public IPv4 address"
     - Use default VCN
   - **SSH Keys**: 
     - Select "Generate a key pair for me"
     - **DOWNLOAD THE PRIVATE KEY** (you'll need this!)
     - Save it as `oci-key.key` or `oci-key.pem`

4. Click **"Create"**
5. Wait 2-3 minutes for instance to be ready
6. **Note your Public IP address** (e.g., `123.456.789.012`)

### Step 2.3: Configure Firewall

1. In OCI Console, go to: **Networking** → **Virtual Cloud Networks**
2. Click on your default VCN
3. Go to **Security Lists** → **Default Security List**
4. Click **"Add Ingress Rules"**
5. Add rule:
   - **Source Type**: CIDR
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: TCP
   - **Destination Port Range**: `5000`
   - **Description**: `AgroAI ML API`
6. Click **"Add Ingress Rules"**

### Step 2.4: Connect to Your VM

**On Windows (using PuTTY):**

1. Download PuTTY and PuTTYgen from https://www.putty.org/
2. Open PuTTYgen
3. Click **"Load"** and select your downloaded private key
4. Click **"Save private key"** to convert to `.ppk` format
5. Open PuTTY
6. Enter:
   - **Host Name**: `ubuntu@<YOUR_PUBLIC_IP>`
   - **Port**: `22`
   - **Connection Type**: SSH
7. Go to **Connection** → **SSH** → **Auth** → **Credentials**
8. Browse and select your `.ppk` key file
9. Click **"Open"** to connect

**On Mac/Linux:**

```bash
# Make key file executable
chmod 400 oci-key.key

# Connect
ssh -i oci-key.key ubuntu@<YOUR_PUBLIC_IP>
```

### Step 2.5: Deploy ML API on VM

Once connected to your VM, run these commands:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Git
sudo apt-get install -y git

# Clone your repository
cd ~
git clone https://github.com/prajwalbg05/AgroAI.git
# OR if using a different repo:
# git clone <YOUR_GITHUB_REPO_URL>
cd AgroAI/ml_api

# Make deployment script executable
chmod +x oci-deploy.sh

# Run deployment script (this will take 10-15 minutes)
./oci-deploy.sh
```

**Wait for installation to complete** (10-15 minutes). The script will:
- Install Python 3.10
- Install TensorFlow and dependencies
- Set up the Flask API as a systemd service
- Start the ML API service

### Step 2.6: Verify ML API is Running

```bash
# On your VM, test locally
curl http://localhost:5000/health

# Expected response:
# {"status":"healthy","model_type":"attention_enhanced_lstm","version":"2.0"}
```

**From your local computer**, test the public endpoint:

```bash
# Replace <YOUR_PUBLIC_IP> with your actual IP
curl http://<YOUR_PUBLIC_IP>:5000/health
```

If you get the health response, ✅ **ML API is deployed successfully!**

**Save your ML API URL**: `http://<YOUR_PUBLIC_IP>:5000`

---

## PART 3: Deploy Frontend + Backend to Vercel (20 minutes)

### Step 3.1: Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub

### Step 3.2: Import Your Project

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Find and select your repository: `prajwalbg05/AgroAI` (or your repo name)
3. Click **"Import"**

### Step 3.3: Configure Project Settings

**Framework Preset:**
- Select **"Other"** (or "Static Site" if "Other" is not available)

**Root Directory:**
- Leave as default (`.` - root of repository)

**Build Command:**
- Leave **empty** (no build needed for static files)

**Output Directory:**
- Leave **empty** (serves from root)

**Install Command:**
- Leave **empty**

### Step 3.4: Add Environment Variables

**Before deploying**, click **"Environment Variables"** and add:

1. **GROQ_API_KEY**
   - **Value**: Your Groq API key (from https://console.groq.com)
   - **Environments**: Select all (Production, Preview, Development)

2. **ML_API_URL**
   - **Value**: `http://<YOUR_OCI_PUBLIC_IP>:5000`
   - Replace `<YOUR_OCI_PUBLIC_IP>` with your actual OCI VM IP
   - Example: `http://123.456.789.012:5000`
   - **Environments**: Select all

3. **OPENWEATHER_API_KEY** (Optional)
   - **Value**: Your OpenWeather API key (if you have one)
   - **Environments**: Select all

**Important**: Make sure to replace `<YOUR_OCI_PUBLIC_IP>` with your actual IP from Step 2.2!

### Step 3.5: Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for deployment
3. Once complete, you'll see: **"Congratulations! Your project has been deployed."**
4. Your app URL will be: `https://your-project-name.vercel.app`

**✅ Frontend + Backend are now live on Vercel!**

---

## PART 4: Test Your Deployment (10 minutes)

### Test 1: Frontend Loads

1. Open your Vercel URL: `https://your-project-name.vercel.app`
2. You should see the AgroAI dashboard
3. ✅ **Frontend is working!**

### Test 2: Live Prices

1. Click **"Live Prices"** in the sidebar
2. Prices should load from the backend API
3. ✅ **Backend API is working!**

### Test 3: Price Predictions

1. Click **"Price Predictions"** in the sidebar
2. Select:
   - **Location**: "Davangere"
   - **Crop**: "Rice"
3. Click **"Generate Prediction"**
4. Wait a few seconds - should show prediction chart
5. ✅ **ML API connection is working!**

### Test 4: AI Assistant

1. Click **"AI Assistant"** in the sidebar
2. Type: `"What are the current rice prices in Davangere?"`
3. Should get an AI response (not a fixed answer)
4. ✅ **Groq API is working!**

### Test 5: Voice Assistant (Optional)

1. In AI Assistant page
2. Click **"🎤 Start Voice"** button
3. Speak a question
4. Should transcribe and respond
5. ✅ **Voice features are working!**

---

## 🔧 Troubleshooting

### Issue: ML API Not Responding

**Check OCI VM:**
```bash
# SSH into your VM
ssh -i oci-key.key ubuntu@<OCI_IP>

# Check service status
sudo systemctl status agroai-ml-api

# View logs
sudo journalctl -u agroai-ml-api -n 50

# Restart if needed
sudo systemctl restart agroai-ml-api
```

**Check Firewall:**
- Verify port 5000 is open in OCI Security List
- Test from your computer: `curl http://<OCI_IP>:5000/health`

### Issue: Vercel Can't Connect to ML API

**Check Environment Variable:**
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify `ML_API_URL` is set correctly
3. Make sure it's `http://` not `https://` (unless you set up SSL)
4. **Redeploy** after changing environment variables:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment → **"Redeploy"**

**Check CORS:**
- ML API should allow requests from Vercel domain
- CORS is already configured in the Flask code

### Issue: Frontend Shows Errors

**Check Browser Console:**
1. Open browser DevTools (Press `F12`)
2. Check **Console** tab for errors
3. Check **Network** tab for failed requests

**Common Issues:**
- API URLs not set correctly
- Environment variables not loaded (redeploy after adding)
- CORS errors (check ML API)

### Issue: AI Assistant Not Working

**Check Groq API Key:**
1. Verify `GROQ_API_KEY` in Vercel environment variables
2. Get a new key from https://console.groq.com if needed
3. Redeploy after updating

**Check Backend Logs:**
- Vercel Dashboard → **Deployments** → Click on deployment → **Functions** → View logs

### Issue: OCI Public IP Changed

**If your OCI Public IP changes** (after stopping/starting instance):

1. **Solution 1: Reserve a Public IP (Recommended)**
   - OCI Console → **Networking** → **IP Management** → **Reserved Public IPs**
   - Click **"Create Reserved Public IP"**
   - Assign to your instance
   - Update Vercel `ML_API_URL` with new IP
   - Redeploy

2. **Solution 2: Update Environment Variable**
   - Get new IP from OCI Console
   - Update `ML_API_URL` in Vercel
   - Redeploy

---

## 📝 Important Notes

### Free Tier Limits

**Oracle Cloud Always Free:**
- ✅ No time limits
- ✅ 2 OCPUs, 12 GB RAM
- ✅ 10 GB Object Storage
- ✅ 10 TB data egress/month

**Vercel Free:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions included

### Automatic Deployments

- **Vercel**: Automatically deploys on every Git push to `main` branch
- **ML API**: Requires manual update (SSH into VM and `git pull`)

### Updating Your Deployment

**Update Frontend/Backend:**
```bash
# Make changes locally
git add .
git commit -m "Update features"
git push origin main

# Vercel will auto-deploy!
```

**Update ML API:**
```bash
# SSH into OCI VM
ssh -i oci-key.key ubuntu@<OCI_IP>

# Update code
cd ~/AgroAI
git pull
cd ml_api

# Restart service
sudo systemctl restart agroai-ml-api
```

---

## ✅ Deployment Checklist

Before considering deployment complete, verify:

- [ ] ML API deployed to OCI and accessible at `http://<IP>:5000/health`
- [ ] Frontend + Backend deployed to Vercel
- [ ] Environment variables set in Vercel:
  - [ ] `GROQ_API_KEY`
  - [ ] `ML_API_URL`
  - [ ] `OPENWEATHER_API_KEY` (optional)
- [ ] Frontend loads correctly at Vercel URL
- [ ] Live Prices page works
- [ ] Price Predictions work (connects to ML API)
- [ ] AI Assistant works (connects to Groq)
- [ ] Voice features work (if applicable)
- [ ] All pages accessible and functional

**If all checked, congratulations! Your project is live! 🎉**

---

## 🆘 Need Help?

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Review service logs:**
   - OCI: `sudo journalctl -u agroai-ml-api -n 50`
   - Vercel: Dashboard → Deployments → Functions → Logs
3. **Verify all environment variables are set correctly**
4. **Test each component individually**
5. **Check browser console for frontend errors**

---

## 🎊 Next Steps

After successful deployment:

1. **Share your app**: Share your Vercel URL with users
2. **Monitor usage**: Check Vercel and OCI dashboards
3. **Set up custom domain** (optional): Vercel → Settings → Domains
4. **Enable analytics** (optional): Vercel Analytics

**Your AgroAI project is now live and ready to use! 🚀**

---

## 📚 Additional Resources

- **Detailed ML API Deployment**: See `ml_api/STEP_BY_STEP_DEPLOYMENT.md`
- **OCI Quick Start**: See `ml_api/OCI_QUICK_START.md`
- **Vercel Documentation**: https://vercel.com/docs
- **Groq API Docs**: https://console.groq.com/docs

---

**Good luck with your deployment! 🎉**

