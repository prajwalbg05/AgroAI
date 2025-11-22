# Step-by-Step Deployment Guide - Oracle Cloud Always Free

This is a complete beginner-friendly guide to deploy your ML API to Oracle Cloud.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] Oracle Cloud account (sign up at https://cloud.oracle.com)
- [ ] Credit card for verification (won't be charged for free tier)
- [ ] SSH client installed:
  - **Windows**: PuTTY (download from https://www.putty.org/)
  - **Mac/Linux**: Built-in Terminal

---

## STEP 1: Create Oracle Cloud Account (5 minutes)

### 1.1 Sign Up
1. Go to https://cloud.oracle.com
2. Click **"Start for Free"**
3. Fill in your details:
   - Email address
   - Password
   - Country/Region
4. Verify your email
5. Add payment method (credit card - for verification only, won't be charged)

### 1.2 Complete Account Setup
1. Choose your **Home Region** (closest to you)
2. Accept terms and conditions
3. Wait for account activation (usually instant)

---

## STEP 2: Create Virtual Machine (10 minutes)

### 2.1 Navigate to Compute
1. Login to OCI Console: https://cloud.oracle.com
2. Click the **Menu (☰)** icon (top left)
3. Click **"Compute"** → **"Instances"**

### 2.2 Create Instance
1. Click **"Create Instance"** button (blue button)

### 2.3 Configure Basic Details
1. **Name**: Type `agroai-ml-api-vm`
2. **Create in compartment**: Leave default (root compartment)

### 2.4 Select Image (Operating System)
1. Click **"Change Image"**
2. Select **"Canonical Ubuntu"**
3. Choose **"Ubuntu 22.04"** (or latest LTS version)
4. Click **"Select Image"**

### 2.5 Configure Shape (CPU & Memory)
1. Click **"Change Shape"**
2. Select **"VM.Standard.A1.Flex"** (ARM-based, Always Free)
3. Configure resources:
   - **OCPUs**: `2` (slide to 2)
   - **Memory**: `12` GB (slide to 12)
4. Click **"Select Shape"**

### 2.6 Configure Networking
1. **Virtual Cloud Network**: Leave default (it will create one)
2. **Subnet**: Leave default
3. **Assign a public IPv4 address**: Make sure this is **CHECKED** ✅

### 2.7 Add SSH Keys (IMPORTANT!)
You have two options:

#### Option A: Generate New Key Pair (Recommended for beginners)
1. Click **"Save Private Key"** button
2. **SAVE THE FILE** to a safe location (e.g., `C:\Users\YourName\agroai-key.key`)
3. **KEEP THIS FILE SAFE** - you'll need it to connect!

#### Option B: Use Existing SSH Key
1. Click **"Paste SSH Keys"**
2. Paste your public key content

### 2.8 Review and Create
1. Scroll down and review all settings
2. Click **"Create"** button
3. Wait 2-3 minutes for instance to be created

### 2.9 Get Your Public IP
1. Once instance shows **"Running"** status
2. Find **"Public IP address"** in the instance details
3. **COPY THIS IP** - you'll need it! (Example: `123.456.789.012`)

---

## STEP 3: Configure Firewall (Security Rules) (5 minutes)

### 3.1 Open Security List
1. In your instance details, find **"Subnet"** section
2. Click on the subnet name (it's a link)
3. Click **"Security Lists"** tab
4. Click on **"Default Security List"**

### 3.2 Add Ingress Rule for Port 5000
1. Click **"Add Ingress Rules"** button
2. Fill in the form:
   - **Stateless**: Leave unchecked
   - **Source Type**: Select **"CIDR"**
   - **Source CIDR**: Type `0.0.0.0/0` (allows from anywhere)
   - **IP Protocol**: Select **"TCP"**
   - **Destination Port Range**: Type `5000`
   - **Description**: Type `AgroAI ML API`
3. Click **"Add Ingress Rules"**

### 3.3 Verify SSH Port (Port 22)
1. Check if port 22 is already open (should be by default)
2. If not, add another rule:
   - Source: `0.0.0.0/0`
   - Protocol: `TCP`
   - Port: `22`
   - Description: `SSH`

---

## STEP 4: Connect to Your VM (5 minutes)

### Windows Users (PuTTY)

#### 4.1 Convert Private Key (if you generated new key)
1. Download **PuTTYgen** from https://www.putty.org/
2. Open PuTTYgen
3. Click **"Load"**
4. Select your `.key` file (change file type to "All Files")
5. Click **"Save private key"**
6. Save as `agroai-key.ppk`

#### 4.2 Connect with PuTTY
1. Open **PuTTY**
2. Enter your **Public IP** in "Host Name"
3. Port: `22`
4. Connection type: **SSH**
5. Go to **"Connection"** → **"SSH"** → **"Auth"**
6. Click **"Browse"** and select your `.ppk` file
7. Go back to **"Session"**
8. Type a name in "Saved Sessions" and click **"Save"**
9. Click **"Open"**
10. If prompted, click **"Yes"** to accept the host key
11. You should see: `ubuntu@instance-name:~$`

### Mac/Linux Users (Terminal)

1. Open Terminal
2. Set correct permissions:
   ```bash
   chmod 400 /path/to/your-private-key.key
   ```
3. Connect:
   ```bash
   ssh -i /path/to/your-private-key.key ubuntu@<YOUR_PUBLIC_IP>
   ```
   Replace `<YOUR_PUBLIC_IP>` with your actual IP
4. Type `yes` when prompted to accept host key
5. You should see: `ubuntu@instance-name:~$`

---

## STEP 5: Deploy the Application (15 minutes)

### 5.1 Update System
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 5.2 Install Git
```bash
sudo apt-get install -y git
```

### 5.3 Clone Your Repository
```bash
cd ~
git clone https://github.com/prajwalbg05/AgroAI.git
cd AgroAI/ml_api
```

### 5.4 Make Deployment Script Executable
```bash
chmod +x oci-deploy.sh
```

### 5.5 Run Deployment Script
```bash
./oci-deploy.sh
```

**This will take 10-15 minutes!** The script will:
- Install Python 3.11
- Install system dependencies
- Create virtual environment
- Install TensorFlow and all packages
- Set up the service
- Start the API

**Wait for it to complete** - you'll see "Deployment Complete" message.

---

## STEP 6: Verify Deployment (2 minutes)

### 6.1 Check Service Status
```bash
sudo systemctl status agroai-ml-api
```

You should see: `active (running)` in green

### 6.2 Test API Locally
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "model_type": "attention_enhanced_lstm",
  "version": "2.0"
}
```

### 6.3 Test from Your Computer
Open a new terminal/PowerShell on your local machine:

```bash
curl http://<YOUR_PUBLIC_IP>:5000/health
```

Replace `<YOUR_PUBLIC_IP>` with your actual IP.

**If this works, your API is live!** 🎉

---

## STEP 7: Update Vercel Configuration (5 minutes)

### 7.1 Get Your API URL
Your ML API URL is:
```
http://<YOUR_PUBLIC_IP>:5000
```

Example: `http://123.456.789.012:5000`

### 7.2 Add to Vercel
1. Go to **Vercel Dashboard**: https://vercel.com
2. Select your **AgroAI project**
3. Go to **"Settings"** → **"Environment Variables"**
4. Click **"Add New"**
5. Add:
   - **Name**: `ML_API_URL`
   - **Value**: `http://<YOUR_PUBLIC_IP>:5000` (use your actual IP)
   - **Environment**: Select all (Production, Preview, Development)
6. Click **"Save"**

### 7.3 Redeploy Vercel Project
1. Go to **"Deployments"** tab
2. Click **"..."** (three dots) on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

---

## STEP 8: Test Everything Works (5 minutes)

### 8.1 Test from Browser
1. Open your Vercel app URL (e.g., `https://your-app.vercel.app`)
2. Navigate to **"Price Predictions"** page
3. Select a location and crop
4. Click **"Generate Prediction"**
5. It should work! ✅

### 8.2 Test AI Assistant
1. Go to **"AI Assistant"** page
2. Type a question
3. Should get real AI response (not fixed answers)

---

## ✅ Deployment Complete!

Your ML API is now:
- ✅ Running on Oracle Cloud Always Free tier
- ✅ Accessible at `http://<YOUR_PUBLIC_IP>:5000`
- ✅ Connected to your Vercel frontend
- ✅ Fully functional!

---

## 🔧 Useful Commands (For Later)

### View API Logs
```bash
sudo journalctl -u agroai-ml-api -f
```
Press `Ctrl+C` to exit

### Restart API Service
```bash
sudo systemctl restart agroai-ml-api
```

### Stop API Service
```bash
sudo systemctl stop agroai-ml-api
```

### Start API Service
```bash
sudo systemctl start agroai-ml-api
```

### Check Service Status
```bash
sudo systemctl status agroai-ml-api
```

### Update Application (After Git Changes)
```bash
cd ~/AgroAI
git pull
cd ml_api
source /opt/agroai-ml-api/venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart agroai-ml-api
```

---

## 🆘 Troubleshooting

### Can't Connect via SSH?
- ✅ Check you're using correct private key
- ✅ Verify Public IP is correct
- ✅ Check Security List allows port 22
- ✅ Try: `ssh -v -i key.key ubuntu@IP` for debug info

### Service Won't Start?
```bash
# Check logs
sudo journalctl -u agroai-ml-api -n 50

# Check if port is in use
sudo lsof -i :5000
```

### Can't Access API from Browser?
- ✅ Check Security List allows port 5000
- ✅ Verify service is running: `sudo systemctl status agroai-ml-api`
- ✅ Test locally first: `curl http://localhost:5000/health`
- ✅ Check firewall: `sudo ufw status`

### Out of Memory?
- Free tier has 1 GB RAM (should be enough)
- If issues, edit service file:
  ```bash
  sudo nano /etc/systemd/system/agroai-ml-api.service
  ```
  Change `--workers 2` to `--workers 1`
  Then: `sudo systemctl daemon-reload && sudo systemctl restart agroai-ml-api`

---

## 📝 Notes

- **Your Public IP may change** if you stop/start the instance
- To get a **static IP**, create a Reserved Public IP in OCI
- **Free tier never expires** - truly always free!
- Service **auto-starts** on VM reboot
- All model files are included in the repository

---

## 🎉 Success Checklist

- [ ] VM created and running
- [ ] Port 5000 open in Security List
- [ ] Connected via SSH
- [ ] Deployment script completed successfully
- [ ] Service status shows "active (running)"
- [ ] `curl http://localhost:5000/health` works
- [ ] `curl http://<PUBLIC_IP>:5000/health` works from your computer
- [ ] Vercel environment variable updated
- [ ] Vercel project redeployed
- [ ] Frontend can communicate with ML API

**If all checked, you're done!** 🚀

---

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Review the troubleshooting section above
3. Check service logs: `sudo journalctl -u agroai-ml-api -n 50`
4. Verify all steps were completed correctly

Good luck with your deployment! 🎊

