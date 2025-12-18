const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  currentPosition: {
    type: Number,
    default: null
  },
  // Legacy single note field (for backward compatibility)
  notes: {
    type: String,
    default: ''
  },
  // New array of notes with timestamps
  notesList: [{
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Updated: Now stores Cloudinary URLs instead of base64
  tijoriImages: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: String
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Birthday message (for Karan to customize)
  birthdayMessage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);