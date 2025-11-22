const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET all notes (from both users)
router.get('/notes', auth, async (req, res) => {
  try {
    const karan = await User.findOne({ username: 'karan' }).select('notes notesList');
    const khushi = await User.findOne({ username: 'khushi' }).select('notes notesList');
    
    let allNotes = [];
    
    // Add Karan's notes
    if (karan) {
      // Legacy note without timestamp
      if (karan.notes) {
        allNotes.push({
          content: karan.notes,
          author: 'karan',
          timestamp: null
        });
      }
      // New notes with timestamps
      if (karan.notesList && karan.notesList.length > 0) {
        allNotes = allNotes.concat(karan.notesList.map(note => ({
          ...note,
          author: 'karan'
        })));
      }
    }
    
    // Add Khushi's notes
    if (khushi) {
      // Legacy note without timestamp
      if (khushi.notes) {
        allNotes.push({
          content: khushi.notes,
          author: 'khushi',
          timestamp: null
        });
      }
      // New notes with timestamps
      if (khushi.notesList && khushi.notesList.length > 0) {
        allNotes = allNotes.concat(khushi.notesList.map(note => ({
          ...note,
          author: 'khushi'
        })));
      }
    }
    
    return res.json({ notes: allNotes });
  } catch (err) {
    console.error('Error fetching notes:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Add a new note
router.post('/notes', auth, async (req, res) => {
  const { content = '' } = req.body;
  
  if (!content.trim()) {
    return res.status(400).json({ error: 'Note content cannot be empty' });
  }

  try {
    const newNote = {
      content: content.trim(),
      timestamp: new Date()
    };
    
    // Add note to the BEGINNING of the current user's notesList (prepend instead of push)
    const user = await User.findOneAndUpdate(
      { username: req.user.username },
      { $push: { notesList: { $each: [newNote], $position: 0 } } },
      { new: true, upsert: false }
    );
    
    // Fetch all notes from both users
    const karan = await User.findOne({ username: 'karan' }).select('notes notesList');
    const khushi = await User.findOne({ username: 'khushi' }).select('notes notesList');
    
    let allNotes = [];
    
    // Collect all timestamped notes from both users
    let timestampedNotes = [];
    
    // Add Karan's timestamped notes
    if (karan && karan.notesList && karan.notesList.length > 0) {
      timestampedNotes = timestampedNotes.concat(karan.notesList.map(note => ({
        ...note,
        author: 'karan'
      })));
    }
    
    // Add Khushi's timestamped notes
    if (khushi && khushi.notesList && khushi.notesList.length > 0) {
      timestampedNotes = timestampedNotes.concat(khushi.notesList.map(note => ({
        ...note,
        author: 'khushi'
      })));
    }
    
    // Sort all timestamped notes by date (newest first - forum style)
    timestampedNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    allNotes = timestampedNotes;
    
    // Add legacy notes at the bottom
    if (karan && karan.notes) {
      allNotes.push({
        content: karan.notes,
        author: 'karan',
        timestamp: null
      });
    }
    
    if (khushi && khushi.notes) {
      allNotes.push({
        content: khushi.notes,
        author: 'khushi',
        timestamp: null
      });
    }
    
    return res.json({ notes: allNotes });
  } catch (err) {
    console.error('Error saving note:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;