const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management';

  try {
    console.log('📡 Connecting to MongoDB...');
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected successfully`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🏠 Host: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('');
    console.error('📋 Troubleshooting tips:');
    console.error('   1. Make sure MongoDB is running locally or your Atlas URI is correct');
    console.error('   2. Check MONGODB_URI in your .env file');
    console.error('   3. For local: mongod --dbpath /data/db');
    console.error('   4. For Atlas: ensure IP whitelist includes your current IP');
    throw error;
  }
};

module.exports = connectDB;
