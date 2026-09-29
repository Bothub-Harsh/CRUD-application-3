const mongoose = require('mongoose');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    status = 400;
    const validationErrors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    message = 'Validation failed';
    errors = validationErrors;
  }

  // Mongoose duplicate key error
  else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `A record with ${field} '${value}' already exists.`;
  }

  // Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    status = 400;
    message = 'Invalid ID format provided.';
  }

  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid authentication token.';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Authentication token has expired.';
  }

  const response = { success: false, message };
  if (errors) response.errors = errors;
  if (process.env.NODE_ENV === 'development') response.stack = err.stack;

  res.status(status).json(response);
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = { errorHandler, asyncHandler, createError };
