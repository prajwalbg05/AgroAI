#!/bin/bash
# Oracle Cloud Infrastructure (OCI) Always Free Deployment Script
# For Ubuntu/Debian-based systems

set -e

echo "=== AgroAI ML API - OCI Deployment Script ==="

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Python 3.11 and dependencies
echo "Installing Python 3.11..."
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev python3-pip
sudo apt-get install -y build-essential gcc g++ make
sudo apt-get install -y libhdf5-dev pkg-config

# Install system dependencies for TensorFlow
sudo apt-get install -y libc6-dev libssl-dev libffi-dev

# Create application directory
APP_DIR="/opt/agroai-ml-api"
echo "Creating application directory at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Copy application files (assuming you're running this from the ml_api directory)
echo "Copying application files..."
cp -r . $APP_DIR/
cd $APP_DIR

# Create virtual environment
echo "Creating Python virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Install Python dependencies
echo "Installing Python dependencies (this may take 10-15 minutes)..."
pip install -r requirements.txt

# Create systemd service file
echo "Creating systemd service..."
sudo tee /etc/systemd/system/agroai-ml-api.service > /dev/null <<EOF
[Unit]
Description=AgroAI ML API Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
Environment="PATH=$APP_DIR/venv/bin"
Environment="PORT=5000"
ExecStart=$APP_DIR/venv/bin/gunicorn app_attention:app --bind 0.0.0.0:5000 --workers 2 --timeout 120
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
echo "Enabling and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable agroai-ml-api
sudo systemctl start agroai-ml-api

# Check status
echo "Checking service status..."
sudo systemctl status agroai-ml-api --no-pager

# Configure firewall (if ufw is installed)
if command -v ufw &> /dev/null; then
    echo "Configuring firewall..."
    sudo ufw allow 5000/tcp
    sudo ufw reload
fi

echo ""
echo "=== Deployment Complete ==="
echo "Service is running on port 5000"
echo "Check status: sudo systemctl status agroai-ml-api"
echo "View logs: sudo journalctl -u agroai-ml-api -f"
echo "Restart service: sudo systemctl restart agroai-ml-api"

