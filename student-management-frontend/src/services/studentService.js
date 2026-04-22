/**
 * Student Service - API communication layer
 * 
 * Handles all HTTP requests to backend for student operations
 * Features:
 * - Automatic authentication header injection
 * - Error handling with meaningful messages
 * - Response validation
 * - Request logging
 */

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Validate API URL is configured
if (!API_URL) {
  console.warn("⚠️  VITE_API_BASE_URL not configured. Check .env file.");
}

/**
 * Get authentication headers
 * Includes JWT token from localStorage if available
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

/**
 * Handle API response errors
 * @param {Response} response - Fetch response object
 * @returns {Promise} Parsed response or error
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  // Check if response indicates success
  if (!response.ok) {
    const errorMessage = data.message || 
                        data.error || 
                        `HTTP ${response.status}`;
    
    console.error("❌ API Error:", {
      status: response.status,
      message: errorMessage,
      data
    });

    const error = new Error(errorMessage);
    error.status = response.status;
    error.response = data;
    throw error;
  }
  
  return data;
};

/**
 * Fetch all students with pagination and search
 * @param {string} search - Search query
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Students array and pagination info
 */
export const fetchStudents = async (search = "", page = 1, limit = 10) => {
  try {
    console.log("📥 Fetching students:", { search, page, limit });
    
    const queryParams = new URLSearchParams({
      search,
      page,
      limit
    });

    const response = await fetch(`${API_URL}?${queryParams}`, {
      headers: getAuthHeaders()
    });

    const data = await handleResponse(response);
    console.log("✅ Students fetched:", data.data?.length || 0, "items");
    
    return data;

  } catch (error) {
    console.error("❌ Error fetching students:", error);
    throw error;
  }
};

/**
 * Create new student
 * @param {FormData} formData - Student data including optional file
 * @returns {Promise<Object>} Created student data
 */
export const createStudent = async (formData) => {
  try {
    console.log("📤 Creating student...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      // Fetch automatically sets Content-Type: multipart/form-data for FormData
      body: formData,
    });

    const data = await handleResponse(response);
    console.log("✅ Student created:", data.data?.name);
    
    return data;

  } catch (error) {
    console.error("❌ Error creating student:", error);
    throw error;
  }
};

/**
 * Update existing student
 * @param {string} id - Student ID
 * @param {FormData} formData - Updated student data
 * @returns {Promise<Object>} Updated student data
 */
export const updateStudent = async (id, formData) => {
  try {
    console.log("📤 Updating student:", id);

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: formData,
    });

    const data = await handleResponse(response);
    console.log("✅ Student updated:", data.data?.name);
    
    return data;

  } catch (error) {
    console.error("❌ Error updating student:", error);
    throw error;
  }
};

/**
 * Delete student
 * @param {string} id - Student ID
 * @returns {Promise<Object>} Deleted student data
 */
export const deleteStudent = async (id) => {
  try {
    console.log("📤 Deleting student:", id);

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    const data = await handleResponse(response);
    console.log("✅ Student deleted:", id);
    
    return data;

  } catch (error) {
    console.error("❌ Error deleting student:", error);
    throw error;
  }
};

/**
 * Get single student by ID
 * @param {string} id - Student ID
 * @returns {Promise<Object>} Student data
 */
export const getStudent = async (id) => {
  try {
    console.log("📥 Fetching student:", id);

    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeaders()
    });

    const data = await handleResponse(response);
    console.log("✅ Student fetched:", data.data?.name);
    
    return data;

  } catch (error) {
    console.error("❌ Error fetching student:", error);
    throw error;
  }
};

/**
 * Validate file before upload
 * @param {File} file - File object
 * @returns {Object} Validation result
 */
export const validateFile = (file) => {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (!file) {
    return { valid: true, message: "No file" };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      message: `File too large. Max size: 50MB, Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: `Invalid file type. Allowed: JPEG, PNG, GIF, WebP. Your file: ${file.type}`
    };
  }

  return { valid: true, message: "File valid" };
};
