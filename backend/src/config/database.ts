import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cv-express');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error}`);
    console.error('⚠️  Server will start but database operations will fail until MongoDB is running.');
    console.error('💡 To fix: Start MongoDB or configure MONGODB_URI environment variable.');
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

export default connectDB;

