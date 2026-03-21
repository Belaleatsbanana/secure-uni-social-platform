# DevSecOps Implementation Report
## Secure University Social Platform

**Date:** March 21, 2026  
**Author:** Security Implementation Team

---

## Executive Summary

This document details the DevSecOps improvements implemented in the Secure University Social Platform, covering both server-side (Node.js/Express) and client-side (React) components. The implementation addressed 20+ security vulnerabilities and includes comprehensive CI/CD pipelines with Docker containerization.

---

## Table of Contents

1. [Vulnerabilities Identified](#vulnerabilities-identified)
2. [Security Improvements Implemented](#security-improvements-implemented)
3. [DevOps Implementation](#devops-implementation)
4. [Docker Security](#docker-security)
5. [Files Modified](#files-modified)
6. [Next Steps](#next-steps)

---

## Vulnerabilities Identified

### Critical Severity 🔴

| # | Issue | Location | Status |
|---|-------|----------|--------|
| 1 | Weak JWT Secret ("chef") | server/.env | ⚠️ NEEDS ROTATION |
| 2 | Exposed MongoDB credentials in .env | server/.env | ⚠️ NEEDS ROTATION |
| 3 | No authorization check on createPost (userId from body) | server/controllers/posts.js | ✅ FIXED |
| 4 | No authorization check on addRemoveFriend | server/controllers/users.js | ✅ FIXED |
| 5 | Bug: `filter((id) => id !== id)` removes all friends | server/controllers/users.js:42 | ✅ FIXED |
| 6 | No file upload restrictions (size/type) | server/index.js | ✅ FIXED |

### High Severity 🟠

| # | Issue | Location | Status |
|---|-------|----------|--------|
| 7 | No input validation on any endpoint | All controllers | ✅ FIXED |
| 8 | Sensitive error messages exposed to clients | All controllers | ✅ FIXED |
| 9 | JWT tokens never expire | server/controllers/auth.js | ✅ FIXED (24h expiry) |
| 10 | CORS allows any origin | server/index.js | ✅ FIXED |
| 11 | No rate limiting | All routes | ✅ FIXED |
| 12 | Password returned in user object | server/controllers/users.js | ✅ FIXED |
| 13 | Hardcoded API URLs in client | client/src/* | ✅ PARTIALLY FIXED |

### Medium Severity 🟡

| # | Issue | Location | Status |
|---|-------|----------|--------|
| 14 | No password strength requirements | server/controllers/auth.js | ✅ FIXED (8+ chars) |
| 15 | Excessive request size limit (30MB) | server/index.js | ✅ FIXED (5MB) |
| 16 | No NoSQL injection protection | server/index.js | ✅ FIXED |
| 17 | No HTTP Parameter Pollution protection | server/index.js | ✅ FIXED |
| 18 | Deprecated trimLeft() method | server/middleware/auth.js | ✅ FIXED |
| 19 | Client token stored in localStorage | client/src/index.js | ⚠️ NEEDS ATTENTION |

### Low Severity 🔵

| # | Issue | Location | Status |
|---|-------|----------|--------|
| 20 | No pagination on feed posts | server/controllers/posts.js | ✅ FIXED |
| 21 | No request timeout in client | client/src/* | ✅ FIXED (config added) |
| 22 | Missing .env.example files | Both projects | ✅ FIXED |

---

## Security Improvements Implemented

### 1. Rate Limiting

Added three levels of rate limiting to prevent brute force attacks:

```javascript
// General API limit: 1000 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

// Auth routes: 100 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Login endpoint: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});
```

### 2. CORS Configuration

Restricted CORS to allowed origins only:

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 3. File Upload Security

Implemented strict file upload controls:

```javascript
const ALLOWED_FILE_TYPES = /jpeg|jpg|png|gif/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const upload = multer({ 
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const extname = ALLOWED_FILE_TYPES.test(path.extname(file.originalname).toLowerCase());
    const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed!'), false);
    }
  }
});
```

### 4. JWT Token Expiration

Added 24-hour expiration to JWT tokens:

```javascript
const token = jwt.sign(
  { id: user._id }, 
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### 5. Authorization Checks

Added ownership validation to all sensitive operations:

```javascript
// Example: createPost now validates userId matches token
if (req.user.id !== userId) {
  return res.status(403).json({ error: "Not authorized to create posts for other users" });
}
```

### 6. Input Validation

Added validation for all user inputs:

```javascript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: "Invalid email format" });
}

// Password strength
if (password.length < 8) {
  return res.status(400).json({ error: "Password must be at least 8 characters" });
}
```

### 7. Error Handling

Replaced detailed error messages with generic ones:

```javascript
// Before (INSECURE)
res.status(500).json({ error: err.message });

// After (SECURE)
console.error("Error:", err.message); // Log for debugging
res.status(500).json({ error: "Internal server error" });
```

### 8. NoSQL Injection Protection

Added mongo-sanitize middleware:

```javascript
import mongoSanitize from "express-mongo-sanitize";
app.use(mongoSanitize());
```

### 9. HTTP Parameter Pollution Protection

Added hpp middleware:

```javascript
import hpp from "hpp";
app.use(hpp());
```

### 10. Client API Configuration

Created centralized API configuration with timeout support:

```javascript
// client/src/config/api.js
export const apiFetch = async (endpoint, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  // ... error handling
};
```

---

## DevOps Implementation

### GitHub Actions CI/CD Pipeline

Two automated workflows have been implemented:

#### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

Triggers on push/PR to master/main branches:

```
┌─────────────────┐
│  Security Scan  │ ── npm audit, TruffleHog secret scan
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Server │ │ Client │ ── Install deps, lint, test, build
│  Test  │ │  Test  │
└───┬────┘ └────┬───┘
    └─────┬─────┘
          ▼
┌─────────────────┐
│  Docker Build   │ ── Build images, Trivy vulnerability scan
│    & Scan       │
└─────────────────┘
```

**Pipeline Jobs:**
- **Security Scan**: Runs npm audit on both projects, scans for secrets with TruffleHog
- **Server Tests**: Runs with MongoDB service container, executes lint and tests
- **Client Tests**: Runs lint, tests, and builds the React application
- **Docker Build**: Builds production Docker images and scans with Trivy

#### 2. Security Scanning Pipeline (`.github/workflows/security.yml`)

Runs on push/PR and weekly (Monday 9 AM):

- **Dependency Scanning**: Snyk vulnerability scanning
- **Secret Detection**: TruffleHog + GitLeaks
- **SAST**: CodeQL static analysis
- **Container Scanning**: Trivy with SARIF output to GitHub Security tab
- **License Compliance**: Checks for GPL/AGPL licenses

### Running Tests Locally

```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test -- --watchAll=false

# Run all with Docker
docker-compose -f docker-compose.dev.yml up --build
```

---

## Docker Security

### Security Features Implemented

#### 1. Multi-Stage Builds
- Separate builder and production stages
- Only production dependencies in final image
- Smaller attack surface

#### 2. Non-Root Users
```dockerfile
# Server Dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

#### 3. Read-Only Filesystems
```yaml
# docker-compose.yml
read_only: true
tmpfs:
  - /tmp
```

#### 4. Dropped Capabilities
```yaml
cap_drop:
  - ALL
security_opt:
  - no-new-privileges:true
```

#### 5. Resource Limits
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```

#### 6. Network Isolation
```yaml
networks:
  backend:
    internal: true  # Not accessible from outside
```

#### 7. Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health'..."
```

### Docker Commands

```bash
# Development (with hot reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Production
cp .env.docker.example .env
# Edit .env with your secrets
docker-compose up --build -d

# View logs
docker-compose logs -f server
docker-compose logs -f client

# Stop all containers
docker-compose down

# Remove volumes (CAUTION: deletes data)
docker-compose down -v
```

### Nginx Security Configuration

The client container uses a hardened nginx configuration:

```nginx
# Security Headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'..." always;

# Hide version
server_tokens off;

# Prevent slowloris attacks
client_body_timeout 12;
client_header_timeout 12;
```

---

## Files Modified

### Server

| File | Changes |
|------|---------|
| `server/index.js` | Added rate limiting, CORS config, file upload security, error handling, NoSQL protection, health endpoint |
| `server/controllers/auth.js` | Added input validation, password strength, JWT expiration, secure error responses |
| `server/controllers/users.js` | Added authorization checks, fixed friend removal bug, excluded password from responses |
| `server/controllers/posts.js` | Added authorization checks, input validation, pagination |
| `server/middleware/auth.js` | Added token expiration handling, fixed deprecated method |
| `server/package.json` | Added security dependencies |
| `server/.env.example` | Created template for secure configuration |
| `server/Dockerfile` | Created production Dockerfile with security hardening |
| `server/Dockerfile.dev` | Created development Dockerfile with hot reload |
| `server/.dockerignore` | Created to exclude sensitive files from image |

### Client

| File | Changes |
|------|---------|
| `client/src/config/api.js` | Created centralized API configuration |
| `client/.env` | Created environment configuration |
| `client/.env.example` | Created template |
| `client/.gitignore` | Added .env to ignored files |
| `client/Dockerfile` | Created production Dockerfile with nginx |
| `client/Dockerfile.dev` | Created development Dockerfile with hot reload |
| `client/nginx.conf` | Created hardened nginx configuration |
| `client/.dockerignore` | Created to exclude sensitive files from image |

### DevOps Files (New)

| File | Description |
|------|-------------|
| `.github/workflows/ci-cd.yml` | Main CI/CD pipeline with tests, builds, and security scans |
| `.github/workflows/security.yml` | Dedicated security scanning pipeline |
| `docker-compose.yml` | Production Docker Compose with security settings |
| `docker-compose.dev.yml` | Development override with hot reload |
| `docker/mongo-init.js` | MongoDB initialization script |
| `.env.docker.example` | Docker environment template |

### New Dependencies Added (Server)

```json
{
  "express-rate-limit": "^7.x",
  "express-validator": "^7.x",
  "express-mongo-sanitize": "^2.x",
  "hpp": "^0.x",
  "validator": "^13.x"
}
```

---

## Next Steps

### Immediate Actions Required ⚠️

1. **ROTATE SECRETS** (Critical - Do Today)
   ```bash
   # Generate new JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Update server/.env with:
   # - New JWT_SECRET (64+ characters)
   # - New MongoDB password (rotate in MongoDB Atlas)
   ```

2. **Remove .env from Git History**
   ```bash
   # Install git-filter-repo
   pip install git-filter-repo
   
   # Remove .env from history
   git filter-repo --path server/.env --invert-paths
   
   # Force push (coordinate with team)
   git push origin --force --all
   ```

3. **Update Client API Calls**
   - Replace hardcoded `http://localhost:3001` with `API_BASE_URL` from config
   - Files to update:
     - `client/src/scenes/loginPage/Form.jsx`
     - `client/src/components/Friend.jsx`
     - `client/src/scenes/widgets/*.jsx`
     - `client/src/scenes/profilePage/index.jsx`

### Short-term (This Week)

4. **Implement Refresh Tokens**
   - Create `/auth/refresh` endpoint
   - Store refresh tokens securely (httpOnly cookies)
   - Implement automatic token refresh in client

5. **Add HTTPS**
   - Configure SSL certificates
   - Redirect HTTP to HTTPS
   - Update CORS allowed origins

6. **Add Security Headers**
   ```javascript
   // Already using helmet, but add CSP:
   app.use(helmet.contentSecurityPolicy({
     directives: {
       defaultSrc: ["'self'"],
       scriptSrc: ["'self'"],
       styleSrc: ["'self'", "'unsafe-inline'"],
       imgSrc: ["'self'", "data:", "https:"],
     }
   }));
   ```

### Medium-term (This Month)

7. **Implement Password Reset**
   - Create `/auth/forgot-password` endpoint
   - Send reset email with time-limited token
   - Create `/auth/reset-password` endpoint

8. **Add Audit Logging**
   ```javascript
   // Log security events
   const auditLog = (action, userId, details) => {
     console.log(JSON.stringify({
       timestamp: new Date().toISOString(),
       action,
       userId,
       details,
     }));
   };
   ```

9. **Set Up CI/CD Security Scanning**
   ```yaml
   # .github/workflows/security.yml
   name: Security Scan
   on: [push, pull_request]
   jobs:
     security:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Run npm audit
           run: |
             cd server && npm audit --audit-level=high
             cd ../client && npm audit --audit-level=high
         - name: Run Snyk
           uses: snyk/actions/node@master
           env:
             SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
   ```

10. **Migrate Token Storage**
    - Move from localStorage to httpOnly cookies
    - Update auth flow to use secure cookies
    - Implement CSRF protection

### Long-term (This Quarter)

11. **Add Two-Factor Authentication (2FA)**
12. **Implement Account Lockout Policy**
13. **Add Security Monitoring/Alerting**
14. **Conduct Penetration Testing**
15. **Create Security Documentation for Developers**

---

## Testing Security Changes

After implementing these changes, verify they work:

```bash
# 1. Test rate limiting (should get blocked after 5 login attempts)
for i in {1..10}; do
  curl -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# 2. Test file upload restrictions
curl -X POST http://localhost:3001/auth/register \
  -F "firstName=Test" \
  -F "lastName=User" \
  -F "email=test@test.com" \
  -F "password=testpass123" \
  -F "picture=@malicious.exe"  # Should be rejected

# 3. Test CORS (should fail from disallowed origin)
curl -X GET http://localhost:3001/posts \
  -H "Origin: http://evil-site.com"

# 4. Test JWT expiration
# Get a token, wait 24 hours, verify it fails
```

---

## Security Checklist

- [x] Rate limiting implemented
- [x] CORS restricted to allowed origins
- [x] File upload size and type restrictions
- [x] JWT expiration added
- [x] Authorization checks on all mutations
- [x] Input validation added
- [x] Error messages sanitized
- [x] NoSQL injection protection
- [x] HTTP Parameter Pollution protection
- [x] Password excluded from API responses
- [x] Pagination added to prevent data dumps
- [ ] Secrets rotated
- [ ] .env removed from git history
- [ ] Client API URLs centralized
- [ ] HTTPS configured
- [ ] Refresh tokens implemented
- [ ] Password reset functionality
- [ ] 2FA implemented
- [ ] Security monitoring

---

## Current Status (March 21, 2026)

✅ **All Docker containers are running successfully:**

```
NAMES               STATUS                 PORTS
uni-social-client   Up (healthy)           0.0.0.0:80->80/tcp
uni-social-server   Up (healthy)           3001/tcp
uni-social-mongodb  Up (healthy)           (internal)
```

### Quick Start Commands

```bash
# Start all containers
docker-compose up -d

# Check status
docker ps

# View logs
docker-compose logs -f

# Stop all containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Access Points

- **Frontend:** http://localhost:80
- **API Server:** http://localhost:3001 (internal only by default)
- **Health Check:** http://localhost:3001/health

---

## Conclusion

This implementation significantly improves the security posture of the Secure University Social Platform. However, the **most critical action** is to immediately rotate all secrets (JWT_SECRET and MongoDB credentials) as they were previously exposed.

The security measures implemented follow OWASP best practices and address the most common web application vulnerabilities including injection, broken authentication, sensitive data exposure, and broken access control.

---

*Report generated as part of DevSecOps implementation*
