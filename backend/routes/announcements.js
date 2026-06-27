const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

router.get('/', async (req, res) => {
  try {
    let query = supabase.from('announcements').select('*, users(name)');
    
    // Enforce role-based targets
    if (req.user.role === 'student') {
      query = query.in('role_target', ['all', 'student']);
    } else if (req.user.role === 'faculty') {
      query = query.in('role_target', ['all', 'faculty']);
    }

    const { data: anns, error } = await query.order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(anns);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, role_target } = req.body;
    if (req.user.role === 'student') return res.status(403).json({ error: 'Unauthorized role' });
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

    const { data: newAnn, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        posted_by: req.user.id,
        role_target: role_target || 'all'
      })
      .select('*, users(name)')
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(newAnn);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can delete announcements' });
    const { error } = await supabase.from('announcements').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
