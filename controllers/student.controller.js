const studentService = require('../services/student.service');
const { getIO, emitToAll } = require('../utils/socket');
const logger = require('../utils/logger');

/**
 * CREATE Student
 * 
 * Endpoint: POST /api/students
 * Features:
 * - Validate input
 * - Upload image if provided (using Cloudinary)
 * - Save to database
 * - Emit real-time event to all connected clients
 */
exports.createStudent = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    logger.logRequest(req);
    
    const studentData = { ...req.body };
    
    // Handle image upload
    if (req.file) {
      logger.info(`📤 Image file received for student creation`, {
        filename: req.file.filename,
        size: req.file.size,
      });
      studentData.image = req.file.path; // Cloudinary URL
    }

    // Create student in database
    const student = await studentService.createStudent(studentData);
    
    logger.info(`✅ Student created successfully`, {
      studentId: student._id,
      name: student.name,
    });

    // Notify all connected clients in real-time
    emitToAll('studentCreated', student);
    logger.logWebSocketEvent('studentCreated', student, 'broadcast');

    // Log response
    const duration = Date.now() - startTime;
    logger.logResponse(req, 201, duration);

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });

  } catch (err) {
    const duration = Date.now() - startTime;
    logger.logAPIError(err, {
      operation: 'createStudent',
      duration,
    });
    next(err);
  }
};

/**
 * GET ALL Students
 * 
 * Features:
 * - Pagination support
 * - Search functionality
 * - Sorting
 */
exports.getAllStudents = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    logger.logRequest(req);
    
    const result = await studentService.getAllStudents(req.query);
    
    logger.info(`✅ Students retrieved`, {
      count: result.data.length,
      total: result.total,
      page: result.page,
    });

    const duration = Date.now() - startTime;
    logger.logResponse(req, 200, duration);

    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      ...result,
    });

  } catch (err) {
    const duration = Date.now() - startTime;
    logger.logAPIError(err, {
      operation: 'getAllStudents',
      duration,
    });
    next(err);
  }
};

/**
 * GET Student by ID
 */
exports.getStudentById = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    logger.logRequest(req);
    
    const student = await studentService.getStudentById(req.params.id);
    
    logger.info(`✅ Student retrieved by ID`, {
      studentId: req.params.id,
      name: student.name,
    });

    const duration = Date.now() - startTime;
    logger.logResponse(req, 200, duration);

    res.status(200).json({
      success: true,
      message: "Student retrieved successfully",
      data: student,
    });

  } catch (err) {
    const duration = Date.now() - startTime;
    logger.logAPIError(err, {
      operation: 'getStudentById',
      studentId: req.params.id,
      duration,
    });
    next(err);
  }
};

/**
 * UPDATE Student
 * 
 * Features:
 * - Update student data
 * - Update image if provided
 * - Emit real-time event
 */
exports.updateStudent = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    logger.logRequest(req);
    
    const studentData = { ...req.body };
    
    // Handle image update
    if (req.file) {
      logger.info(`📤 New image file for student update`, {
        filename: req.file.filename,
        size: req.file.size,
      });
      studentData.image = req.file.path; // Cloudinary URL
    }

    // Update student in database
    const student = await studentService.updateStudent(req.params.id, studentData);
    
    logger.info(`✅ Student updated successfully`, {
      studentId: req.params.id,
      name: student.name,
    });

    // Notify all connected clients in real-time
    emitToAll('studentUpdated', student);
    logger.logWebSocketEvent('studentUpdated', student, 'broadcast');

    const duration = Date.now() - startTime;
    logger.logResponse(req, 200, duration);

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });

  } catch (err) {
    const duration = Date.now() - startTime;
    logger.logAPIError(err, {
      operation: 'updateStudent',
      studentId: req.params.id,
      duration,
    });
    next(err);
  }
};

/**
 * DELETE Student
 * 
 * Features:
 * - Delete student from database
 * - Notify all clients in real-time
 */
exports.deleteStudent = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    logger.logRequest(req);
    
    const student = await studentService.deleteStudent(req.params.id);
    
    logger.info(`✅ Student deleted successfully`, {
      studentId: req.params.id,
      name: student.name,
    });

    // Notify all connected clients in real-time
    emitToAll('studentDeleted', {
      id: req.params.id,
      name: student.name,
    });
    logger.logWebSocketEvent('studentDeleted', { id: req.params.id }, 'broadcast');

    const duration = Date.now() - startTime;
    logger.logResponse(req, 200, duration);

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: student,
    });

  } catch (err) {
    const duration = Date.now() - startTime;
    logger.logAPIError(err, {
      operation: 'deleteStudent',
      studentId: req.params.id,
      duration,
    });
    next(err);
  }
};
