const Student = require('../models/student.model');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

// CREATE
exports.createStudent = async (data) => {
  return await Student.create(data);
};

// GET ALL (pagination + search)
exports.getAllStudents = async ({ page = 1, limit = 10, search = '' }) => {
  const query = {
    name: { $regex: search, $options: 'i' }
  };

  const skip = (page - 1) * limit;

  const students = await Student.find(query)
    .skip(skip)
    .limit(Number(limit));

  const total = await Student.countDocuments(query);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    data: students
  };
};

// GET BY ID
exports.getStudentById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid ID format');
  }

  const student = await Student.findById(id);
  if (!student) throw new ApiError(404, 'Student not found');

  return student;
};

// UPDATE
exports.updateStudent = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid ID format');
  }

  const student = await Student.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!student) throw new ApiError(404, 'Student not found');

  return student;
};

// DELETE
exports.deleteStudent = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid ID format');
  }

  const student = await Student.findByIdAndDelete(id);

  if (!student) throw new ApiError(404, 'Student not found');

  return student;
};
