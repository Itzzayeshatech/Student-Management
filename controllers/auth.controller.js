const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ApiError(400, 'All fields are required (name, email, password)'));
    }

    const newUser = await User.create({
      name,
      email,
      password
    });

    const token = signToken(newUser._id);

    // Remove password from output
    newUser.password = undefined;

    res.status(201).json({
      success: true,
      token,
      data: { user: newUser }
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ApiError(400, 'Email already exists'));
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'Please provide email and password'));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};
