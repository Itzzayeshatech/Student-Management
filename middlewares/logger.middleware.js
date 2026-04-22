const logger = require("../utils/logger");

/**
 * Request/Response Logging Middleware
 * 
 * Logs all incoming requests with method, path, and response time
 * Useful for monitoring API usage and debugging
 */
const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  logger.logRequest(req);

  // Capture original send method
  const originalSend = res.send;

  // Override send method to log response
  res.send = function (data) {
    const duration = Date.now() - startTime;
    logger.logResponse(req, res.statusCode, duration);

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};

module.exports = loggingMiddleware;
