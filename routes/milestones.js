const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET all milestones (shared between both users)
router.get('/', auth, async (req, res) => {
  try {
    // Get milestones from both users
    const karan = await User.findOne({ username: 'karan' }).select('milestones');
    const khushi = await User.findOne({ username: 'khushi' }).select('milestones');
    
    let allMilestones = [];
    
    // Add default "Meeting You" milestone
    allMilestones.push({
      id: 'default',
      title: 'Meeting You',
      date: 'The Beginning',
      icon: '✨',
      unlocked: true,
      message: 'The day I met you, my world changed forever. You are the most beautiful surprise life has given me. Every moment since then has been a gift. 💕',
      order: 0
    });
    
    // Add Karan's milestones
    if (karan && karan.milestones && karan.milestones.length > 0) {
      karan.milestones.forEach(m => {
        allMilestones.push({
          id: m._id.toString(),
          title: m.title,
          date: m.date,
          icon: m.icon,
          unlocked: m.unlocked,
          message: m.message,
          createdBy: 'karan',
          order: m.order || 999
        });
      });
    }
    
    // Add Khushi's milestones
    if (khushi && khushi.milestones && khushi.milestones.length > 0) {
      khushi.milestones.forEach(m => {
        allMilestones.push({
          id: m._id.toString(),
          title: m.title,
          date: m.date,
          icon: m.icon,
          unlocked: m.unlocked,
          message: m.message,
          createdBy: 'khushi',
          order: m.order || 999
        });
      });
    }
    
    // Sort by order, then by creation date
    allMilestones.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return 0;
    });
    
    res.json({ milestones: allMilestones });
  } catch (err) {
    console.error('Error fetching milestones:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST to add a new milestone (both users can add)
router.post('/', auth, async (req, res) => {
  try {
    const { title, date, icon, message, unlocked, order } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    const user = await User.findOne({ username: req.user.username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.milestones.push({
      title,
      date: date || '',
      icon: icon || '💕',
      message,
      unlocked: unlocked !== undefined ? unlocked : true,
      order: order || 999,
      createdAt: new Date()
    });
    
    await user.save();
    
    // Return all milestones from both users
    const karan = await User.findOne({ username: 'karan' }).select('milestones');
    const khushi = await User.findOne({ username: 'khushi' }).select('milestones');
    
    let allMilestones = [{
      id: 'default',
      title: 'Meeting You',
      date: 'The Beginning',
      icon: '✨',
      unlocked: true,
      message: 'The day I met you, my world changed forever. You are the most beautiful surprise life has given me. Every moment since then has been a gift. 💕',
      order: 0
    }];
    
    if (karan && karan.milestones) {
      karan.milestones.forEach(m => {
        allMilestones.push({
          id: m._id.toString(),
          title: m.title,
          date: m.date,
          icon: m.icon,
          unlocked: m.unlocked,
          message: m.message,
          createdBy: 'karan',
          order: m.order || 999
        });
      });
    }
    
    if (khushi && khushi.milestones) {
      khushi.milestones.forEach(m => {
        allMilestones.push({
          id: m._id.toString(),
          title: m.title,
          date: m.date,
          icon: m.icon,
          unlocked: m.unlocked,
          message: m.message,
          createdBy: 'khushi',
          order: m.order || 999
        });
      });
    }
    
    allMilestones.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return 0;
    });
    
    res.json({ success: true, milestones: allMilestones });
  } catch (err) {
    console.error('Error adding milestone:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT to update a milestone (only the creator can edit)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, icon, message, unlocked, order } = req.body;
    
    const user = await User.findOne({ username: req.user.username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const milestone = user.milestones.id(id);
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found or you don\'t have permission to edit it' });
    }
    
    if (title !== undefined) milestone.title = title;
    if (date !== undefined) milestone.date = date;
    if (icon !== undefined) milestone.icon = icon;
    if (message !== undefined) milestone.message = message;
    if (unlocked !== undefined) milestone.unlocked = unlocked;
    if (order !== undefined) milestone.order = order;
    
    await user.save();
    
    // Return all milestones
    const karan = await User.findOne({ username: 'karan' }).select('milestones');
    const khushi = await User.findOne({ username: 'khushi' }).select('milestones');
    
    let allMilestones = [{
      id: 'default',
      title: 'Meeting You',
      date: 'The Beginning',
      icon: '✨',
      unlocked: true,
      message: 'The day I met you, my world changed forever. You are the most beautiful surprise life has given me. Every moment since then has been a gift. 💕',
      order: 0
    }];
    
    if (karan && karan.milestones) {
      karan.milestones.forEach(m => {
        allMilestones.push({
          id: m._id.toString(),
          title: m.title,
          date: m.date,
          icon: m.icon,
          unlocked: m.unlocked,
          message: m.message,
          createdBy: 'karan',
          order: m.order || 999
        });
      });
    }
    
    if (khushi && khushi.milestones) {
      khushi.milestones.forEach(m => {
        allMilestones.push({
          id: m._id.toString(),
          title: m.title,
          date: m.date,
          icon: m.icon,
          unlocked: m.unlocked,
          message: m.message,
          createdBy: 'khushi',
          order: m.order || 999
        });
      });
    }
    
    allMilestones.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return 0;
    });
    
    res.json({ success: true, milestones: allMilestones });
  } catch (err) {
    console.error('Error updating milestone:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE a milestone (only the creator can delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findOne({ username: req.user.username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const milestone = user.milestones.id(id);
    
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found or you don\'t have permission to delete it' });
    }
    
    milestone.deleteOne();
    await user.save();
    
    // Return all milestones
    const karan = await User.findOne({ username: 'karan' }).select('milestones');
    const khushi = await User.findOne({ username: 'khushi' }).select('milestones');
    
    let allMilestones = [{
      id: 'default',
      title: 'Meeting You',
      date: 'The Beginning',
      icon: '✨',
      unlocked: true,
      message: 'The day I met you, my world changed forever. You are the most beautiful surprise life has given me. Every moment since then has been a gift. 💕',
      order: 0
    }];
    
    if (karan && karan.milestones) {
      karan.milestones.forEach(m => {
        allMilestones.push({
          id: m._id.toString(),
          title: m.title,
          date: m.date,
          icon: m.icon,
          unlocked: m.unlocked,
          message: m.message,
          createdBy: 'karan',
          order: m.order || 999
        });
      });
    }
    
    if (khushi && khushi.milestones) {
      khushi.milestones.forEach(m => {
        allMilestones.push({
          id: m._id.toString(),
          title: m.title,
          date: m.date,
          icon: m.icon,
          unlocked: m.unlocked,
          message: m.message,
          createdBy: 'khushi',
          order: m.order || 999
        });
      });
    }
    
    allMilestones.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return 0;
    });
    
    res.json({ success: true, milestones: allMilestones });
  } catch (err) {
    console.error('Error deleting milestone:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;