# Oracle Cloud Infrastructure (OCI) Always Free Deployment Guide

This guide will help you deploy the AgroAI ML API to Oracle Cloud's Always Free tier, which includes:
- **Always Free VM**: 2 OCPUs, 1 GB RAM (ARM-based Ampere A1)
- **Object Storage**: 10 GB free storage
- **No time limits** - truly always free!

## Prerequisites

1. Oracle Cloud account (sign up at https://cloud.oracle.com)
2. Credit card (for verification only, won't be charged for free tier)
3. SSH client (PuTTY on Windows, Terminal on Mac/Linux)

---

## Step 1: Create Always Free VM

### 1.1 Create Compute Instance

1. **Login to OCI Console**
   - Go to https://cloud.oracle.com
   - Sign in to your account

2. **Navigate to Compute**
   - Click "Menu" (☰) → "Compute" → "Instances"
   - Click "Create Instance"

3. **Configure Instance**
   - **Name**: `agroai-ml-api-vm`
   - **Image**: Select "Canonical Ubuntu" → Choose "Ubuntu 22.04" or "Ubuntu 24.04"
   - **Shape**: Click "Change Shape"
     - Select "VM.Standard.A1.Flex" (ARM-based, Always Free eligible)
     - OCPUs: `2`
     - Memory: `12 GB` (free tier allows up to 24 GB total across all instances)
   - **Networking**: Use default VCN (Virtual Cloud Network)
   - **Add SSH Keys**: 
     - Generate new key pair OR upload your existing public key
     - **Save the private key** if generating new (you'll need it to connect)

4. **Create Instance**
   - Click "Create"
   - Wait 2-3 minutes for instance to be ready
   - Note the **Public IP address**

---

## Step 2: Configure Security Rules (Firewall)

1. **Open Ingress Rules**
   - Go to "Networking" → "Virtual Cloud Networks"
   - Click on your VCN → "Security Lists" → Default Security List
   - Click "Add Ingress Rules"

2. **Add Rule for Port 5000**
   - **Source Type**: CIDR
   - **Source CIDR**: `0.0.0.0/0` (or restrict to your IP for security)
   - **IP Protocol**: TCP
   - **Destination Port Range**: `5000`
   - **Description**: "AgroAI ML API"
   - Click "Add Ingress Rules"

3. **Optional: Add Port 80/443 for Nginx** (if using reverse proxy)
   - Port 80: HTTP
   - Port 443: HTTPS (requires SSL certificate)

---

## Step 3: Connect to Your VM

### Windows (PuTTY)
1. Open PuTTY
2. Enter your VM's **Public IP**
3. Connection type: SSH
4. Go to "Auth" → Load your private key (.ppk format)
5. Click "Open" to connect

### Mac/Linux (Terminal)
```bash
chmod 400 /path/to/your-private-key.key
ssh -i /path/to/your-private-key.key ubuntu@<YOUR_PUBLIC_IP>
```

Replace `<YOUR_PUBLIC_IP>` with your VM's public IP address.

---

## Step 4: Deploy the Application

### 4.1 Clone Your Repository

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Git
sudo apt-get install -y git

# Clone your repository
cd ~
git clone https://github.com/prajwalbg05/AgroAI.git
cd AgroAI/ml_api
```

### 4.2 Run Deployment Script

```bash
# Make script executable
chmod +x oci-deploy.sh

# Run deployment script
./oci-deploy.sh
```

The script will:
- Install Python 3.11 and dependencies
- Create virtual environment
- Install all Python packages (including TensorFlow)
- Set up systemd service
- Configure firewall
- Start the API service

**Note**: Installation takes 10-15 minutes (TensorFlow is large)

### 4.3 Verify Deployment

```bash
# Check service status
sudo systemctl status agroai-ml-api

# Test the API
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "healthy",
  "model_type": "attention_enhanced_lstm",
  "version": "2.0"
}
```

### 4.4 Test from Outside

Test from your local machine:
```bash
curl http://<YOUR_PUBLIC_IP>:5000/health
```

---

## Step 5: (Optional) Set Up Nginx Reverse Proxy

For better security and to serve on port 80/443:

### 5.1 Install Nginx

```bash
sudo apt-get install -y nginx
```

### 5.2 Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/agroai-ml-api
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name <YOUR_PUBLIC_IP>;  # Or your domain if you have one

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.3 Enable and Start Nginx

```bash
sudo ln -s /etc/nginx/sites-available/agroai-ml-api /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
sudo systemctl enable nginx
```

Now your API is accessible on port 80:
```
http://<YOUR_PUBLIC_IP>/health
```

---

## Step 6: (Optional) Use Object Storage for Models

If model files are very large, you can store them in OCI Object Storage:

### 6.1 Create Object Storage Bucket

1. Go to "Object Storage" → "Buckets"
2. Click "Create Bucket"
3. Name: `agroai-models`
4. Click "Create"

### 6.2 Upload Model Files

```bash
# Install OCI CLI
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"

# Configure OCI CLI (follow prompts)
oci setup config

# Upload models
oci os object put -bn agroai-models --file lstm_attention_davangere_Rice.keras
# Repeat for all model files
```

### 6.3 Download Models on VM

```bash
# Download models to VM
oci os object get -bn agroai-models --name lstm_attention_davangere_Rice.keras --file /opt/agroai-ml-api/lstm_attention_davangere_Rice.keras
```

---

## Step 7: Update Vercel with ML API URL

1. **Get Your API URL**
   - If using direct port: `http://<YOUR_PUBLIC_IP>:5000`
   - If using Nginx: `http://<YOUR_PUBLIC_IP>`

2. **Update Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add/Update: `ML_API_URL` = `http://<YOUR_PUBLIC_IP>:5000`
   - Redeploy your Vercel project

---

## Useful Commands

### Service Management
```bash
# Check status
sudo systemctl status agroai-ml-api

# View logs
sudo journalctl -u agroai-ml-api -f

# Restart service
sudo systemctl restart agroai-ml-api

# Stop service
sudo systemctl stop agroai-ml-api

# Start service
sudo systemctl start agroai-ml-api
```

### Update Application
```bash
cd ~/AgroAI
git pull
cd ml_api
source /opt/agroai-ml-api/venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart agroai-ml-api
```

### Monitor Resources
```bash
# Check CPU/Memory usage
htop

# Check disk space
df -h

# Check network
sudo netstat -tulpn | grep 5000
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check logs
sudo journalctl -u agroai-ml-api -n 50

# Check if port is in use
sudo lsof -i :5000

# Verify Python environment
/opt/agroai-ml-api/venv/bin/python --version
```

### Out of Memory
- Free tier has 1 GB RAM, which should be enough
- If issues occur, reduce gunicorn workers in service file:
  - Change `--workers 2` to `--workers 1`

### Can't Connect from Outside
- Verify security list rules allow port 5000
- Check VM's firewall: `sudo ufw status`
- Test locally first: `curl http://localhost:5000/health`

### Model Files Not Found
- Verify all `.keras` and `.pkl` files are in `/opt/agroai-ml-api/`
- Check file permissions: `ls -la /opt/agroai-ml-api/*.keras`

---

## Security Best Practices

1. **Restrict SSH Access**
   - Only allow your IP in security list
   - Use SSH keys, disable password authentication

2. **Use Firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp  # SSH
   sudo ufw allow 5000/tcp  # API
   ```

3. **Regular Updates**
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

4. **Monitor Logs**
   - Regularly check service logs for errors
   - Set up log rotation

---

## Cost

**Always Free Tier Includes:**
- 2 OCPUs (ARM-based)
- Up to 24 GB total memory across all instances
- 10 GB Object Storage
- 10 TB data egress per month
- **No expiration** - truly always free!

**You will only be charged if:**
- You exceed free tier limits
- You use paid services (which you won't for this setup)

---

## Next Steps

1. ✅ Deploy ML API to OCI (this guide)
2. ✅ Update Vercel with ML API URL
3. ✅ Test end-to-end functionality
4. (Optional) Set up custom domain
5. (Optional) Configure SSL certificate (Let's Encrypt)

Your ML API is now running on Oracle Cloud's Always Free tier! 🚀

