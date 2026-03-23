# BUILD STAGE
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# PRODUCTION STAGE
FROM node:20-alpine AS production

# Security labels
LABEL maintainer="security@university.edu"
LABEL version="1.0"
LABEL description="Secure University Social Platform - Server"

# Security: Install security updates and create non-root user
RUN apk update && \
    apk upgrade && \
    apk add --no-cache wget && \
    rm -rf /var/cache/apk/* && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/index.js ./
COPY --from=builder --chown=nodejs:nodejs /app/controllers ./controllers
COPY --from=builder --chown=nodejs:nodejs /app/middleware ./middleware
COPY --from=builder --chown=nodejs:nodejs /app/models ./models
COPY --from=builder --chown=nodejs:nodejs /app/routes ./routes
COPY --from=builder --chown=nodejs:nodejs /app/data ./data

# Create public/assets directory and copy initial assets
RUN mkdir -p public/assets && chown -R nodejs:nodejs public
COPY --from=builder --chown=nodejs:nodejs /app/public/assets ./public/assets

# Security: Set environment variables
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn

# Security: Run as non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --spider -q http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "index.js"]
