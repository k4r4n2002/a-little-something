// migration.js - Run this once to migrate existing data
require('dotenv').config();
const mongoose = require('mongoose');

async function migrateData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Use direct MongoDB operations to bypass validation
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const users = await usersCollection.find({}).toArray();
    
    for (const user of users) {
      const updates = {};
      let needsUpdate = false;
      
      // Handle tijoriImages migration
      if (user.tijoriImages) {
        let migratedImages = [];
        
        // Flatten if it's an array of arrays
        const flatImages = Array.isArray(user.tijoriImages) 
          ? user.tijoriImages.flat(Infinity) 
          : [];
        
        for (const img of flatImages) {
          // Skip empty strings or invalid data
          if (!img || img === '') continue;
          
          // If it's a string (base64), convert to new format
          if (typeof img === 'string') {
            migratedImages.push({
              data: img,
              uploadedBy: user.username,
              uploadedAt: new Date()
            });
          } 
          // If it's already an object, ensure it has all fields
          else if (img && typeof img === 'object') {
            migratedImages.push({
              data: img.data || '',
              uploadedBy: img.uploadedBy || user.username,
              uploadedAt: img.uploadedAt || new Date()
            });
          }
        }
        
        updates.tijoriImages = migratedImages;
        needsUpdate = true;
      }
      
      // Initialize notesList if it doesn't exist
      if (!user.notesList) {
        updates.notesList = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: updates }
        );
        console.log(`✅ Migrated data for user: ${user.username}`);
      } else {
        console.log(`⏭️  User ${user.username} already migrated`);
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrateData();