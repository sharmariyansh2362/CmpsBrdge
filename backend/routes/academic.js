// Academic performance routes
const express = require('express');
const router = express.Router();
const { verifyToken, permit } = require('../middleware/authMiddleware');
const academicCtrl = require('../controllers/academicController');

// Student can view their own performance
router.get('/student/:studentId', verifyToken, academicCtrl.getStudentPerformance);
router.get('/student/:studentId/summary', verifyToken, academicCtrl.getSemesterSummary);

// Faculty can view course performance and update grades
router.get('/course/:courseId', verifyToken, permit('faculty', 'admin'), academicCtrl.getPerformanceByCourse);
router.post('/grade', verifyToken, permit('faculty', 'admin'), academicCtrl.upsertGrade);
router.post('/grades/bulk', verifyToken, permit('faculty', 'admin'), academicCtrl.bulkUpsertGrades);

module.exports = router;
