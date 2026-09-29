const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats
} = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');

// All routes are protected
router.use(authenticate);

router.get('/stats', getStats);
router.get('/', getStudents);
router.get('/:id', getStudent);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
