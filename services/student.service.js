const Student = require('../models/student.model');
const ApiError = require('../utils/ApiError');

let students = []; // in-memory DB

// CREATE
exports.createStudent = async (data) => {
  const student = new Student({
    id: Date.now().toString(),
    ...data
  });

  students.push(student);
  return student;
};

// GET ALL (with pagination & search)
exports.getAllStudents = async ({ page = 1, limit = 10, search = '' }) => {
  let filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const start = (page - 1) * limit;
  const end = start + Number(limit);

  return {
    total: filtered.length,
    data: filtered.slice(start, end)
  };
};

// GET BY ID
exports.getStudentById = async (id) => {
  const student = students.find(s => s.id === id);
  if (!student) throw new ApiError(404, 'Student not found');
  return student;
};

// UPDATE
exports.updateStudent = async (id, data) => {
  const index = students.findIndex(s => s.id === id);
  if (index === -1) throw new ApiError(404, 'Student not found');

  students[index] = { ...students[index], ...data };
  return students[index];
};

// DELETE
exports.deleteStudent = async (id) => {
  const index = students.findIndex(s => s.id === id);
  if (index === -1) throw new ApiError(404, 'Student not found');

  const deleted = students.splice(index, 1);
  return deleted[0];
};
