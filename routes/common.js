const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET notes for the logged-in user (used primarily to fetch Karan's saved notes)
router.get('/notes', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: 'karan' }).select('notes');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ content: user.notes || '' });
  } catch (err) {
    console.error('Error fetching notes:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update notes – only allowed for Karan
router.post('/notes', auth, async (req, res) => {
  if (req.user?.username !== 'karan') {
    return res.status(403).json({ error: 'Not authorised' });
  }

  const { content = '' } = req.body;

  try {
    await User.findOneAndUpdate(
      { username: 'karan' },
      { notes: content },
      { upsert: true }
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('Error saving notes:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
