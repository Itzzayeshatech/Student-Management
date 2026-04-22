# Error Handling & Troubleshooting Guide

## Quick Diagnosis

Run this to check your setup:

```bash
# Check Node.js version
node --version              # Should be 18+

# Check npm
npm --version

# Check if port 5000 is in use
# Windows:
netstat -ano | findstr :5000

# Mac/Linux:
lsof -i :5000

# Check MongoDB connection locally
mongosh "mongodb://localhost:27017"

# Check environment variables
env | grep CLOUDINARY
env | grep MONGO
env | grep JWT
```

---

## Category 1: Server/Port Errors

### Error: "Port 5000 already in use"

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Cause:** Another process using port 5000

**Solutions:**

**Windows:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID 12345 /F

# Or use different port
set PORT=5001
npm start
```

**Mac/Linux:**
```bash
# Find process
lsof -i :5000

# Kill process (replace PID)
kill -9 12345

# Or use different port
PORT=5001 npm start
```

**Docker:**
```bash
# Stop all containers
docker-compose down

# Remove all containers
docker-compose down -v
```

---

### Error: "Cannot connect to server"

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```

**Cause:** Server not running

**Solutions:**

1. Check if server started:
   ```bash
   npm start
   # Should show: ✅ Server running on http://localhost:5000
   ```

2. Check for errors above that message:
   ```
   ❌ MongoDB connection failed
   ```

3. Fix issues preventing startup (see Database Errors section)

---

## Category 2: Database/MongoDB Errors

### Error: "MongoDB connection timeout"

**Symptom:**
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Cause:** MongoDB not running or connection string wrong

**Solutions:**

1. **For local development:**
   - Install MongoDB: https://www.mongodb.com/try/download/community
   - Start MongoDB:
   
   **Windows:**
   ```bash
   mongod
   ```
   
   **Mac (Homebrew):**
   ```bash
   brew services start mongodb-community
   ```
   
   **Docker:**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **For MongoDB Atlas (production):**
   - Verify URI: `mongodb+srv://admin:PASSWORD@cluster.mongodb.net/student-db`
   - Replace `PASSWORD` with actual password
   - Ensure `0.0.0.0/0` in Network Access whitelist
   - Check internet connection

3. **Test connection:**
   ```bash
   mongosh "your-connection-string"
   # If successful, shows: test>
   ```

### Error: "MongoError: Authentication failed"

**Symptom:**
```
MongoError: authentication failed
```

**Cause:** Wrong MongoDB credentials

**Solutions:**

1. Check username and password in URI:
   ```
   mongodb+srv://admin:MyPassword123@cluster.mongodb.net/student-db
                 ^^^^  ^^^^^^^^^^^^^
                 user  password
   ```

2. Verify in MongoDB Atlas:
   - Go to Database Access
   - Check user exists: `admin`
   - Reset password if needed

3. URL-encode special characters:
   - `@` → `%40`
   - `:` → `%3A`
   - `!` → `%21`

### Error: "MongoError: No suitable servers found"

**Symptom:**
```
MongoError: no suitable servers found
```

**Cause:** IP whitelist or DNS issues

**Solutions:**

1. **Whitelist your IP:**
   - MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Choose: "Allow Access from Anywhere" (0.0.0.0/0) for dev
   - Click "Confirm"

2. **Check internet connection:**
   ```bash
   ping 8.8.8.8
   ```

3. **Disable VPN temporarily** (test if that's the issue)

---

## Category 3: Environment Variable Errors

### Error: "Cannot find cloudinary config"

**Symptom:**
```
Error: Missing CLOUDINARY_CLOUD_NAME
```

**Cause:** Missing environment variables

**Solutions:**

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Fill in all required variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_value
   CLOUDINARY_API_KEY=your_value
   CLOUDINARY_API_SECRET=your_value
   MONGO_URI=your_value
   JWT_SECRET=your_value
   ```

3. Verify file is read:
   ```bash
   cat .env  # Should show values
   ```

4. Restart server:
   ```bash
   npm start
   ```

### Error: ".env not found"

**Cause:** File in wrong location or wrong name

**Solutions:**

1. Ensure `.env` is in project root:
   ```
   Student-Management/
   ├── .env           ← Should be here
   ├── server.js
   ├── package.json
   ```

2. Check filename (not `.env.txt` or `env`)

3. Verify it's readable:
   - **Windows:** Not hidden
   - **Mac/Linux:** Starts with `.`

---

## Category 4: File Upload/Cloudinary Errors

### Error: "Cloudinary upload failed - Invalid API key"

**Symptom:**
```
Error: Invalid Cloudinary API credentials
```

**Cause:** Wrong Cloudinary credentials

**Solutions:**

1. Get credentials from Cloudinary:
   - Go to https://cloudinary.com/console/settings/api-keys
   - Copy: Cloud Name, API Key, API Secret

2. Update `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=abc123def456
   CLOUDINARY_API_KEY=123456789
   CLOUDINARY_API_SECRET=abcdefghijklmnop
   ```

3. Restart server:
   ```bash
   npm start
   ```

4. Test upload again

### Error: "File size exceeds limit"

**Symptom:**
```
Error: Image size exceeds 100MB limit
```

**Cause:** File too large

**Solutions:**

1. **Frontend validation:** Add max size check in StudentForm.jsx
   ```javascript
   const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
   if (file.size > MAX_FILE_SIZE) {
     alert("File too large. Max 50MB");
   }
   ```

2. **Backend validation:** Already configured in Cloudinary setup
   ```javascript
   max_bytes: 100 * 1024 * 1024  // 100MB
   ```

3. **Nginx limit (Docker):** Update nginx.conf
   ```nginx
   client_max_body_size 100M;
   ```

### Error: "Upload timeout after 3 retries"

**Symptom:**
```
Failed to upload file after 4 attempts: Request timeout
```

**Cause:** Network issues or Cloudinary slow

**Solutions:**

1. **Increase retry attempts:**
   ```bash
   UPLOAD_MAX_RETRIES=5
   ```

2. **Increase base delay:**
   ```bash
   UPLOAD_BASE_DELAY=2000  # 2 seconds instead of 1
   ```

3. **Check internet:**
   ```bash
   ping cloudinary.com
   ```

4. **Reduce file size** before upload

---

## Category 5: WebSocket Errors

### Error: "WebSocket connection refused"

**Symptom:**
```
WebSocket connection to 'ws://localhost:5000' failed
```

**Cause:** CORS misconfigured or backend not running

**Solutions:**

1. **Check backend running:**
   ```bash
   curl http://localhost:5000/
   ```

2. **Check Socket.IO CORS:**
   In `utils/socket.js`, verify origins include frontend URL:
   ```javascript
   origin: process.env.SOCKET_CORS_ORIGIN || [
     "http://localhost:5173",
     "http://localhost:3000"
   ]
   ```

3. **Update .env:**
   ```
   SOCKET_CORS_ORIGIN=http://localhost:5173,http://localhost:3000
   ```

4. **Browser console:** Check for actual error
   - Open DevTools (F12)
   - Check Console tab
   - Look for red errors

### Error: "Socket handshake failed"

**Symptom:**
```
handshake_error: "Session ID unknown"
```

**Cause:** CORS issue or server restart

**Solutions:**

1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear cookies: DevTools → Application → Cookies → Clear
3. Check CORS settings (see above)
4. Restart server

### Error: "Real-time updates not working"

**Symptom:**
```
Create student → No update in other browser tab
```

**Cause:** WebSocket not connected

**Solutions:**

1. **Check connection in browser console:**
   ```javascript
   // In browser console, type:
   socket.connected  // Should be true
   ```

2. **Check server logs:**
   ```
   🔌 Client connected: abc123
   ```

3. **Verify event names match:**
   - Emit: `studentCreated`
   - Listen: `socket.on('studentCreated', ...)`

4. **Hard refresh and try again**

---

## Category 6: Authentication/JWT Errors

### Error: "JWT malformed"

**Symptom:**
```
JsonWebTokenError: jwt malformed
```

**Cause:** Invalid JWT token

**Solutions:**

1. **Clear local storage:**
   - DevTools → Application → Local Storage
   - Delete `auth_token` or `token`

2. **Re-login** to get new token

3. **Check JWT_SECRET changed:** If secret changes, old tokens invalid
   ```bash
   # Generate new secret
   openssl rand -hex 32
   ```

### Error: "JWT expired"

**Symptom:**
```
TokenExpiredError: jwt expired
```

**Cause:** Token expired

**Solutions:**

1. **Logout and login again**
   - This gets new token

2. **Increase token expiry:**
   In `config/environment.js`:
   ```javascript
   expiresIn: config.isDevelopment ? "30d" : "1d"
   ```

---

## Category 7: Docker Errors

### Error: "Docker daemon not running"

**Symptom:**
```
Cannot connect to Docker daemon
```

**Cause:** Docker not started

**Solutions:**

**Windows/Mac:**
- Open Docker Desktop application
- Wait for "Docker is running" in menu

**Linux:**
```bash
sudo systemctl start docker
```

### Error: "Build failed - npm dependencies"

**Symptom:**
```
npm ERR! 404 Not Found
```

**Cause:** Package not found or network issue

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules:**
   ```bash
   rm -rf node_modules package-lock.json
   ```

3. **Rebuild:**
   ```bash
   docker-compose build --no-cache
   ```

### Error: "Container keeps restarting"

**Symptom:**
```
student-mgmt-backend exited with code 1
```

**Cause:** Error during startup

**Solutions:**

1. **Check logs:**
   ```bash
   docker-compose logs backend
   ```

2. **Look for error message:**
   - MongoDB connection
   - Missing env vars
   - Port already in use

3. **Fix issue and rebuild:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### Error: "Cannot connect to MongoDB in Docker"

**Symptom:**
```
Error: connect ECONNREFUSED mongodb:27017
```

**Cause:** Service name wrong or MongoDB not started

**Solutions:**

1. **Check service name:** `mongodb` (not `mongo`)
   ```yaml
   services:
     backend:
       depends_on:
         - mongodb  # ← Check this matches service name
   ```

2. **Verify MongoDB is healthy:**
   ```bash
   docker-compose ps
   # mongodb should show "healthy" or "Up"
   ```

3. **Check network:**
   ```bash
   docker network ls
   docker inspect student-network  # Verify all services connected
   ```

---

## Category 8: Frontend/React Errors

### Error: "Cannot GET /api/students"

**Symptom:**
```
Failed to fetch students
404: Cannot GET /api/students
```

**Cause:** Backend not running or wrong URL

**Solutions:**

1. **Check backend running:**
   ```bash
   curl http://localhost:5000/api/students
   # Should return: {"success": true, ...}
   ```

2. **Check frontend env var:**
   In `vite.config.js` or check env:
   ```javascript
   import.meta.env.VITE_API_BASE_URL
   // Should be: http://localhost:5000/api/students
   ```

3. **Frontend .env:**
   ```
   VITE_API_BASE_URL=http://localhost:5000/api/students
   ```

### Error: "CORS error"

**Symptom:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Cause:** CORS not configured

**Solutions:**

1. **Check backend CORS:**
   In `app.js`:
   ```javascript
   app.use(cors());
   ```

2. **Update CORS for production:**
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || "http://localhost:5173"
   }));
   ```

3. **Restart backend:**
   ```bash
   npm start
   ```

### Error: "Image not loading"

**Symptom:**
```
<img src broken in browser
```

**Cause:** Wrong image URL or Cloudinary error

**Solutions:**

1. **Check image URL:**
   ```javascript
   // In browser console:
   // Copy image URL from student data
   // Paste in new tab - should load
   ```

2. **Verify Cloudinary upload worked:**
   - Go to Cloudinary dashboard
   - Check "Media Library" for uploaded images

3. **Check image field in database:**
   ```javascript
   db.students.findOne({name: "John"})
   // Should have: image: "https://res.cloudinary.com/..."
   ```

---

## Category 9: Production (Render) Errors

### Error: "WebSocket connection failed on Render"

**Symptom:**
```
WebSocket is closed before the connection is established
```

**Cause:** CORS or backend paused

**Solutions:**

1. **Update SOCKET_CORS_ORIGIN:**
   ```
   https://student-management-frontend.render.com,https://student-management-backend.render.com
   ```

2. **Check backend running:**
   - Render dashboard → backend service → "Logs"
   - Should see: `✅ Server running`

3. **Check if paused:**
   - Free tier pauses after 15 mins inactivity
   - Upgrade to paid or manually wake up

### Error: "Static site showing 404"

**Symptom:**
```
404 Not Found
```

**Cause:** Build failed or wrong directory

**Solutions:**

1. **Check build logs:**
   - Render dashboard → frontend → "Logs" tab

2. **Verify build command:**
   ```
   cd student-management-frontend && npm run build
   ```

3. **Verify publish directory:**
   ```
   student-management-frontend/dist
   ```

4. **Rebuild:**
   - Click "Manual Deploy"
   - Or push to GitHub

---

## Debug Mode

### Enable verbose logging:

```bash
# Terminal
LOG_LEVEL=DEBUG npm start

# Docker
docker-compose exec backend sh -c "LOG_LEVEL=DEBUG npm start"

# Render
Add env var: LOG_LEVEL=DEBUG
```

### Browser console debugging:

```javascript
// Check Socket.IO connection
socket.connected  // true/false
socket.id         // "abc123..."

// Check auth token
localStorage.getItem('auth_token')

// Check API response
fetch('/api/students', {
  headers: {'Authorization': `Bearer ${token}`}
}).then(r => r.json()).then(console.log)
```

### Server-side debugging:

```javascript
// Add to controller
console.log('Debugging info:', { studentId, userId, timestamp });

// Check logs
npm start
# Look for console.log output
```

---

## Getting Help

If stuck:

1. **Check error message carefully** - usually tells exact problem
2. **Search online:** `"your error message" nodejs` or `"your error" mongodb`
3. **Check Render logs:** Usually shows exact cause
4. **Create GitHub issue** with:
   - Error message
   - Steps to reproduce
   - Environment info
   - Logs

---

## Common Fix: "Restart Everything"

Sometimes simplest fix:

```bash
# Stop everything
docker-compose down
npm finish

# Clear caches
npm cache clean --force
rm -rf node_modules

# Start fresh
npm install
npm start

# Or with Docker
docker-compose down -v  # Remove volumes
docker-compose up --build
```

