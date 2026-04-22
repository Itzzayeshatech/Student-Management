/**
 * Logger Utility - Production-ready logging
 * 
 * Features:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
 * - Timestamps with ISO format
 * - Color-coded console output (development)
 * - File logging support (production)
 * - Performance metrics
 * - Request/Response logging
 */

const fs = require("fs");
const path = require("path");

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  gray: "\x1b[90m",
};

// Log levels with priorities
const LogLevels = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || "INFO";
    this.isDev = process.env.NODE_ENV !== "production";
    this.logDir = path.join(__dirname, "../logs");
    
    // Ensure logs directory exists in production
    if (!this.isDev && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format timestamp in ISO 8601 format
   * @returns {string} Formatted timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Get color for log level (development only)
   */
  getColor(level) {
    const colorMap = {
      DEBUG: colors.gray,
      INFO: colors.blue,
      WARN: colors.yellow,
      ERROR: colors.red,
      FATAL: colors.red,
    };
    return colorMap[level] || colors.reset;
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = this.getTimestamp();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : "";
    return `[${timestamp}] [${level}] ${message} ${metaStr}`;
  }

  /**
   * Write to log file (production)
   */
  writeToFile(level, message, meta) {
    try {
      const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
      const formatted = this.formatMessage(level, message, meta);
      fs.appendFileSync(logFile, formatted + "\n");
    } catch (err) {
      console.error("Error writing to log file:", err);
    }
  }

  /**
   * Write to console with colors
   */
  writeToConsole(level, message, meta) {
    const color = this.getColor(level);
    const formatted = this.formatMessage(level, message, meta);
    console.log(`${color}${formatted}${colors.reset}`);
  }

  /**
   * Log at specified level
   */
  log(level, message, meta = {}) {
    // Check if this level should be logged
    if (LogLevels[level] < LogLevels[this.level]) {
      return;
    }

    // Always write to console in development
    if (this.isDev) {
      this.writeToConsole(level, message, meta);
    } else {
      // In production: console + file
      this.writeToConsole(level, message, meta);
      this.writeToFile(level, message, meta);
    }
  }

  // Convenience methods for each level
  debug(message, meta) { this.log("DEBUG", message, meta); }
  info(message, meta) { this.log("INFO", message, meta); }
  warn(message, meta) { this.log("WARN", message, meta); }
  error(message, meta) { this.log("ERROR", message, meta); }
  fatal(message, meta) { this.log("FATAL", message, meta); }

  /**
   * Log HTTP request
   */
  logRequest(req) {
    const meta = {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.user?._id || "anonymous",
    };
    this.info(`${req.method} ${req.path}`, meta);
  }

  /**
   * Log HTTP response
   */
  logResponse(req, statusCode, duration) {
    const meta = {
      method: req.method,
      path: req.path,
      statusCode,
      duration: `${duration}ms`,
      userId: req.user?._id || "anonymous",
    };
    this.info(`${req.method} ${req.path} - ${statusCode}`, meta);
  }

  /**
   * Log database operation
   */
  logDBOperation(operation, collection, duration, success = true) {
    const meta = {
      operation,
      collection,
      duration: `${duration}ms`,
      status: success ? "success" : "failed",
    };
    this.info(`DB: ${operation} on ${collection}`, meta);
  }

  /**
   * Log API error with context
   */
  logAPIError(error, context) {
    const meta = {
      errorMessage: error.message,
      errorCode: error.code,
      context,
      stack: error.stack.split("\n").slice(0, 3).join(" "),
    };
    this.error(`API Error: ${error.message}`, meta);
  }

  /**
   * Log file upload event
   */
  logFileUpload(filename, size, duration, success = true) {
    const meta = {
      filename,
      sizeKB: (size / 1024).toFixed(2),
      duration: `${duration}ms`,
      status: success ? "success" : "failed",
    };
    this.info(`File upload: ${filename}`, meta);
  }

  /**
   * Log WebSocket event
   */
  logWebSocketEvent(event, data, socketId) {
    const meta = {
      event,
      socketId,
      dataSize: JSON.stringify(data).length,
    };
    this.debug(`WebSocket event: ${event}`, meta);
  }

  /**
   * Log authentication event
   */
  logAuthEvent(action, userId, success = true) {
    const meta = {
      action,
      userId,
      status: success ? "success" : "failed",
    };
    this.info(`Auth: ${action} for user ${userId}`, meta);
  }
}

// Singleton instance
const logger = new Logger();

module.exports = logger;
