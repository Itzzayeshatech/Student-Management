# Render Deployment - Complete Guide

## Overview

This guide covers deploying your Student Management application on Render using two methods:
1. **Normal Deployment** - Simpler, faster (recommended for beginners)
2. **Docker Deployment** - More control, production parity

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with repository
- ✅ Render account (https://render.com)
- ✅ MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- ✅ Cloudinary account (https://cloudinary.com)

---

## Part 1: Database Setup (Both Methods)

### Step 1: Create MongoDB Atlas Cluster

**Why MongoDB Atlas?**
- Managed cloud database (no server setup needed)
- Free tier: 512MB storage (perfect for testing)
- Auto-backup and monitoring
- Works seamlessly with Render

**Steps:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up with email or Google
3. Create a new project:
   - Organization: Create one or use existing
   - Project name: `Student-Management`
4. Create a cluster:
   - Click "Create Deployment"
   - Choose "Free" tier
   - Select region (choose closest to your location or US)
   - Wait 5-10 minutes for cluster to create
5. Set up security:
   - Go to "Network Access" → "Add IP Address"
   - Add: `0.0.0.0/0` (allow all IPs - only for development)
     - ⚠️ For production, add specific Render IP
6. Create database user:
   - Go to "Database Access" → "Add Database User"
   - Username: `admin`
   - Password: Generate strong password (copy it!)
   - Click "Add User"
7. Get connection string:
   - Go to "Databases" → Click "Connect"
   - Choose "Connect your application"
   - Copy the URI: `mongodb+srv://admin:PASSWORD@cluster.mongodb.net/student-db?retryWrites=true&w=majority`
   - Replace `PASSWORD` with your password
   - Replace database name if needed

**Example URI:**
```
mongodb+srv://admin:mySecurePass123@cluster-xyz.mongodb.net/student-db?retryWrites=true&w=majority
```

---

## Part 2: Method 1 - Normal Deployment (Recommended)

### Step 1: Deploy Backend as Web Service

**On Render:**

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub:
   - Click "Connect account" (if not already connected)
   - Authorize GitHub
   - Select your repository: `Student-Management`
4. Configure Web Service:
   - Name: `student-management-backend`
   - Region: Choose closest region (or US East)
   - Branch: `main`
   - Root Directory: `/` (leave empty)
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variables:
   - Click "Advanced" → "Add Environment Variable"
   
   Add these one by one:
   
   ```
   KEY                          VALUE
   NODE_ENV                     production
   MONGO_URI                    mongodb+srv://admin:PASSWORD@cluster.mongodb.net/student-db?retryWrites=true&w=majority
   JWT_SECRET                   (generate: openssl rand -hex 32)
   CLOUDINARY_CLOUD_NAME        (from Cloudinary dashboard)
   CLOUDINARY_API_KEY           (from Cloudinary dashboard)
   CLOUDINARY_API_SECRET        (from Cloudinary dashboard)
   PORT                         5000
   SOCKET_CORS_ORIGIN           https://your-frontend-url.render.com,https://student-management-frontend.render.com
   LOG_LEVEL                    INFO
   UPLOAD_MAX_RETRIES           3
   UPLOAD_BASE_DELAY            1000
   ```

6. Choose plan:
   - Select "Free" (0.10/hour, pauses after 15 mins inactivity)
   - Or "Paid" ($7/month, always on)
7. Click "Create Web Service"
8. Wait for deployment (3-5 minutes)
9. Copy the service URL: `https://student-management-backend.render.com`

### Step 2: Deploy Frontend as Static Site

**On Render:**

1. Click "New +" → "Static Site"
2. Connect GitHub:
   - Select repository: `Student-Management`
3. Configure Static Site:
   - Name: `student-management-frontend`
   - Region: Same as backend
   - Branch: `main`
   - Build Command: `cd student-management-frontend && npm install && npm run build`
   - Publish Directory: `student-management-frontend/dist`
4. Add Environment Variable:
   - This is trickier for static sites. Use build variable:
   
   Add Environment Variable:
   ```
   KEY                    VALUE
   VITE_API_BASE_URL      https://student-management-backend.render.com/api/students
   ```

5. Click "Create Static Site"
6. Wait for deployment (2-3 minutes)
7. Copy the site URL: `https://student-management-frontend.render.com`

### Step 3: Update Backend CORS

1. Go back to backend service settings
2. Update `SOCKET_CORS_ORIGIN` with your frontend URL:
   ```
   https://student-management-frontend.render.com
   ```
3. Deploy (Render auto-deploys on environment variable change)

### Step 4: Test Deployment

1. Visit frontend: `https://student-management-frontend.render.com`
2. Try creating a student
3. Check if data persists in MongoDB Atlas
4. Verify WebSocket connection (check browser console)

---

## Part 2: Method 2 - Docker Deployment

### Step 1: Add Render Configuration File

Create `.render/build.sh`:

```bash
#!/bin/bash
set -e

echo "🐳 Building Docker images..."
docker-compose build

echo "📦 Pushing to Render..."
# Render handles pushing to their registry
```

### Step 2: Deploy on Render

1. Go to https://render.com/dashboard
2. Click "New +" → "Docker"
3. Connect GitHub:
   - Select repository
4. Configure Docker Service:
   - Name: `student-management`
   - Region: Choose your region
   - Branch: `main`
   - Root Directory: `/`
   - Docker Command: (leave empty, uses Dockerfile)
5. Add Environment Variables (same as Method 1):
   - All the env vars from Step 1 of Method 1
6. Click "Create Docker Service"
7. Wait for deployment (5-10 minutes, includes building images)

### Pros & Cons

| Feature | Method 1 (Normal) | Method 2 (Docker) |
|---------|-------------------|-------------------|
| **Setup Time** | Faster | Slower |
| **Control** | Limited | Complete |
| **Image Size** | N/A | ~500MB |
| **Cost** | Same | Same |
| **Production Ready** | Good | Better |

---

## Common Issues & Fixes

### Issue 1: "MongoDB connection refused"

**Cause:** IP whitelist or wrong credentials

**Fix:**
1. Check MongoDB Atlas IP whitelist:
   - Go to "Network Access"
   - Ensure `0.0.0.0/0` is added for development
   - Or add Render IP range: `0.0.0.0/0`
2. Verify credentials in `MONGO_URI`
3. Test URI locally first

### Issue 2: "WebSocket connection failed"

**Cause:** CORS misconfiguration

**Fix:**
1. Update `SOCKET_CORS_ORIGIN` to include frontend URL:
   ```
   https://student-management-frontend.render.com
   ```
2. Ensure backend is running (not paused)
3. Check browser console for exact error

### Issue 3: "Cannot GET /api/students"

**Cause:** Backend not running or wrong port

**Fix:**
1. Verify backend deployment succeeded (check logs)
2. Ensure `PORT=5000` env var is set
3. Check if backend service is paused (Free tier pauses after 15 mins)
4. Redeploy: Git push or click "Manual Deploy"

### Issue 4: "Frontend shows 404 or blank page"

**Cause:** Wrong build directory or API URL

**Fix:**
1. Verify build command: `cd student-management-frontend && npm run build`
2. Verify publish directory: `student-management-frontend/dist`
3. Check `VITE_API_BASE_URL` env var points to correct backend

### Issue 5: "Image upload fails (413 Payload Too Large)"

**Cause:** Nginx/Render has file size limit

**Fix:**
1. Update `nginx.conf`:
   ```nginx
   client_max_body_size 100M;
   ```
2. Redeploy
3. Limit uploads in frontend to < 50MB

---

## Environment Variables Reference

```bash
# Server
NODE_ENV=production              # Always "production" on Render
PORT=5000                        # Render port

# Database
MONGO_URI=mongodb+srv://...      # MongoDB Atlas connection string

# Authentication
JWT_SECRET=...                   # Random 32-char hex (openssl rand -hex 32)

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=...        # From Cloudinary dashboard
CLOUDINARY_API_KEY=...           # From Cloudinary settings
CLOUDINARY_API_SECRET=...        # From Cloudinary settings

# Real-time Communication
SOCKET_CORS_ORIGIN=https://...   # Frontend URL

# Logging & Uploads
LOG_LEVEL=INFO                   # DEBUG, INFO, WARN, ERROR
UPLOAD_MAX_RETRIES=3             # Retry failed uploads
UPLOAD_BASE_DELAY=1000           # Milliseconds
```

---

## Monitoring & Logs

### View Logs on Render

1. Backend: Go to service → "Logs" tab
2. Frontend: Go to static site → "Logs" tab
3. Search for errors: `ERROR`, `FATAL`, `Connection`

### Common Log Patterns

```
✅ Server running on port 5000       → Backend started successfully
🔌 Client connected: abc123          → WebSocket client connected
📤 Emitted "studentCreated"           → Real-time event sent
ERROR: MongoError...                 → Database connection issue
```

### Enable Debug Logging

Update `LOG_LEVEL`:
- `DEBUG` - Very verbose (development)
- `INFO` - Standard (default)
- `WARN` - Only warnings
- `ERROR` - Only errors

---

## Performance Tips

### 1. Use Paid Plan for Always-On

Free tier pauses after 15 minutes of inactivity:
- ❌ Not suitable for production
- ✅ Good for testing/demo
- Upgrade to Paid ($7/month) for always-on

### 2. Enable MongoDB Caching

In backend service, add env var:
```
CACHE_TTL=3600    # 1 hour cache
```

### 3. Optimize Frontend Build

In vite.config.js:
```javascript
export default {
  build: {
    minify: 'terser',
    sourcemap: false,  // Disable in production
  }
}
```

### 4. Use CDN for Images

Cloudinary URL already uses CDN, no extra work needed!

---

## Security Best Practices

### 1. Secrets Management

✅ **DO:**
- Use Render environment variables for secrets
- Generate strong JWT secrets: `openssl rand -hex 32`
- Use HTTPS only (Render provides free SSL)

❌ **DON'T:**
- Commit `.env` file to GitHub
- Use weak secrets like "password123"
- Share API keys in code

### 2. Database Security

✅ **DO:**
- Use MongoDB Atlas (managed security)
- Create separate DB user for Render
- Use strong passwords

❌ **DON'T:**
- Use admin account credentials
- Whitelist all IPs (0.0.0.0/0) in production

### 3. CORS Configuration

✅ **DO:**
- List specific frontend URL in CORS
- Use HTTPS URLs in production

❌ **DON'T:**
- Set CORS origin to `*` (any origin)
- Allow untrusted domains

---

## Deployment Checklist

Before going live:

- [ ] MongoDB Atlas cluster created
- [ ] Backend environment variables set
- [ ] Frontend environment variables set
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] WebSocket connection working
- [ ] File upload working
- [ ] Database persistence verified
- [ ] CORS issues resolved
- [ ] Logs monitored for errors
- [ ] Performance tested

---

## Useful Commands

```bash
# Test locally before deploying
npm install
npm run dev

# With Docker
docker-compose up --build

# View logs
docker-compose logs -f backend

# Generate JWT secret
openssl rand -hex 32

# Test MongoDB connection (from terminal)
mongosh "mongodb+srv://admin:PASSWORD@cluster.mongodb.net/student-db"
```

---

## Next Steps

1. Deploy using Method 1 (easier)
2. Monitor logs and test features
3. Upgrade to paid plan if needed (no downtime)
4. Set up GitHub Actions for auto-deployment (optional)

---

## Support

- **Render Docs:** https://render.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Socket.IO Docs:** https://socket.io/docs/

