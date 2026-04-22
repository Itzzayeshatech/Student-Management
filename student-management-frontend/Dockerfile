# ==========================================
# Student Management - Frontend Dockerfile
# ==========================================
# Multi-stage build: Build React app, serve with Nginx

# Stage 1: Build React app with Vite
FROM node:18-alpine AS builder

LABEL maintainer="Your Team"
LABEL description="Student Management Frontend - Build Stage"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

LABEL maintainer="Your Team"
LABEL description="Student Management Frontend - Production"

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
