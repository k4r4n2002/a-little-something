// migrate-to-cloudinary.js - Run this once to migrate images from MongoDB to Cloudinary
require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function migrateToCloudinary() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const users = await usersCollection.find({}).toArray();
    
    for (const user of users) {
      if (!user.tijoriImages || user.tijoriImages.length === 0) {
        console.log(`⏭️  User ${user.username} has no images to migrate`);
        continue;
      }

      console.log(`\n📸 Migrating ${user.tijoriImages.length} images for ${user.username}...`);
      
      const migratedImages = [];
      
      for (let i = 0; i < user.tijoriImages.length; i++) {
        const img = user.tijoriImages[i];
        
        try {
          // Upload to Cloudinary
          // Folder structure: a-little-something/karan or a-little-something/khushi
          const result = await cloudinary.uploader.upload(img.data, {
            folder: `a-little-something/${user.username}`,
            resource_type: 'image',
            public_id: `image_${Date.now()}_${i}` // Unique identifier
          });

          console.log(`  ✅ Uploaded image ${i + 1}/${user.tijoriImages.length}`);

          // Store the Cloudinary URL and metadata
          migratedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            uploadedBy: img.uploadedBy || user.username,
            uploadedAt: img.uploadedAt || new Date()
          });

        } catch (uploadErr) {
          console.error(`  ❌ Failed to upload image ${i + 1}:`, uploadErr.message);
          // Continue with other images even if one fails
        }
      }

      // Update user document with Cloudinary URLs and remove base64 data
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { tijoriImages: migratedImages } }
      );

      console.log(`✅ Successfully migrated ${migratedImages.length} images for ${user.username}`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('Your images are now stored in Cloudinary and MongoDB is lighter.');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrateToCloudinary();