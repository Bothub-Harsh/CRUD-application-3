const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { asyncHandler, createError } = require('../middleware/errorHandler');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register admin
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw createError('Name, email, and password are required', 400);
  }

  if (password.length < 6) {
    throw createError('Password must be at least 6 characters', 400);
  }

  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
  if (existingAdmin) {
    throw createError('An admin with this email already exists', 409);
  }

  const admin = await Admin.create({ name, email, password });
  const token = generateToken(admin._id);

  res.status(201).json({
    success: true,
    message: 'Admin registered successfully',
    data: {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }
    }
  });
});

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin) {
    throw createError('Invalid credentials', 401);
  }

  if (!admin.isActive) {
    throw createError('Account has been deactivated. Contact support.', 403);
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw createError('Invalid credentials', 401);
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = generateToken(admin._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    }
  });
});

// @desc    Get current logged-in admin
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  if (!admin) {
    throw createError('Admin not found', 404);
  }

  res.json({
    success: true,
    data: {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin
      }
    }
  });
});

module.exports = { register, login, getMe };
