const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET birthday message
router.get('/message', auth, async (req, res) => {
  try {
    // You can fetch from a database or just return a default message
    // For now, let's check if there's a custom message stored in user's document
    const user = await User.findOne({ username: req.user.username });
    
    const message = user.birthdayMessage || 
      `Happy Birthday, my love! 🎉💕\n\nOn this special day, I want you to know how incredibly grateful I am to have you in my life. You bring so much joy, warmth, and love into every moment we share. May this year bring you endless happiness, beautiful memories, and all the love your heart can hold. You deserve the world and so much more! 🌹❄️\n\nWith all my love,\nKaran`;
    
    res.json({ message });
  } catch (err) {
    console.error('Error fetching birthday message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST/PUT to set custom birthday message (only for Karan)
router.post('/message', auth, async (req, res) => {
  const { message } = req.body;
  
  // Only allow Karan to set the message
  if (req.user.username !== 'karan') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message' });
  }
  
  try {
    await User.findOneAndUpdate(
      { username: 'karan' },
      { birthdayMessage: message },
      { new: true, upsert: false }
    );
    
    res.json({ success: true, message });
  } catch (err) {
    console.error('Error saving birthday message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;