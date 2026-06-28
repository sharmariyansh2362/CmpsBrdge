const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, async (req, res) => {
  try {
    const { data: channels, error } = await supabase.from('channels').select('*').order('name', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Channel name is required' });

    const { data: newChan, error } = await supabase
      .from('channels')
      .insert({ name, description, created_by: req.user.id })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(newChan);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/messages', verifyToken, async (req, res) => {
  try {
    const { data: msgs, error } = await supabase
      .from('channel_messages')
      .select('*, users(name, role)')
      .eq('channel_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/messages', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message cannot be empty' });

    const { data: newMsg, error } = await supabase
      .from('channel_messages')
      .insert({
        channel_id: req.params.id,
        user_id: req.user.id,
        message
      })
      .select('*, users(name, role)')
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    // Only faculty (creator) or admin can toggle
    const { data: channel, error } = await supabase
      .from('channels')
      .select('created_by, is_active')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ error: 'Channel not found' });

    // Check permissions
    if (req.user.role !== 'admin' && channel.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to toggle this channel' });
    }

    const { data: updated, error: updateErr } = await supabase
      .from('channels')
      .update({ is_active: !channel.is_active })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) return res.status(400).json({ error: updateErr.message });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
