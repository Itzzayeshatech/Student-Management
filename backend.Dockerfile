# ==========================================
# Student Management - Backend Dockerfile (Docker Compose)
# ==========================================
# Optimized for docker-compose local development

FROM node:18-alpine

LABEL maintainer="Your Team"
LABEL description="Student Management Backend"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Start application
CMD ["npm", "start"]
