# OCI Always Free - Quick Start Guide

## TL;DR - Fastest Deployment

### 1. Create VM (5 minutes)
- OCI Console → Compute → Create Instance
- Shape: **VM.Standard.A1.Flex** (2 OCPUs, 12 GB RAM)
- Image: **Ubuntu 22.04**
- Add SSH key
- **Note the Public IP**

### 2. Open Port 5000 (1 minute)
- VCN → Security Lists → Add Ingress Rule
- Port: `5000`, Source: `0.0.0.0/0`

### 3. Connect & Deploy (15 minutes)
```bash
# Connect via SSH
ssh -i your-key.key ubuntu@<PUBLIC_IP>

# Clone and deploy
git clone https://github.com/prajwalbg05/AgroAI.git
cd AgroAI/ml_api
chmod +x oci-deploy.sh
./oci-deploy.sh
```

### 4. Test
```bash
curl http://<PUBLIC_IP>:5000/health
```

### 5. Update Vercel
- Environment Variable: `ML_API_URL` = `http://<PUBLIC_IP>:5000`

**Done!** 🎉

---

## Common Issues

**Can't connect via SSH?**
- Check security list allows port 22
- Verify you're using correct private key
- Try: `ssh -v -i key.key ubuntu@IP` for debug info

**Service not starting?**
```bash
sudo journalctl -u agroai-ml-api -n 50
```

**Port 5000 not accessible?**
- Verify security list rule
- Check: `sudo ufw status`
- Test locally: `curl http://localhost:5000/health`

---

## Your API URL Format

```
http://<YOUR_PUBLIC_IP>:5000
```

Example:
```
http://123.456.789.012:5000
```

Use this URL in Vercel's `ML_API_URL` environment variable.

