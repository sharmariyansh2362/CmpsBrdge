const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

router.get('/', async (req, res) => {
  try {
    const { data: posts, error } = await supabase
      .from('lost_found')
      .select('*, users(name)')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, category, image_url } = req.body;
    if (!title || !category) return res.status(400).json({ error: 'Title and category are required' });

    const { data: newPost, error } = await supabase
      .from('lost_found')
      .insert({
        title,
        description,
        category,
        image_url,
        posted_by: req.user.id,
        status: 'active'
      })
      .select('*, users(name)')
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/resolve', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can mark items as resolved' });
    }

    const { data: post, error } = await supabase
      .from('lost_found')
      .update({ status: 'resolved' })
      .eq('id', req.params.id)
      .select('*, users(name)')
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete posts' });
    }

    const { error } = await supabase.from('lost_found').delete().eq('id', req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
