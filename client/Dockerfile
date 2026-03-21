# ==================== BUILD STAGE ====================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy application code
COPY . .

# Build arguments for environment
ARG REACT_APP_API_BASE_URL=http://localhost:3001
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Build the application
RUN npm run build

# ==================== PRODUCTION STAGE ====================
FROM node:20-alpine AS production

# Security labels
LABEL maintainer="security@university.edu"
LABEL version="1.0"
LABEL description="Secure University Social Platform - Client"

# Security: Install security updates and serve package
RUN apk update && \
    apk upgrade && \
    rm -rf /var/cache/apk/* && \
    npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/build ./build

# Run as non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start serve
CMD ["serve", "-s", "build", "-l", "3000"]
