const studentService = require('../services/student.service');

// CREATE
exports.createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// GET ALL
exports.getAllStudents = async (req, res, next) => {
  try {
    const result = await studentService.getAllStudents(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// UPDATE
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await studentService.deleteStudent(req.params.id);
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};
