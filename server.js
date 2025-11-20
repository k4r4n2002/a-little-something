require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const authRoutes = require('./routes/auth');
const affirmationRoutes = require('./routes/affirmations');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Auto-setup function to create default users
const setupDefaultUsers = async () => {
  try {
    const existingUsers = await User.find({});
    
    if (existingUsers.length === 0) {
      console.log('📝 No users found. Creating default users...');
      
      // Create Karan's account
      const karanPassword = await bcrypt.hash('ksm291200', 10);
      await User.create({
        username: 'karan',
        password: karanPassword,
        displayName: 'Karan'
      });
      console.log('✅ Created Karan\'s account');
      
      // Create Khushi's account
      const khushiPassword = await bcrypt.hash('kd160902', 10);
      await User.create({
        username: 'khushi',
        password: khushiPassword,
        displayName: 'Khushi'
      });
      console.log('✅ Created Khushi\'s account');
      
      console.log('\n🎉 Default users created successfully!');
      console.log('Login credentials:');
      console.log('  Karan  - username: karan,  password: ksm291200');
      console.log('  Khushi - username: khushi, password: kd160902');
      console.log('\n⚠️  IMPORTANT: Change these passwords before deployment!\n');
    } else {
      console.log(`✅ Found ${existingUsers.length} existing user(s)`);
    }
  } catch (err) {
    console.error('❌ Error setting up default users:', err);
  }
};

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Auto-create users if they don't exist
    await setupDefaultUsers();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.error('Please check your MONGODB_URI in .env file');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', affirmationRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle 404
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`💖 Ready to share some love!`);
});