const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Get all affirmations for a specific user
router.get('/affirmations/:forUser', auth, async (req, res) => {
  try {
    const { forUser } = req.params;
    
    // Validate forUser is either 'karan' or 'khushi'
    if (!['karan', 'khushi'].includes(forUser.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid user' });
    }

    // Get all affirmations created for this user
    const allUsers = await User.find({});
    let affirmations = [];

    allUsers.forEach(user => {
      if (user.affirmationsCreated && user.affirmationsCreated.length > 0) {
        const userAffirmations = user.affirmationsCreated
          .filter(aff => aff.forUser.toLowerCase() === forUser.toLowerCase())
          .map(aff => ({
            id: aff._id.toString(),
            text: aff.text,
            createdBy: user.username,
            createdAt: aff.createdAt
          }));
        affirmations = affirmations.concat(userAffirmations);
      }
    });

    // Sort by creation date (oldest first for sequential reading)
    affirmations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({ affirmations });
  } catch (err) {
    console.error('Error fetching affirmations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get next affirmation for the logged-in user
router.get('/affirmation', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all affirmations for the current user
    const allUsers = await User.find({});
    let affirmations = [];

    allUsers.forEach(user => {
      if (user.affirmationsCreated && user.affirmationsCreated.length > 0) {
        const userAffirmations = user.affirmationsCreated
          .filter(aff => aff.forUser.toLowerCase() === currentUser.username.toLowerCase())
          .map(aff => ({
            text: aff.text,
            createdAt: aff.createdAt
          }));
        affirmations = affirmations.concat(userAffirmations);
      }
    });

    // Sort by creation date
    affirmations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    if (affirmations.length === 0) {
      return res.json({
        text: 'No affirmations yet. Someone special needs to add some! 💕',
        number: 0,
        total: 0
      });
    }

    let position = currentUser.currentPosition;

    // If no position set, start at random
    if (position === null || position === undefined) {
      position = Math.floor(Math.random() * affirmations.length);
    } else {
      // Move to next affirmation
      position = (position + 1) % affirmations.length;
    }

    // Update user's position in database
    currentUser.currentPosition = position;
    await currentUser.save();

    res.json({
      text: affirmations[position].text,
      number: position + 1,
      total: affirmations.length
    });
  } catch (err) {
    console.error('Affirmation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new affirmation
router.post('/affirmations', auth, async (req, res) => {
  try {
    const { text, forUser } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Affirmation text is required' });
    }

    if (!forUser || !['karan', 'khushi'].includes(forUser.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid recipient user' });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add affirmation
    user.affirmationsCreated.push({
      text: text.trim(),
      forUser: forUser.toLowerCase(),
      createdAt: new Date()
    });

    await user.save();

    // Return all affirmations for the target user
    const allUsers = await User.find({});
    let affirmations = [];

    allUsers.forEach(u => {
      if (u.affirmationsCreated && u.affirmationsCreated.length > 0) {
        const userAffirmations = u.affirmationsCreated
          .filter(aff => aff.forUser.toLowerCase() === forUser.toLowerCase())
          .map(aff => ({
            id: aff._id.toString(),
            text: aff.text,
            createdBy: u.username,
            createdAt: aff.createdAt
          }));
        affirmations = affirmations.concat(userAffirmations);
      }
    });

    affirmations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({ success: true, affirmations });
  } catch (err) {
    console.error('Error adding affirmation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update affirmation
router.put('/affirmations/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Affirmation text is required' });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const affirmation = user.affirmationsCreated.id(id);
    
    if (!affirmation) {
      return res.status(404).json({ error: 'Affirmation not found' });
    }

    affirmation.text = text.trim();
    await user.save();

    // Return all affirmations for the target user
    const forUser = affirmation.forUser;
    const allUsers = await User.find({});
    let affirmations = [];

    allUsers.forEach(u => {
      if (u.affirmationsCreated && u.affirmationsCreated.length > 0) {
        const userAffirmations = u.affirmationsCreated
          .filter(aff => aff.forUser.toLowerCase() === forUser.toLowerCase())
          .map(aff => ({
            id: aff._id.toString(),
            text: aff.text,
            createdBy: u.username,
            createdAt: aff.createdAt
          }));
        affirmations = affirmations.concat(userAffirmations);
      }
    });

    affirmations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({ success: true, affirmations });
  } catch (err) {
    console.error('Error updating affirmation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete affirmation
router.delete('/affirmations/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const affirmation = user.affirmationsCreated.id(id);
    
    if (!affirmation) {
      return res.status(404).json({ error: 'Affirmation not found' });
    }

    const forUser = affirmation.forUser;
    affirmation.deleteOne();
    await user.save();

    // Return all affirmations for the target user
    const allUsers = await User.find({});
    let affirmations = [];

    allUsers.forEach(u => {
      if (u.affirmationsCreated && u.affirmationsCreated.length > 0) {
        const userAffirmations = u.affirmationsCreated
          .filter(aff => aff.forUser.toLowerCase() === forUser.toLowerCase())
          .map(aff => ({
            id: aff._id.toString(),
            text: aff.text,
            createdBy: u.username,
            createdAt: aff.createdAt
          }));
        affirmations = affirmations.concat(userAffirmations);
      }
    });

    affirmations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({ success: true, affirmations });
  } catch (err) {
    console.error('Error deleting affirmation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;