const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/courses', async (req, res) => {
  try {
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (studentErr || !student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const { data: enrollments, error: enrollErr } = await supabase
      .from('student_courses')
      .select('course_id')
      .eq('student_id', student.id);

    if (enrollErr) return res.status(500).json({ error: enrollErr.message });
    if (!enrollments || enrollments.length === 0) return res.json([]);

    const courseIds = enrollments.map(e => e.course_id);
    const { data: courses, error: courseErr } = await supabase
      .from('courses')
      .select('*, faculty(*, users(*))')
      .in('id', courseIds);

    if (courseErr) return res.status(500).json({ error: courseErr.message });

    const formattedCourses = courses.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      department: c.department,
      semester: c.semester,
      credits: c.credits,
      faculty_name: c.faculty?.users?.name || 'TBD',
      faculty_email: c.faculty?.users?.email || ''
    }));

    res.json(formattedCourses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const { data: student, error } = await supabase
      .from('students')
      .select('*, users(*)')
      .eq('user_id', req.user.id)
      .single();

    if (error || !student) return res.status(404).json({ error: 'Student profile not found' });

    res.json({
      id: student.id,
      name: student.users.name,
      email: student.users.email,
      department: student.department,
      semester: student.semester,
      enrollment_no: student.roll_number || student.rollNo || student.enrollment_no
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { name, department } = req.body;
    await supabase.from('users').update({ name, department }).eq('id', req.user.id);
    await supabase.from('students').update({ department }).eq('user_id', req.user.id);
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/applications', verifyToken, async (req, res) => {
  try {
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (studentErr || !student) return res.status(404).json({ error: 'Student profile not found' });

    const { data: apps, error: appErr } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false });

    if (appErr) return res.status(500).json({ error: appErr.message });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/applications', verifyToken, async (req, res) => {
  try {
    const { type, description } = req.body;
    if (!type || !description) return res.status(400).json({ error: 'Type and description are required' });

    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (studentErr || !student) return res.status(404).json({ error: 'Student profile not found' });

    const { data: newApp, error: insertErr } = await supabase
      .from('applications')
      .insert({ student_id: student.id, type, description, status: 'pending' })
      .select()
      .single();

    if (insertErr) return res.status(400).json({ error: insertErr.message });
    res.status(201).json(newApp);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Student attendance routes
router.post('/attendance/mark', async (req, res) => {
  try {
    const { class_id, date } = req.body;
    if (!class_id) return res.status(400).json({ error: 'class_id required' });

    const { data: student, error: stuErr } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (stuErr || !student) return res.status(404).json({ error: 'Student profile not found' });

    const attended_at = date ? new Date(date).toISOString() : new Date().toISOString();

    const { data: record, error: insErr } = await supabase
      .from('attendance_records')
      .insert({ student_id: student.id, class_id, attended_at })
      .select()
      .single();

    if (insErr) return res.status(400).json({ error: insErr.message });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/attendance/view', async (req, res) => {
  try {
    const { data: student, error: stuErr } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (stuErr || !student) return res.status(404).json({ error: 'Student profile not found' });

    const { data: records, error } = await supabase
      .from('attendance_records')
      .select('*, courses!inner(name)')
      .eq('student_id', student.id)
      .order('attended_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/dashboard-stats', async (req, res) => {
  try {
    const { data: student, error: stuErr } = await supabase
      .from('students')
      .select('*, users(name)')
      .eq('user_id', req.user.id)
      .single();

    if (stuErr || !student) return res.status(404).json({ error: 'Student profile not found' });

    // CGPA + credits from academic_performance
    const { data: perf } = await supabase
      .from('academic_performance')
      .select('grade_point, courses(credits)')
      .eq('student_id', student.id);

    let cgpa = 0, totalCredits = 0;
    if (perf && perf.length > 0) {
      const weightedSum = perf.reduce((s, r) => s + (r.grade_point || 0) * (r.courses?.credits || 0), 0);
      totalCredits = perf.reduce((s, r) => s + (r.courses?.credits || 0), 0);
      cgpa = totalCredits > 0 ? parseFloat((weightedSum / totalCredits).toFixed(2)) : 0;
    }

    // Attendance %
    const { data: attRecords } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', student.id);

    let attendancePercent = 0;
    if (attRecords && attRecords.length > 0) {
      const present = attRecords.filter(a => a.status === 'present').length;
      attendancePercent = Math.round((present / attRecords.length) * 100);
    }

    // Today's classes from timetable
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = dayNames[new Date().getDay()];
    const { data: todayClasses } = await supabase
      .from('timetable')
      .select('*')
      .eq('semester', student.semester)
      .eq('section', student.section)
      .eq('day', today)
      .order('time_slot');

    res.json({
      name: student.users?.name,
      roll_number: student.roll_number || student.enrollment_no,
      semester: student.semester,
      department: student.department,
      section: student.section,
      cgpa,
      totalCredits,
      attendancePercent,
      todayClasses: todayClasses || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
