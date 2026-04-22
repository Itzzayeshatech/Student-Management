# Code Examples & Reference

Complete code examples for all advanced features.

---

## 1. WebSocket Real-time Implementation

### Backend WebSocket Setup

```javascript
// server.js
require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { init } = require('./utils/socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
init(server);

// Connect database and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSockets enabled`);
  });
});
```

### Backend Emit Events

```javascript
// controllers/student.controller.js
const { emitToAll } = require('../utils/socket');
const logger = require('../utils/logger');

exports.createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);
    
    // Emit to all connected clients
    emitToAll('studentCreated', student);
    logger.logWebSocketEvent('studentCreated', student, 'broadcast');

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    
    // Emit update to all clients
    emitToAll('studentUpdated', student);

    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};
```

### Frontend WebSocket Connection

```javascript
// src/services/socketService.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL.replace('/api/students', '');
const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

export default socket;
```

### Frontend Listen to Events

```javascript
// src/hooks/useStudents.js
import { useEffect, useState } from "react";
import socket from "../services/socketService";

export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  useEffect(() => {
    // Real-time listeners
    socket.on("studentCreated", (newStudent) => {
      setStudents(prev => [newStudent, ...prev]);
      console.log("✅ New student added:", newStudent.name);
    });

    socket.on("studentUpdated", (updatedStudent) => {
      setStudents(prev => 
        prev.map(s => s._id === updatedStudent._id ? updatedStudent : s)
      );
      console.log("✅ Student updated:", updatedStudent.name);
    });

    socket.on("studentDeleted", ({ id }) => {
      setStudents(prev => prev.filter(s => s._id !== id));
      console.log("✅ Student deleted");
    });

    // Connection status
    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    return () => {
      socket.off("studentCreated");
      socket.off("studentUpdated");
      socket.off("studentDeleted");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return { students, socketConnected };
};
```

---

## 2. Cloudinary File Upload with Retry

### Backend Upload Route

```javascript
// routes/student.routes.js
const express = require('express');
const { upload } = require('../config/cloudinary');
const studentController = require('../controllers/student.controller');
const protect = require('../middlewares/auth.middleware');

const router = express.Router();

// Upload with retry logic
router.post('/', 
  protect,
  upload.single('image'), // Multer with Cloudinary storage
  studentController.createStudent
);

router.put('/:id',
  protect,
  upload.single('image'),
  studentController.updateStudent
);

module.exports = router;
```

### Backend with Retry (Advanced)

```javascript
// controllers/student.controller.js - with retry
const { uploadWithRetry } = require('../utils/cloudinary-retry');
const logger = require('../utils/logger');

exports.createStudent = async (req, res, next) => {
  try {
    const studentData = { ...req.body };

    // Upload with retry if file provided
    if (req.file) {
      const startTime = Date.now();
      const uploadResult = await uploadWithRetry(
        req.file.buffer,
        'student_management',
        { resource_type: 'auto' }
      );
      
      const duration = Date.now() - startTime;
      logger.logFileUpload(req.file.originalname, req.file.size, duration, true);
      
      studentData.image = uploadResult.url;
    }

    const student = await studentService.createStudent(studentData);
    
    // Emit to all clients
    const io = require('../utils/socket').getIO();
    io.emit('studentCreated', student);

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    logger.logAPIError(err, { operation: 'createStudent' });
    next(err);
  }
};
```

### Frontend File Upload

```javascript
// src/components/StudentForm.jsx
import { useState } from "react";
import { createStudent, validateFile } from "../services/studentService";
import socket from "../services/socketService";

export const StudentForm = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData with file
      const formData = new FormData();
      formData.append('name', e.target.name.value);
      formData.append('age', e.target.age.value);
      formData.append('course', e.target.course.value);
      
      if (file) {
        formData.append('image', file);
      }

      // Upload with retry
      const result = await createStudent(formData);
      
      if (result.success) {
        console.log("✅ Student created:", result.data.name);
        onSuccess();
      } else {
        setError(result.message || "Upload failed");
      }
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Student name" required />
      <input type="number" name="age" placeholder="Age" required />
      <input type="text" name="course" placeholder="Course" required />
      
      {/* File input */}
      <input 
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {/* Preview */}
      {preview && <img src={preview} alt="Preview" style={{ maxWidth: '100px' }} />}
      
      {/* Error */}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Create Student'}
      </button>
    </form>
  );
};
```

---

## 3. Docker Implementation

### Backend Dockerfile (Multi-stage)

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app . 

# Add non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["npm", "start"]
```

### Docker Compose Full Stack

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./student-management-frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000/api/students
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongodb:27017/student-db
      - JWT_SECRET=${JWT_SECRET}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - SOCKET_CORS_ORIGIN=http://localhost
    depends_on:
      - mongodb
    networks:
      - app-network
    restart: unless-stopped

  mongodb:
    image: mongo:7-alpine
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  mongodb_data:
```

### Commands

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose build backend

# Restart service
docker-compose restart backend
```

---

## 4. Advanced Logging

### Backend Logging Usage

```javascript
// Anywhere in code
const logger = require('../utils/logger');

// Different log levels
logger.debug('Debug message', { key: 'value' });
logger.info('Info message', { userId: user._id });
logger.warn('Warning message', { warning: 'something' });
logger.error('Error message', { error: err.message });
logger.fatal('Critical error', { critical: true });

// Specialized logging
logger.logRequest(req);                              // Log incoming request
logger.logResponse(req, 200, 150);                  // Log response with duration
logger.logDBOperation('insert', 'students', 50);    // Log DB operation
logger.logFileUpload('image.jpg', 2048576, 300);    // Log file upload
logger.logWebSocketEvent('studentCreated', data);   // Log WebSocket event
logger.logAuthEvent('login', user._id, true);       // Log auth event
logger.logAPIError(err, { userId: user._id });      // Log API error
```

### Middleware with Logging

```javascript
// middlewares/request-logger.middleware.js
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  logger.logRequest(req);

  // Capture original send
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    logger.logResponse(req, res.statusCode, duration);
    return originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;
```

---

## 5. Environment Configuration

### Backend Configuration

```javascript
// config/environment.js
const requiredEnvVars = [
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

function loadConfig() {
  // Check required variables
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required env vars: ${missingVars.join(', ')}`);
  }

  return {
    server: {
      port: parseInt(process.env.PORT || 5000),
      isDev: process.env.NODE_ENV !== 'production',
    },
    database: {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/student-db',
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.NODE_ENV === 'development' ? '7d' : '1d',
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  };
}

module.exports = { loadConfig };
```

### Using Configuration

```javascript
// app.js
const { loadConfig } = require('./config/environment');
const config = loadConfig();

app.use(cors({
  origin: config.isDev ? '*' : process.env.FRONTEND_URL
}));

// Use config values throughout app
const dbUri = config.database.uri;
const jwtSecret = config.jwt.secret;
```

---

## 6. Error Handling

### Custom Error Handler

```javascript
// middlewares/error.middleware.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.logAPIError(err, {
    method: req.method,
    path: req.path,
    userId: req.user?._id,
  });

  // Default error status
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Response
  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
```

### Throwing Custom Errors

```javascript
// utils/ApiError.js
class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Usage
const student = await Student.findById(id);
if (!student) {
  throw new ApiError('Student not found', 404);
}

// Caught by error middleware
```

---

## 7. Full Example: Create Student with All Features

### Backend Full Flow

```javascript
// controllers/student.controller.js
exports.createStudent = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    // 1. Log request
    logger.logRequest(req);
    
    // 2. Prepare data
    const studentData = { ...req.body };
    
    // 3. Handle file upload with retry
    if (req.file) {
      const uploadStart = Date.now();
      const uploadResult = await uploadWithRetry(req.file.buffer);
      const uploadDuration = Date.now() - uploadStart;
      
      logger.logFileUpload(
        req.file.originalname,
        req.file.size,
        uploadDuration,
        true
      );
      
      studentData.image = uploadResult.url;
    }
    
    // 4. Validate data
    if (!studentData.name || !studentData.age || !studentData.course) {
      throw new ApiError('Missing required fields', 400);
    }
    
    // 5. Save to database
    const student = await Student.create(studentData);
    logger.info(`✅ Student created: ${student.name}`, {
      studentId: student._id,
      hasImage: !!studentData.image,
    });
    
    // 6. Emit real-time event
    const io = getIO();
    io.emit('studentCreated', student);
    logger.logWebSocketEvent('studentCreated', student, 'broadcast');
    
    // 7. Log response
    const duration = Date.now() - startTime;
    logger.logResponse(req, 201, duration);
    
    // 8. Send response
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
    
  } catch (err) {
    // Error handling
    logger.logAPIError(err, {
      operation: 'createStudent',
      duration: Date.now() - startTime,
    });
    next(err);
  }
};
```

### Frontend Full Flow

```javascript
// src/pages/FormPage.jsx
import { useState } from 'react';
import { createStudent, validateFile } from '../services/studentService';
import socket from '../services/socketService';

export const FormPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Get form data
      const formData = new FormData(e.target);
      
      // 2. Validate file if present
      if (file) {
        const validation = validateFile(file);
        if (!validation.valid) {
          throw new Error(validation.message);
        }
        formData.append('image', file);
      }
      
      // 3. Submit to backend
      const result = await createStudent(formData);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // 4. Success - WebSocket will update UI automatically
      console.log('✅ Student created:', result.data.name);
      
      // 5. Clear form
      e.target.reset();
      setFile(null);
      
      // 6. Optional: Navigate or show message
      alert('Student created successfully!');
      
    } catch (err) {
      setError(err.message || 'Failed to create student');
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="age" type="number" placeholder="Age" required />
      <input name="course" placeholder="Course" required />
      
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Student'}
      </button>
    </form>
  );
};
```

---

## 8. Testing

### Test WebSocket Connection

```javascript
// In browser console
socket.connected              // true if connected
socket.id                     // unique socket ID
socket.emit('test', 'data')   // emit custom event
socket.on('test', console.log) // listen to event
```

### Test API Endpoint

```bash
# Test student creation
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","age":20,"course":"CS"}'

# Test with file upload
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=John" \
  -F "age=20" \
  -F "course=CS" \
  -F "image=@/path/to/image.jpg"
```

---

**For more examples and complete documentation, see:**
- QUICK_START.md
- PRODUCTION_UPGRADE_GUIDE.md
- RENDER_DEPLOYMENT.md
- ERROR_HANDLING.md

