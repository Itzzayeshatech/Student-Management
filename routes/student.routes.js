const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { upload } = require('../config/cloudinary');
const validate = require('../middlewares/validation.middleware');

router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', upload.single('image'), validate, studentController.createStudent);
router.put('/:id', upload.single('image'), validate, studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
