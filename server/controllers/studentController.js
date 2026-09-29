const mongoose = require('mongoose');
const Student = require('../models/Student');
const { asyncHandler, createError } = require('../middleware/errorHandler');

// @desc    Get all students with search, filter, sort, pagination
// @route   GET /api/students
// @access  Private
const getStudents = asyncHandler(async (req, res) => {
  const {
    search,
    department,
    course,
    year,
    gender,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
  } = req.query;

  // Build query
  const query = {};

  // Text search
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { studentId: searchRegex },
      { course: searchRegex },
      { department: searchRegex }
    ];
  }

  // Filters
  if (department) query.department = new RegExp(department, 'i');
  if (course) query.course = new RegExp(course, 'i');
  if (year) query.year = parseInt(year);
  if (gender) query.gender = gender;
  if (status) query.status = status;

  // Sorting
  const allowedSortFields = ['firstName', 'lastName', 'studentId', 'enrollmentDate', 'course', 'department', 'year', 'createdAt'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortDir = sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortDir };

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [students, total] = await Promise.all([
    Student.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
    Student.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: students,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid student ID format', 400);
  }

  const student = await Student.findById(id);
  if (!student) {
    throw createError('Student not found', 404);
  }

  res.json({ success: true, data: student });
});

// @desc    Create student
// @route   POST /api/students
// @access  Private
const createStudent = asyncHandler(async (req, res) => {
  const {
    firstName, lastName, email, phone, dateOfBirth, gender,
    studentId, course, department, year, address, city, state,
    country, enrollmentDate, status, profileImage
  } = req.body;

  // Check required fields
  if (!firstName || !lastName || !email || !studentId || !course || !department || !year) {
    throw createError('firstName, lastName, email, studentId, course, department, and year are required', 400);
  }

  // Check duplicates manually for better error messages
  const [emailExists, studentIdExists] = await Promise.all([
    Student.findOne({ email: email.toLowerCase() }),
    Student.findOne({ studentId: studentId.toUpperCase() })
  ]);

  if (emailExists) throw createError(`A student with email '${email}' already exists`, 409);
  if (studentIdExists) throw createError(`A student with ID '${studentId}' already exists`, 409);

  const student = await Student.create({
    firstName, lastName, email, phone, dateOfBirth, gender,
    studentId, course, department, year, address, city, state,
    country, enrollmentDate, status, profileImage
  });

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    data: student
  });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid student ID format', 400);
  }

  const student = await Student.findById(id);
  if (!student) {
    throw createError('Student not found', 404);
  }

  // Check email uniqueness if changed
  if (req.body.email && req.body.email.toLowerCase() !== student.email) {
    const emailExists = await Student.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: id } });
    if (emailExists) throw createError(`A student with email '${req.body.email}' already exists`, 409);
  }

  // Check studentId uniqueness if changed
  if (req.body.studentId && req.body.studentId.toUpperCase() !== student.studentId) {
    const idExists = await Student.findOne({ studentId: req.body.studentId.toUpperCase(), _id: { $ne: id } });
    if (idExists) throw createError(`A student with ID '${req.body.studentId}' already exists`, 409);
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Student updated successfully',
    data: updatedStudent
  });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Invalid student ID format', 400);
  }

  const student = await Student.findByIdAndDelete(id);
  if (!student) {
    throw createError('Student not found', 404);
  }

  res.json({
    success: true,
    message: `Student '${student.firstName} ${student.lastName}' deleted successfully`,
    data: { id: student._id }
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/students/stats
// @access  Private
const getStats = asyncHandler(async (req, res) => {
  const [
    total,
    statusStats,
    departmentStats,
    courseStats,
    recentStudents
  ] = await Promise.all([
    Student.countDocuments(),
    Student.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Student.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Student.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email course department status profileImage createdAt studentId').lean()
  ]);

  // Format status stats
  const statusMap = { active: 0, inactive: 0, graduated: 0, suspended: 0 };
  statusStats.forEach(s => { if (s._id) statusMap[s._id] = s.count; });

  res.json({
    success: true,
    data: {
      total,
      active: statusMap.active,
      inactive: statusMap.inactive,
      graduated: statusMap.graduated,
      suspended: statusMap.suspended,
      byDepartment: departmentStats.map(d => ({ name: d._id || 'Unknown', count: d.count })),
      byCourse: courseStats.map(c => ({ name: c._id || 'Unknown', count: c.count })),
      recentStudents
    }
  });
});

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getStats };
