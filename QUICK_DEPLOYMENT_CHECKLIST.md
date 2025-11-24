# ⚡ Quick Deployment Checklist

Use this as a quick reference while deploying. For detailed instructions, see [DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md).

## Pre-Deployment

- [ ] Code committed and pushed to GitHub
- [ ] All changes saved
- [ ] Git status is clean

## ML API Deployment (Oracle Cloud)

- [ ] OCI account created
- [ ] VM instance created (Ubuntu 22.04, 2 OCPUs, 12GB RAM)
- [ ] Public IP noted: `_________________`
- [ ] Firewall rule added (port 5000)
- [ ] SSH key downloaded and saved
- [ ] Connected to VM via SSH
- [ ] Repository cloned
- [ ] `oci-deploy.sh` executed
- [ ] ML API health check passed: `curl http://<IP>:5000/health`
- [ ] **ML API URL**: `http://<IP>:5000` ✅

## Vercel Deployment

- [ ] Vercel account created
- [ ] GitHub repository imported
- [ ] Project configured (Framework: "Other")
- [ ] Environment variables added:
  - [ ] `GROQ_API_KEY`: `_________________`
  - [ ] `ML_API_URL`: `http://<IP>:5000`
  - [ ] `OPENWEATHER_API_KEY`: `_________________` (optional)
- [ ] Deployment started
- [ ] Deployment successful
- [ ] **Vercel URL**: `https://_________________.vercel.app` ✅

## Testing

- [ ] Frontend loads at Vercel URL
- [ ] Live Prices page works
- [ ] Price Predictions work (ML API connection)
- [ ] AI Assistant works (Groq API)
- [ ] Voice features work (if applicable)

## Post-Deployment

- [ ] Reserved Public IP in OCI (optional but recommended)
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up (optional)

---

## 🔑 Important URLs to Save

- **ML API**: `http://_________________:5000`
- **Vercel App**: `https://_________________.vercel.app`
- **GitHub Repo**: `_________________`

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| ML API not responding | Check OCI VM: `sudo systemctl status agroai-ml-api` |
| Vercel can't connect to ML API | Verify `ML_API_URL` env var, then redeploy |
| Frontend errors | Check browser console (F12) |
| AI Assistant not working | Verify `GROQ_API_KEY` env var |

---

**For detailed instructions, see [DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md)**

