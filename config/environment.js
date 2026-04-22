/**
 * Environment Configuration
 * 
 * Centralized configuration management for development and production
 * Validates required environment variables and provides defaults
 */

const requiredEnvVars = [
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const optionalEnvVars = {
  PORT: "5000",
  NODE_ENV: "development",
  MONGO_URI: "mongodb://localhost:27017/student-db",
  LOG_LEVEL: "INFO",
  UPLOAD_MAX_RETRIES: "3",
  UPLOAD_BASE_DELAY: "1000",
  SOCKET_CORS_ORIGIN: "http://localhost:5173,http://localhost:3000",
  FRONTEND_URL: "http://localhost:5173",
};

/**
 * Validate and load environment configuration
 */
function loadConfig() {
  const config = {};

  // Check required variables
  const missingVars = [];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.warn("⚠️  Missing required environment variables:");
    missingVars.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    }
  }

  // Load required variables
  requiredEnvVars.forEach(varName => {
    config[varName] = process.env[varName] || null;
  });

  // Load optional variables with defaults
  Object.entries(optionalEnvVars).forEach(([varName, defaultValue]) => {
    config[varName] = process.env[varName] || defaultValue;
  });

  // Environment-specific configurations
  config.isDevelopment = config.NODE_ENV === "development";
  config.isProduction = config.NODE_ENV === "production";

  // CORS settings
  config.corsOrigin = config.SOCKET_CORS_ORIGIN.split(",").map(url => url.trim());

  // Database
  config.database = {
    uri: config.MONGO_URI,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Server
  config.server = {
    port: parseInt(config.PORT),
    isDev: config.isDevelopment,
    isProd: config.isProduction,
  };

  // JWT
  config.jwt = {
    secret: config.JWT_SECRET,
    expiresIn: config.isDevelopment ? "7d" : "1d",
  };

  // Cloudinary
  config.cloudinary = {
    cloudName: config.CLOUDINARY_CLOUD_NAME,
    apiKey: config.CLOUDINARY_API_KEY,
    apiSecret: config.CLOUDINARY_API_SECRET,
    maxRetries: parseInt(config.UPLOAD_MAX_RETRIES),
    baseDelay: parseInt(config.UPLOAD_BASE_DELAY),
  };

  // Logging
  config.logging = {
    level: config.LOG_LEVEL,
    isDev: config.isDevelopment,
  };

  // Socket.IO
  config.socketIO = {
    cors: {
      origin: config.corsOrigin,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  };

  return config;
}

/**
 * Get configuration
 */
function getConfig() {
  return loadConfig();
}

/**
 * Get specific configuration section
 */
function getConfigSection(section) {
  const config = loadConfig();
  return config[section] || {};
}

module.exports = {
  loadConfig,
  getConfig,
  getConfigSection,
};
