const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET existing Tijori images (max two) for the special user (karan)
router.get('/', auth, async (req, res) => {
  try {
    // Only Karan & Khushi are allowed to view, but upload restricted to Karan
    const userDoc = await User.findOne({ username: 'karan' }).select('tijoriImages');
    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ images: userDoc.tijoriImages || [] });
  } catch (err) {
    console.error('Error fetching Tijori images:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST to save/replace Tijori images – only allowed for Karan
router.post('/', auth, async (req, res) => {
  if (req.user?.username !== 'karan') {
    return res.status(403).json({ error: 'Not authorised' });
  }

  const { images } = req.body; // expected array of base64 strings (length ≤ 2)

  if (!Array.isArray(images) || images.length === 0 || images.length > 2) {
    return res.status(400).json({ error: 'Provide 1 or 2 base64-encoded images' });
  }

  try {
    await User.findOneAndUpdate(
      { username: 'karan' },
      { tijoriImages: images },
      { upsert: false }
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('Error saving Tijori images:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
