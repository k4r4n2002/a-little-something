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
  // Affirmations that this user has created for others
  affirmationsCreated: [{
    text: {
      type: String,
      required: true
    },
    forUser: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // NEW: Milestones
  milestones: [{
    title: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true,
      default: '💕'
    },
    message: {
      type: String,
      required: true
    },
    unlocked: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 999
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);