const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const bcrypt = require('bcryptjs');

// Helper to log admin action
async function logAction(adminId, action, targetUserId = null) {
  await supabase.from('admin_logs').insert({
    action,
    performed_by: adminId,
    target_user: targetUserId
  });
}

router.get('/dashboard-stats', async (req, res) => {
  try {
    const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
    const { count: facultyCount } = await supabase.from('faculty').select('*', { count: 'exact', head: true });
    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    const { count: pendingApps } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    res.json({
      students: studentCount || 0,
      faculty: facultyCount || 0,
      courses: courseCount || 0,
      pendingApplications: pendingApps || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User CRUD
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, department, extraId } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing required parameters' });

    const hashedPassword = bcrypt.hashSync(password, 12);
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert({ name, email, password: hashedPassword, role, department })
      .select()
      .single();

    if (userErr) return res.status(400).json({ error: userErr.message });

    // Link subprofile
    if (role === 'student') {
      await supabase.from('students').insert({
        user_id: user.id,
        roll_number: extraId || 'STU' + Date.now().toString().slice(-6),
        semester: 1,
        department
      });
    } else if (role === 'faculty') {
      await supabase.from('faculty').insert({
        user_id: user.id,
        employee_id: extraId || 'FAC' + Date.now().toString().slice(-6),
        department,
        designation: 'Lecturer'
      });
    }

    await logAction(req.user.id, `Created user ${email} (${role})`, user.id);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, department, semester, section } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .update({ name, email, role, department })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // If student, also update semester/section in students table
    if (role === 'student' && (semester || section)) {
      const updateFields = {};
      if (semester) updateFields.semester = semester;
      if (section) updateFields.section = section;

      await supabase
        .from('students')
        .update(updateFields)
        .eq('user_id', req.params.id);
    }

    await logAction(req.user.id, `Updated user ${email}`, user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });

    await logAction(req.user.id, `Deleted user ID ${req.params.id}`);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Applications approval
router.get('/applications', async (req, res) => {
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
router.put('/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const { data: app, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    if (status === 'approved' && app.type === 'Course Enrollment') {
      const courseName = app.description.split(":")[1]?.split(".")[0]?.trim();
      const { data: course } = await supabase
        .from("courses")
        .select("id")
        .ilike("name", `%${courseName}%`)
        .single();

      if (course) {
        await supabase.from("student_courses").insert({
          student_id: app.student_id,
          course_id: course.id
        });
      }
    }

    await logAction(req.user.id, `Set application ${req.params.id} to ${status}`);
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
})

// Logs
router.get('/logs', async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('admin_logs')
      .select('*, users!admin_logs_performed_by_fkey(name, email)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put("/applications/:id/approve", async (req, res) => {
  try {
    // Get application
    const { data: app } = await supabase
      .from("applications")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (!app) return res.status(404).json({ error: "Application not found" });

    // Create user in users table
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        name: app.name,
        email: app.email,
        password: app.password,
        role: app.role,
        department: app.department
      })
      .select()
      .single();

    if (userError) return res.status(400).json({ error: userError.message });

    // If student add to students table
    if (app.role === "student") {
      await supabase.from("students").insert({
        user_id: newUser.id,
        roll_number: app.roll_number || app.enrollment_no,
        semester: 1,
        department: app.department || "General"
      });
    }

    // If faculty add to faculty table
    if (app.role === "faculty") {
      // If course enrollment application
      if (app.type === "Course Enrollment") {
        const courseName = app.description.split(":")[1]?.split(".")[0]?.trim();
        const { data: course } = await supabase
          .from("courses")
          .select("id")
          .ilike("name", `%${courseName}%`)
          .single();

        if (course) {
          await supabase
            .from("student_courses")
            .insert({
              student_id: app.student_id,
              course_id: course.id
            });
        }
      }
      await supabase.from("faculty").insert({
        user_id: newUser.id,
        employee_id: `F${Date.now()}`,
        department: app.department || "General",
        designation: "Assistant Professor"
      });
    }

    // Update application status
    await supabase
      .from("applications")
      .update({ status: "approved" })
      .eq("id", req.params.id);

    // Log action
    await supabase.from("admin_logs").insert({
      action: `Approved registration for ${app.email}`,
      performed_by: req.user.id,
      target_user: newUser.id
    });

res.json({ message: "User approved and created successfully!" });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all courses (for dropdown)
router.get('/courses', async (req, res) => {
  try {
    const { data: courses, error } = await supabase.from('courses').select('id, name, code');
    if (error) return res.status(500).json({ error: error.message });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign a course to a student
router.post('/users/:id/enroll', async (req, res) => {
  try {
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ error: 'course_id is required' });

    // Find the student record linked to this user
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', req.params.id)
      .single();

    if (studentErr || !student) return res.status(400).json({ error: 'This user is not a student' });

    // Prevent duplicate enrollment
    const { data: existing } = await supabase
      .from('student_courses')
      .select('id')
      .eq('student_id', student.id)
      .eq('course_id', course_id)
      .single();

    if (existing) return res.status(400).json({ error: 'Student already enrolled in this course' });

    const { error: insertErr } = await supabase
      .from('student_courses')
      .insert({ student_id: student.id, course_id });

    if (insertErr) return res.status(400).json({ error: insertErr.message });

    await logAction(req.user.id, `Enrolled student (user ${req.params.id}) in course ${course_id}`);
    res.json({ success: true, message: 'Course assigned successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new course
router.post('/courses', async (req, res) => {
  try {
    const { name, code, department, faculty_id, semester, credits } = req.body;
    if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });

    let facultyRowId = null;
    if (faculty_id) {
      const { data: facultyRow } = await supabase
        .from('faculty')
        .select('id')
        .eq('user_id', faculty_id)
        .single();
      facultyRowId = facultyRow?.id || null;
    }

    const { data: course, error } = await supabase
      .from('courses')
      .insert({ name, code, department, faculty_id: facultyRowId, semester, credits })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    await logAction(req.user.id, `Created course ${code} - ${name}`);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/dept-distribution', async (req, res) => {
  try {
    const { data: students } = await supabase.from('students').select('department');
    const { data: facultyRows } = await supabase.from('faculty').select('department');

    const deptMap = {};

    (students || []).forEach(s => {
      const dept = s.department || 'Unassigned';
      if (!deptMap[dept]) deptMap[dept] = { name: dept, students: 0, faculty: 0 };
      deptMap[dept].students++;
    });

    (facultyRows || []).forEach(f => {
      const dept = f.department || 'Unassigned';
      if (!deptMap[dept]) deptMap[dept] = { name: dept, students: 0, faculty: 0 };
      deptMap[dept].faculty++;
    });

    res.json(Object.values(deptMap));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
