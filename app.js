const express = require('express');
const app = express();

const logger = require('./middlewares/logger.middleware');
const errorHandler = require('./middlewares/error.middleware');
const notFound = require('./middlewares/notFound.middleware');

const studentRoutes = require('./routes/student.routes');

// middlewares
app.use(express.json());
app.use(logger);

// routes
app.use('/api/students', studentRoutes);

// 404
app.use(notFound);

// error handler
app.use(errorHandler);

module.exports = app;
