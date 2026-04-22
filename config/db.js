const mongoose = require('mongoose');
console.log('MONGO_URI:', process.env.MONGO_URI);
const isPlaceholder = (uri) =>
  !uri ||
  uri.includes('YOUR_USERNAME') ||
  uri.includes('YOUR_PASSWORD') ||
  uri.includes('XXXXX') ||
  uri === 'your_mongodb_atlas_connection_string';

const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  if (isPlaceholder(uri)) {
    console.warn('⚠️  No valid MONGO_URI found. Starting with in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log('✅ In-memory MongoDB started');
  }

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
