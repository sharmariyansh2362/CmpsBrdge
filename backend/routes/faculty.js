const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { verifyToken } = require('../middleware/authMiddleware');
router.get('/dashboard-stats', async (req, res) => {
  try {
    const { data: faculty, error: facErr } = await supabase
      .from('faculty')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (facErr || !faculty) return res.status(404).json({ error: 'Faculty profile not found' });

    // Count assigned courses
    const { count: courseCount, error: courseErr } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('faculty_id', faculty.id);

    // Get total enrolled students in all faculty courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('faculty_id', faculty.id);

    let studentCount = 0;
    if (courses && courses.length > 0) {
      const courseIds = courses.map(c => c.id);
      const { data: enrollments } = await supabase
        .from('student_courses')
        .select('student_id')
        .in('course_id', courseIds);

      if (enrollments) {
        // Unique student count
        const uniqueStudents = new Set(enrollments.map(e => e.student_id));
        studentCount = uniqueStudents.size;
      }
    }

    res.json({
      coursesCount: courseCount || 0,
      studentsCount: studentCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/courses', async (req, res) => {
  try {
    const { data: faculty, error: facErr } = await supabase
      .from('faculty')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (facErr || !faculty) return res.status(404).json({ error: 'Faculty profile not found' });

    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('faculty_id', faculty.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json(courses || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/students', async (req, res) => {
  try {
    const { data: faculty, error: facErr } = await supabase
      .from('faculty')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (facErr || !faculty) return res.status(404).json({ error: 'Faculty profile not found' });

    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('faculty_id', faculty.id);

    if (!courses || courses.length === 0) return res.json([]);

    const courseIds = courses.map(c => c.id);
    const { data: enrollments, error: enrollErr } = await supabase
      .from('student_courses')
      .select('student_id, course_id')
      .in('course_id', courseIds);

    if (enrollErr) return res.status(500).json({ error: enrollErr.message });
    if (!enrollments || enrollments.length === 0) return res.json([]);

    const studentIds = enrollments.map(e => e.student_id);
    const { data: students, error: studErr } = await supabase
      .from('students')
      .select('*, users(*)')
      .in('id', studentIds);

    if (studErr) return res.status(500).json({ error: studErr.message });

    // Map course information onto each student
    const result = students.map(s => {
      const studentCourses = enrollments
        .filter(e => e.student_id === s.id)
        .map(e => e.course_id);
      return {
        id: s.id,
        name: s.users.name,
        email: s.users.email,
        enrollment_no: s.enrollment_no,
        department: s.department,
        semester: s.semester,
        course_ids: studentCourses
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const { data: faculty, error } = await supabase
      .from('faculty')
      .select('*, users(*)')
      .eq('user_id', req.user.id)
      .single();

    if (error || !faculty) return res.status(404).json({ error: 'Faculty profile not found' });

    res.json({
      id: faculty.id,
      name: faculty.users.name,
      email: faculty.users.email,
      employee_id: faculty.employee_id,
      department: faculty.department,
      designation: faculty.designation
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const { name, department, designation } = req.body;
    await supabase.from('users').update({ name, department }).eq('id', req.user.id);
    await supabase.from('faculty').update({ department, designation }).eq('user_id', req.user.id);
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/applications', verifyToken, async (req, res) => {
  try {
    const { data: apps, error } = await supabase
      .from('applications')
      .select('*, students(*, users(*))')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;
