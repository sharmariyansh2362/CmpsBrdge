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
      enrollment_no: student.enrollment_no
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

module.exports = router;
