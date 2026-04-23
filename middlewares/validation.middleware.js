const ApiError = require('../utils/ApiError');

module.exports = (req, res, next) => {
  const { name, age, course } = req.body;

  // Required fields validation
  if (!name || !age || !course) {
    return next(new ApiError(400, 'All fields are required'));
  }

  // Name validation
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return next(new ApiError(400, 'Name must be 2-100 characters'));
  }

  // Age validation
  const parsedAge = Number(age);
  if (isNaN(parsedAge) || parsedAge < 16 || parsedAge > 100) {
    return next(new ApiError(400, 'Age must be between 16 and 100'));
  }

  // Course validation
  const validCourses = ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Science'];
  if (!validCourses.includes(course)) {
    return next(new ApiError(400, 'Invalid course. Valid options: Computer Science, Engineering, Business, Medicine, Arts, Science'));
  }

  // Sanitize input
  req.body.name = name.trim();
  req.body.age = parsedAge;
  req.body.course = course.trim();

  next();
};
