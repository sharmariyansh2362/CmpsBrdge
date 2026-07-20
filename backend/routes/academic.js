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

const supabase = require('../supabaseClient');

// Student → get own performance (resolves student_id from token)
router.get('/me/grades', verifyToken, async (req, res, next) => {
  try {
    const { data: student, error: sErr } = await supabase
      .from('students').select('id').eq('user_id', req.user.id).single();
    if (sErr || !student) return res.status(404).json({ error: 'No student profile linked to this account.' });
    req.params.studentId = student.id;
    return academicCtrl.getStudentPerformance(req, res, next);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me/summary', verifyToken, async (req, res, next) => {
  try {
    const { data: student, error: sErr } = await supabase
      .from('students').select('id').eq('user_id', req.user.id).single();
    if (sErr || !student) return res.status(404).json({ error: 'No student profile linked to this account.' });
    req.params.studentId = student.id;
    return academicCtrl.getSemesterSummary(req, res, next);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
