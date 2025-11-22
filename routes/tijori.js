const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET all Tijori images (from both users)
router.get('/', auth, async (req, res) => {
  try {
    const karan = await User.findOne({ username: 'karan' }).select('tijoriImages');
    const khushi = await User.findOne({ username: 'khushi' }).select('tijoriImages');
    
    let allImages = [];
    
    // Add Karan's images
    if (karan && karan.tijoriImages) {
      allImages = allImages.concat(karan.tijoriImages);
    }
    
    // Add Khushi's images
    if (khushi && khushi.tijoriImages) {
      allImages = allImages.concat(khushi.tijoriImages);
    }
    
    return res.json({ images: allImages });
  } catch (err) {
    console.error('Error fetching Tijori images:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST to add a new Tijori image
router.post('/', auth, async (req, res) => {
  const { image } = req.body;

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Provide a valid base64-encoded image' });
  }

  try {
    const newImage = {
      data: image,
      uploadedBy: req.user.username,
      uploadedAt: new Date()
    };
    
    // Add image to the current user's tijoriImages array
    await User.findOneAndUpdate(
      { username: req.user.username },
      { $push: { tijoriImages: newImage } },
      { new: true, upsert: false }
    );
    
    // Fetch all images from both users
    const karan = await User.findOne({ username: 'karan' }).select('tijoriImages');
    const khushi = await User.findOne({ username: 'khushi' }).select('tijoriImages');
    
    let allImages = [];
    
    if (karan && karan.tijoriImages) {
      allImages = allImages.concat(karan.tijoriImages);
    }
    
    if (khushi && khushi.tijoriImages) {
      allImages = allImages.concat(khushi.tijoriImages);
    }
    
    return res.json({ success: true, images: allImages });
  } catch (err) {
    console.error('Error saving Tijori image:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;