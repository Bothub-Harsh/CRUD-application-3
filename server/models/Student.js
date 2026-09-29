const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-().]{7,20}$/, 'Please provide a valid phone number']
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other', 'prefer_not_to_say'],
        message: 'Gender must be one of: male, female, other, prefer_not_to_say'
      }
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1, 'Year must be between 1 and 6'],
      max: [6, 'Year must be between 1 and 6']
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'graduated', 'suspended'],
        message: 'Status must be one of: active, inactive, graduated, suspended'
      },
      default: 'active'
    },
    profileImage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for search performance
studentSchema.index({ firstName: 'text', lastName: 'text', email: 'text', studentId: 'text', course: 'text', department: 'text' });
studentSchema.index({ status: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ course: 1 });
studentSchema.index({ year: 1 });
studentSchema.index({ enrollmentDate: -1 });

// Virtual: full name
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware
studentSchema.pre('save', function (next) {
  if (this.studentId) {
    this.studentId = this.studentId.toUpperCase();
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
