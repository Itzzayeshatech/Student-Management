# 🚀 Cheat Sheet - Quick Reference

Fast reference for common commands and configurations.

---

## 🔧 Installation & Setup

```bash
# Backend setup
npm install
copy .env.example .env
# Edit .env with your credentials

# Frontend setup
cd student-management-frontend
npm install
cd ..

# Both together
npm install && cd student-management-frontend && npm install && cd ..
```

---

## 🏃 Run Development

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd student-management-frontend && npm run dev

# Or with one command (requires concurrently)
npm run dev:all
```

---

## 🐳 Docker

```bash
# Start all services
docker-compose up --build

# Rebuild single service
docker-compose build backend
docker-compose build frontend

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Stop everything
docker-compose down

# Clean up volumes
docker-compose down -v

# Restart service
docker-compose restart backend

# Enter container shell
docker-compose exec backend sh
```

---

## 📦 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/student-db
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
LOG_LEVEL=INFO
UPLOAD_MAX_RETRIES=3
SOCKET_CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api/students
```

### Generate JWT Secret

```bash
# macOS/Linux
openssl rand -hex 32

# Windows (PowerShell)
[System.BitConverter]::ToString((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 })) -replace '-','' | ToLower
```

---

## 🗄️ Database

```bash
# Connect to local MongoDB
mongosh "mongodb://localhost:27017"

# In MongoDB shell
> use student-db
> db.students.find()                    # View all students
> db.students.findOne()                 # View one student
> db.students.count()                   # Count students
> db.students.deleteMany({})            # Delete all

# MongoDB Atlas connection
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/student-db"
```

---

## 🧪 Testing API

```bash
# Get all students
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/students

# Create student
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","age":20,"course":"CS"}'

# With file upload
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer TOKEN" \
  -F "name=John" \
  -F "age=20" \
  -F "course=CS" \
  -F "image=@image.jpg"

# Update student
curl -X PUT http://localhost:5000/api/students/ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane"}'

# Delete student
curl -X DELETE http://localhost:5000/api/students/ID \
  -H "Authorization: Bearer TOKEN"
```

---

## 🌐 Port Conflicts

### Check which process uses a port

**Windows:**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :5000
kill -9 <PID>
```

### Use different port

```bash
PORT=5001 npm start
```

---

## 🐛 Debugging

### Backend Logging

```bash
# Set log level
LOG_LEVEL=DEBUG npm start

# View logs in real-time
tail -f logs/error.log
tail -f logs/info.log
```

### Frontend Debugging

```javascript
// In browser console (F12)
socket.connected           // Is WebSocket connected?
socket.id                  // Socket ID
localStorage.getItem('token')  // Auth token
fetch('/api/students', {
  headers: {'Authorization': `Bearer TOKEN`}
}).then(r => r.json()).then(console.log)
```

---

## 🚀 Deployment (Render)

### First Time Setup

1. **Git push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Create Render services**
   - Web Service (Backend)
   - Static Site (Frontend)

3. **Add environment variables**
   - Copy from .env file

4. **Deploy**
   - Render auto-deploys on git push

### Redeploy

```bash
# Just push to GitHub
git push

# Or manual redeploy in Render dashboard
# Services → Manual Deploy
```

---

## 🔑 Common Configuration Values

### Development
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/student-db
JWT_SECRET=dev-secret-key (any value)
LOG_LEVEL=DEBUG
```

### Production (Render)
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/student-db
JWT_SECRET=<generate with openssl>
CLOUDINARY_*=<from cloudinary.com>
LOG_LEVEL=INFO
```

---

## 📊 Performance Checks

```bash
# Check API response time
time curl http://localhost:5000/api/students

# Monitor resource usage
docker stats

# Check Docker image size
docker images | grep student

# View container logs size
du -sh /var/lib/docker/containers
```

---

## 🔄 Restart/Reload

```bash
# Backend only (development)
Ctrl+C to stop
npm run dev to restart

# Docker service
docker-compose restart backend

# All services
docker-compose restart

# Full rebuild
docker-compose down -v
docker-compose up --build
```

---

## 📝 File Locations

```
Project Root:
├── .env              ← Configure here
├── server.js         ← Entry point
├── app.js            ← Express app
├── Dockerfile        ← Build image
└── docker-compose.yml ← Services

Configuration:
├── config/environment.js   ← Settings
├── config/cloudinary.js    ← Upload
└── config/db.js           ← Database

Utilities:
├── utils/socket.js         ← WebSocket
├── utils/logger.js         ← Logging
└── utils/cloudinary-retry.js ← Retry logic

Frontend:
└── student-management-frontend/
    ├── .env                ← API URL
    ├── src/services/
    │   ├── studentService.js
    │   └── socketService.js
    └── src/hooks/
        └── useStudents.js
```

---

## 🎯 Quick Troubleshooting

| Problem | Command |
|---------|---------|
| Port in use | `netstat -ano \| findstr :5000` |
| MongoDB won't connect | `mongosh "mongodb://localhost:27017"` |
| WebSocket not working | Check browser console (F12) |
| Docker build fails | `docker-compose build --no-cache` |
| Can't find module | `npm install` then restart |
| Wrong API URL | Check `VITE_API_BASE_URL` in .env |

---

## 📚 Documentation Map

| Document | Purpose |
|----------|---------|
| QUICK_START.md | 5-minute setup |
| PRODUCTION_UPGRADE_GUIDE.md | Detailed concepts |
| RENDER_DEPLOYMENT.md | Deploy to production |
| ERROR_HANDLING.md | Troubleshooting |
| CODE_EXAMPLES.md | Code reference |
| THIS FILE | Quick reference |

---

## 🔗 Useful Links

- Backend: http://localhost:5000
- Frontend: http://localhost:5173
- MongoDB: localhost:27017
- Docker Desktop: https://www.docker.com/products/docker-desktop
- Render: https://render.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Cloudinary: https://cloudinary.com

---

## ✅ Pre-Deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables set (`.env`)
- [ ] Backend runs locally (`npm run dev`)
- [ ] Frontend runs locally (`npm run dev`)
- [ ] WebSocket connects (check console)
- [ ] File upload works
- [ ] Docker builds successfully (`docker-compose build`)
- [ ] Docker Compose runs (`docker-compose up`)
- [ ] Git repo created and pushed
- [ ] Render account ready
- [ ] MongoDB Atlas cluster ready
- [ ] Cloudinary account ready

---

## 🎓 Learning Command

Check if everything works:

```bash
# 1. Install
npm install && cd student-management-frontend && npm install && cd ..

# 2. Configure
copy .env.example .env
# Edit .env

# 3. Start
npm run dev
# Then in another terminal:
cd student-management-frontend && npm run dev

# 4. Test
# Open http://localhost:5173
# Create a student
# Check WebSocket connection (F12 console)
# Verify real-time update

# 5. Deploy with Docker
docker-compose up --build
# Open http://localhost
```

---

**Last Updated:** 2024  
**Status:** Current ✅

