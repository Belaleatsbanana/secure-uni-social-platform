# DigitalOcean App Platform Deployment Guide

This guide explains how to deploy the secure-uni-social-platform on DigitalOcean using the pre-built Docker images from GitHub Container Registry.

## Prerequisites

- GitHub repository with packages published at:
  - `ghcr.io/belaleatsbanana/secure-uni-social-platform/server:latest`
  - `ghcr.io/belaleatsbanana/secure-uni-social-platform/client:latest`
- DigitalOcean account with App Platform access
- MongoDB Atlas connection string (or use DigitalOcean managed database)

---

## Step 1: Deploy the Server App

### Create New App
1. Go to **DigitalOcean App Platform** → **Create App**
2. Select **GitHub Container Registry** as source
3. Enter repository: `Belaleatsbanana/secure-uni-social-platform/server`
4. Tag: `latest`

### Resource Settings
| Setting | Value |
|---------|-------|
| **Name** | `secure-uni-social-server` |
| **Resource Type** | Web Service |
| **Instance Size** | 1 GB RAM / 1 Shared vCPU |
| **HTTP Port** | **3001** ⚠️ (not 8080!) |

### Environment Variables
| Key | Value |
|-----|-------|
| `MONGO_URL` | `mongodb+srv://...` (your MongoDB Atlas connection string) |
| `JWT_SECRET` | Your secure 64+ character secret |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `http://localhost:3000` (update later with client URL) |

### Deploy
Click **Create Resources**. Note the server URL (e.g., `https://secure-uni-social-server-xxxxx.ondigitalocean.app`)

---

## Step 2: Deploy the Client App

### Important: Rebuild Docker Image First

The client needs the server URL baked in at build time. You have two options:

#### Option A: Use GitHub Actions (Recommended)
1. Add a repository secret `REACT_APP_API_BASE_URL` with your server URL
2. Push to trigger a new build
3. Wait for CI/CD to complete

#### Option B: Build Manually
```bash
docker build \
  --build-arg REACT_APP_API_BASE_URL=https://your-server-url.ondigitalocean.app \
  -t ghcr.io/belaleatsbanana/secure-uni-social-platform/client:latest \
  ./client

docker push ghcr.io/belaleatsbanana/secure-uni-social-platform/client:latest
```

### Create New App
1. Go to **DigitalOcean App Platform** → **Create App**
2. Select **GitHub Container Registry** as source
3. Enter repository: `Belaleatsbanana/secure-uni-social-platform/client`
4. Tag: `latest`

### Resource Settings
| Setting | Value |
|---------|-------|
| **Name** | `secure-uni-social-client` |
| **Resource Type** | Web Service |
| **Instance Size** | Basic (512 MB is sufficient) |
| **HTTP Port** | **3000** |

### No Environment Variables Needed
The API URL is baked into the build.

### Deploy
Click **Create Resources**. Note the client URL.

---

## Step 3: Update Server CORS

After deploying the client, update the server's `ALLOWED_ORIGINS`:

1. Go to your **Server App** → **Settings** → **App-Level Environment Variables**
2. Update `ALLOWED_ORIGINS` to include the client URL:
   ```
   https://secure-uni-social-client-xxxxx.ondigitalocean.app
   ```
3. Click **Save** → The server will automatically redeploy

---

## Verification Checklist

- [ ] Server responds at `/` with a message
- [ ] Client loads the login page
- [ ] Registration works (creates user in MongoDB)
- [ ] Login works (returns JWT token)
- [ ] Posts, comments, and messages work

---

## Troubleshooting

### "Network Error" or "Failed to fetch"
- Check browser console for CORS errors
- Verify `ALLOWED_ORIGINS` includes the exact client URL (with https://)
- Ensure server HTTP port is set to 3001

### "Cannot connect to database"
- Verify MongoDB Atlas connection string is correct
- Check that your DigitalOcean IP is whitelisted in MongoDB Atlas Network Access

### Client shows blank page
- Check that `REACT_APP_API_BASE_URL` was set correctly during build
- Rebuild client image with correct URL and redeploy

### Images/assets not loading
- The server serves static files from `/assets`
- Ensure the server has the assets uploaded via the app

---

## Environment Variables Summary

### Server
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-64-char-secret
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://your-client-url.ondigitalocean.app
```

### Client (Build-time)
```
REACT_APP_API_BASE_URL=https://your-server-url.ondigitalocean.app
```

---

## Security Notes

1. **Use HTTPS** - DigitalOcean provides free SSL certificates
2. **Encrypt secrets** - Mark sensitive env vars as encrypted in DigitalOcean
3. **Rotate JWT_SECRET** periodically
4. **Keep MongoDB Atlas IP whitelist updated** or use 0.0.0.0/0 for App Platform's dynamic IPs
