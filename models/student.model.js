const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [100, 'Age must be realistic']
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: ""
    },
    image: {
      type: String, // Cloudinary URL
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model('Student', studentSchema);
