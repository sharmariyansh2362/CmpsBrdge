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
        enrollment_no: extraId || 'STU' + Date.now().toString().slice(-6),
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
    const { name, email, role, department } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .update({ name, email, role, department })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

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

    await logAction(req.user.id, `Set application ${req.params.id} to ${status}`);
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

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

module.exports = router;
