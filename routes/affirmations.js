const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Hard-coded list of affirmations
const affirmations = [
  'When I finally give you the world, I\'m sure that I\'ll still owe you',
  'If earlier I knew who you were, there would have never been a search',
  'With the warmth of your voice, I can make it through any winter',
  'My memories are limited but take as many as you\'d like',
  'Meeting you was an introduction to gratitude',
  'I\'m not sure where I\'ll end up but you feel like a destination'
];

// Protected route - get affirmation
router.get('/affirmation', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let position = user.currentPosition;

    // If no position set, start at random
    if (position === null || position === undefined) {
      position = Math.floor(Math.random() * affirmations.length);
    } else {
      // Move to next affirmation
      position = (position + 1) % affirmations.length;
    }

    // Update user's position in database
    user.currentPosition = position;
    await user.save();

    res.json({
      text: affirmations[position],
      number: position + 1,
      total: affirmations.length
    });
  } catch (err) {
    console.error('Affirmation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;