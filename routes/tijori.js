const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
    // Upload to Cloudinary
    // Folder structure: a-little-something/karan or a-little-something/khushi
    const result = await cloudinary.uploader.upload(image, {
      folder: `a-little-something/${req.user.username}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' } // Optimize images
      ]
    });

    const newImage = {
      url: result.secure_url,
      publicId: result.public_id,
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

// DELETE a Tijori image (optional - for cleanup)
router.delete('/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    
    // Remove from user's document
    await User.findOneAndUpdate(
      { username: req.user.username },
      { $pull: { tijoriImages: { publicId } } },
      { new: true }
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting Tijori image:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;