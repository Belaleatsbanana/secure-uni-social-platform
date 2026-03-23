# 🚀 Deployment Guide - Secure University Social Platform

This guide provides step-by-step instructions to deploy your application using GitHub Actions and GitHub Container Registry (GHCR).

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub Configuration](#github-configuration)
3. [Automatic Deployment Setup](#automatic-deployment-setup)
4. [Deploying to a Server](#deploying-to-a-server)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ A GitHub account and repository with your code
- ✅ Docker installed on your deployment server
- ✅ A server with public IP (VPS, AWS EC2, DigitalOcean, etc.)
- ✅ MongoDB Atlas account (or MongoDB server)
- ✅ Basic knowledge of command line and Docker

---

## GitHub Configuration

### Step 1: Enable GitHub Actions

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Navigate to **Actions** → **General**
4. Under "Actions permissions", select **Allow all actions and reusable workflows**
5. Click **Save**

### Step 2: Enable GitHub Container Registry

GitHub Container Registry (GHCR) is automatically enabled for all repositories. No additional setup needed.

### Step 3: Configure Repository Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

#### Required Secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key-min-32-chars` |

#### Optional Secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `REACT_APP_API_BASE_URL` | API URL for frontend | `https://api.yourdomain.com` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://yourdomain.com,https://www.yourdomain.com` |

### Step 4: Create Production Environment

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name it **production**
4. Click **Configure environment**
5. (Optional) Add environment protection rules:
   - ✅ Required reviewers
   - ✅ Wait timer
   - ✅ Deployment branches (restrict to main/master)

---

## Automatic Deployment Setup

### How It Works

The CI/CD pipeline automatically:

1. ✅ Runs security scans on every push
2. ✅ Executes tests for server and client
3. ✅ Builds Docker images
4. ✅ Scans images for vulnerabilities
5. ✅ **Pushes images to GitHub Container Registry** (on main/master branch)

### Trigger Deployment

Simply push to your main/master branch:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### Monitor Deployment

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Select the latest workflow run
4. Watch the deployment progress in real-time

### Deployment Artifacts

After successful deployment, your Docker images will be available at:

- **Server**: `ghcr.io/your-username/your-repo/server:latest`
- **Client**: `ghcr.io/your-username/your-repo/client:latest`

---

## Deploying to a Server

### Step 1: Prepare Your Server

#### Install Docker (Ubuntu/Debian)

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER
```

Logout and login again for group changes to take effect.

### Step 2: Create Deployment Directory

```bash
# Create directory for your application
mkdir -p ~/secure-uni-social-platform
cd ~/secure-uni-social-platform
```

### Step 3: Create docker-compose.yml

Create a file called `docker-compose.yml`:

```yaml
services:
  server:
    image: ghcr.io/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/server:latest
    container_name: uni-social-server
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      MONGO_URL: ${MONGO_URL}
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    ports:
      - "3001:3001"
    volumes:
      - ./uploads:/app/public/assets
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  client:
    image: ghcr.io/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/client:latest
    container_name: uni-social-client
    restart: unless-stopped
    ports:
      - "3000:3000"
    networks:
      - app-network
    depends_on:
      server:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  app-network:
    driver: bridge
```

**Important**: Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPO_NAME` with your actual values!

### Step 4: Create .env File

Create a file called `.env` with your secrets:

```bash
# MongoDB Connection
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT Secret (must be at least 32 characters)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-to-something-random

# CORS Allowed Origins (comma-separated)
ALLOWED_ORIGINS=http://your-domain.com,https://your-domain.com
```

**Security Note**: Ensure `.env` is not committed to version control!

```bash
chmod 600 .env  # Make file readable only by owner
```

### Step 5: Login to GitHub Container Registry

```bash
# Create a Personal Access Token (PAT) on GitHub:
# 1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
# 2. Click "Generate new token (classic)"
# 3. Select scopes: read:packages
# 4. Copy the token

# Login to GHCR
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### Step 6: Pull and Run the Application

```bash
# Pull latest images
docker compose pull

# Start the application
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 7: Verify Deployment

Visit your server in a browser:
- Client: `http://your-server-ip:3000`
- Server: `http://your-server-ip:3001/health`

---

## Environment Variables

### Server Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | No | Server port (default: 3001) | `3001` |
| `MONGO_URL` | Yes | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Yes | JWT signing secret | `min-32-character-secret` |
| `ALLOWED_ORIGINS` | Yes | CORS allowed origins | `http://localhost:3000` |

### Client Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | No | Backend API URL | `http://localhost:3001` |

---

## Updating Your Deployment

### Automatic Update (Recommended)

1. Push code changes to main/master branch
2. GitHub Actions automatically builds and pushes new images
3. On your server, run:

```bash
cd ~/secure-uni-social-platform

# Pull latest images
docker compose pull

# Restart services
docker compose up -d

# Remove old images
docker image prune -f
```

### Manual Update Script

Create an `update.sh` script:

```bash
#!/bin/bash
cd ~/secure-uni-social-platform

echo "🔄 Pulling latest images..."
docker compose pull

echo "🔄 Restarting services..."
docker compose up -d

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Update complete!"
docker compose ps
```

Make it executable and run:

```bash
chmod +x update.sh
./update.sh
```

---

## Setting Up a Domain (Optional)

### Using Nginx as Reverse Proxy

1. **Install Nginx:**

```bash
sudo apt update
sudo apt install -y nginx
```

2. **Create Nginx configuration:**

```bash
sudo nano /etc/nginx/sites-available/uni-social
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Client
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable the site:**

```bash
sudo ln -s /etc/nginx/sites-available/uni-social /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Setup SSL with Let's Encrypt (Recommended):**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Troubleshooting

### Deployment Failed on GitHub Actions

**Check workflow logs:**
1. Go to Actions tab
2. Click on the failed workflow
3. Expand failed steps to see error messages

**Common issues:**
- Missing secrets: Add required secrets in repository settings
- Permission denied: Ensure GITHUB_TOKEN has package write permissions

### Images Not Pulling on Server

**Authentication error:**
```bash
# Re-login to GHCR
echo YOUR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
```

**Make images public (alternative):**
1. Go to your repository on GitHub
2. Click on **Packages** (right sidebar)
3. Click on your package
4. Go to **Package settings**
5. Change visibility to **Public**

### Server Not Starting

**Check logs:**
```bash
docker compose logs server
```

**Common issues:**
- Invalid MONGO_URL: Verify connection string
- Missing JWT_SECRET: Add to .env file
- Port conflict: Change port in docker-compose.yml

### Cannot Access Application

**Check if containers are running:**
```bash
docker compose ps
```

**Check firewall:**
```bash
# Allow ports
sudo ufw allow 3000
sudo ufw allow 3001
```

**Check if services are listening:**
```bash
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
```

### Database Connection Issues

**Test MongoDB connection:**
```bash
# Install mongosh
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-mongosh

# Test connection
mongosh "YOUR_MONGO_URL"
```

---

## Useful Commands

### Docker Commands

```bash
# View running containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f server

# Restart services
docker compose restart

# Stop services
docker compose down

# Remove everything (including volumes)
docker compose down -v

# Check resource usage
docker stats
```

### Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## Security Best Practices

1. ✅ **Never commit secrets** to version control
2. ✅ **Use strong JWT secrets** (minimum 32 characters)
3. ✅ **Keep Docker images updated** regularly
4. ✅ **Enable firewall** on your server
5. ✅ **Use HTTPS** with SSL certificates
6. ✅ **Backup your database** regularly
7. ✅ **Monitor logs** for suspicious activity
8. ✅ **Update dependencies** frequently

---

## Quick Reference

### One-Command Deployment

After initial setup, update with:

```bash
cd ~/secure-uni-social-platform && docker compose pull && docker compose up -d && docker image prune -f
```

### Health Check URLs

- Server: `http://your-server:3001/health`
- Client: `http://your-server:3000`

---

## Support & Resources

- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose Documentation**: https://docs.docker.com/compose/
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **GitHub Container Registry**: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry

---

## Summary

You've learned how to:
1. ✅ Configure GitHub Actions for automated deployment
2. ✅ Push Docker images to GitHub Container Registry
3. ✅ Deploy the application on any server
4. ✅ Update your deployment automatically
5. ✅ Troubleshoot common issues

**Your application is now production-ready and automatically deployed!** 🎉
