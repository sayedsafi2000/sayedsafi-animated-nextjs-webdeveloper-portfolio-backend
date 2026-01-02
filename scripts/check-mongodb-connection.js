import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sayed-safi-portfolio';

console.log('\n🔍 Checking MongoDB Connection...\n');
console.log('📋 Connection String:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@')); // Hide password

// Determine if it's local or online
if (MONGODB_URI.includes('mongodb.net') || MONGODB_URI.includes('mongodb+srv')) {
  console.log('🌐 Type: ONLINE (MongoDB Atlas)');
} else if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
  console.log('💻 Type: LOCAL (Running on your machine)');
} else {
  console.log('❓ Type: UNKNOWN (Could be remote server)');
}

// Try to connect and get connection details
try {
  await mongoose.connect(MONGODB_URI);

  const connection = mongoose.connection;
  
  console.log('\n✅ Connection Status: CONNECTED\n');
  console.log('📊 Connection Details:');
  console.log('   - Host:', connection.host);
  console.log('   - Port:', connection.port);
  console.log('   - Database:', connection.name);
  console.log('   - Ready State:', connection.readyState === 1 ? 'Connected' : 'Not Connected');
  
  // List all collections
  const collections = await connection.db.listCollections().toArray();
  console.log('\n📚 Collections in Database:');
  collections.forEach((collection, index) => {
    console.log(`   ${index + 1}. ${collection.name}`);
  });
  
  // Get collection counts
  console.log('\n📈 Collection Counts:');
  for (const collection of collections) {
    const count = await connection.db.collection(collection.name).countDocuments();
    console.log(`   - ${collection.name}: ${count} documents`);
  }
  
  await mongoose.connection.close();
  console.log('\n✅ Check completed successfully!\n');
  
} catch (error) {
  console.error('\n❌ Connection Error:', error.message);
  console.log('\n💡 Tips:');
  console.log('   - If using LOCAL: Make sure MongoDB is running on your machine');
  console.log('   - If using ONLINE: Check your MongoDB Atlas connection string');
  console.log('   - Verify your .env file has the correct MONGODB_URI\n');
  process.exit(1);
}

