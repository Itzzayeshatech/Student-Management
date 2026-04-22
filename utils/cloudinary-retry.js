/**
 * Cloudinary Upload with Retry Logic
 * 
 * Implements exponential backoff retry strategy for failed uploads
 * Handles network errors, timeouts, and rate limiting
 */

const logger = require("./logger");
const { cloudinary } = require("../config/cloudinary");

/**
 * Exponential backoff delay calculation
 * Formula: delay = baseDelay * (2 ^ attemptNumber) + random jitter
 * 
 * @param {number} attempt - Attempt number (0-indexed)
 * @param {number} baseDelay - Initial delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
function calculateBackoff(attempt, baseDelay = 1000) {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // Add random jitter 0-1s
  return exponentialDelay + jitter;
}

/**
 * Check if error is retryable
 * @param {Error} error - Error object
 * @returns {boolean} Whether the error can be retried
 */
function isRetryableError(error) {
  const retryableErrors = [
    "ECONNRESET",      // Connection reset
    "ECONNREFUSED",    // Connection refused
    "ETIMEDOUT",       // Request timeout
    "ENOTFOUND",       // DNS resolution failed
    "REQUEST_TIMEOUT", // Request timed out
  ];

  // Check error code
  if (retryableErrors.includes(error.code)) return true;
  
  // Check for rate limiting (429)
  if (error.status === 429) return true;
  
  // Check for temporary server errors (5xx)
  if (error.status >= 500 && error.status < 600) return true;
  
  return false;
}

/**
 * Upload file to Cloudinary with retry logic
 * 
 * @param {Buffer|Stream} fileData - File data to upload
 * @param {string} folder - Cloudinary folder
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL
 */
async function uploadWithRetry(fileData, folder = "student_management", options = {}) {
  const maxRetries = process.env.UPLOAD_MAX_RETRIES || 3;
  const baseDelay = parseInt(process.env.UPLOAD_BASE_DELAY || 1000);
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`Cloudinary upload attempt ${attempt + 1}/${maxRetries + 1}`, {
        folder,
        attempt,
      });

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "auto",
            allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
            max_bytes: 100 * 1024 * 1024, // 100MB max
            ...options,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Handle stream errors
        uploadStream.on("error", (error) => {
          reject(error);
        });

        // Write data to stream
        if (Buffer.isBuffer(fileData)) {
          uploadStream.end(fileData);
        } else {
          fileData.pipe(uploadStream);
        }
      });

      logger.info(`✅ File uploaded to Cloudinary`, {
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
      });

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        format: result.format,
      };

    } catch (error) {
      lastError = error;
      
      logger.warn(`Upload attempt ${attempt + 1} failed`, {
        error: error.message,
        code: error.code,
        status: error.status,
        retryable: isRetryableError(error),
      });

      // Check if error is retryable
      if (!isRetryableError(error)) {
        logger.error(`Non-retryable error during upload`, {
          error: error.message,
          code: error.code,
        });
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }

      // Calculate backoff delay
      const delay = calculateBackoff(attempt, baseDelay);
      logger.debug(`Retrying in ${delay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted
  logger.error(`❌ Upload failed after ${maxRetries + 1} attempts`, {
    finalError: lastError.message,
    errorCode: lastError.code,
  });

  throw new Error(
    `Failed to upload file after ${maxRetries + 1} attempts: ${lastError.message}`
  );
}

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
async function deleteFile(publicId) {
  try {
    logger.debug(`Deleting file from Cloudinary`, { publicId });
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    logger.info(`✅ File deleted from Cloudinary`, {
      publicId,
      result: result.result,
    });

    return {
      success: true,
      result: result.result,
    };

  } catch (error) {
    logger.error(`Failed to delete file from Cloudinary`, {
      publicId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get file info from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} File information
 */
async function getFileInfo(publicId) {
  try {
    logger.debug(`Fetching file info from Cloudinary`, { publicId });
    
    const result = await cloudinary.api.resource(publicId);
    
    return {
      success: true,
      url: result.secure_url,
      size: result.bytes,
      format: result.format,
      createdAt: result.created_at,
    };

  } catch (error) {
    logger.error(`Failed to fetch file info from Cloudinary`, {
      publicId,
      error: error.message,
    });
    throw error;
  }
}

module.exports = {
  uploadWithRetry,
  deleteFile,
  getFileInfo,
  isRetryableError,
  calculateBackoff,
};
