# ⚡ Quick Deployment Guide

**Fast track to deploy your app in 15 minutes!**

## Prerequisites
- GitHub account with your code pushed
- A server with Docker installed
- MongoDB Atlas account

---

## Part 1: GitHub Setup (5 minutes)

### 1. Add Repository Secrets

Go to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these two secrets:

```
Name: MONGO_URL
Value: mongodb+srv://user:password@cluster.mongodb.net/dbname

Name: JWT_SECRET
Value: your-super-secret-32-character-minimum-key
```

### 2. Enable Actions

Go to: **Settings** → **Actions** → **General**
- Select: "Allow all actions and reusable workflows"
- Click **Save**

### 3. Trigger Deployment

```bash
git add .
git commit -m "Enable deployment"
git push origin main
```

Go to **Actions** tab and watch it deploy! ⏳

---

## Part 2: Server Setup (10 minutes)

### 1. Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Logout and login again.

### 2. Create Deployment Files

```bash
mkdir ~/app && cd ~/app
```

Create `docker-compose.yml`:

```yaml
services:
  server:
    image: ghcr.io/YOUR_USERNAME/YOUR_REPO/server:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGO_URL: ${MONGO_URL}
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_ORIGINS: http://YOUR_SERVER_IP:3000
    ports:
      - "3001:3001"
    networks:
      - app-network

  client:
    image: ghcr.io/YOUR_USERNAME/YOUR_REPO/client:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    networks:
      - app-network
    depends_on:
      - server

networks:
  app-network:
```

Create `.env`:

```bash
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-32-character-minimum-key
ALLOWED_ORIGINS=http://YOUR_SERVER_IP:3000
```

### 3. Login to GitHub Container Registry

```bash
# Create token at: github.com → Settings → Developer settings → Personal access tokens
# Permissions needed: read:packages

echo YOUR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

### 4. Deploy!

```bash
docker compose pull
docker compose up -d
docker compose logs -f
```

---

## ✅ Done!

Visit: `http://YOUR_SERVER_IP:3000`

---

## Update Deployment (1 minute)

After pushing code changes:

```bash
cd ~/app
docker compose pull && docker compose up -d
```

---

## Troubleshooting

**Can't pull images?**
```bash
# Make package public on GitHub:
# Go to repository → Packages → Your package → Settings → Change visibility to Public
```

**Server not starting?**
```bash
docker compose logs server
# Check your MONGO_URL and JWT_SECRET
```

**Can't access from browser?**
```bash
sudo ufw allow 3000
sudo ufw allow 3001
```

---

## Need More Help?

See full guide: `DEPLOYMENT.md`
