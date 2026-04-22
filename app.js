const express = require('express');
const app = express();

const cors = require('cors');
const rateLimit = require('express-rate-limit');

const logger = require('./middlewares/logger.middleware');
const errorHandler = require('./middlewares/error.middleware');
const notFound = require('./middlewares/notFound.middleware');

const studentRoutes = require('./routes/student.routes');
const authRoutes = require('./routes/auth.routes');
const protect = require('./middlewares/auth.middleware');

// middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(logger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// health check endpoint (used by Docker health checks)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/students', protect, studentRoutes);

// 404
app.use(notFound);

// error handler
app.use(errorHandler);

module.exports = app;
