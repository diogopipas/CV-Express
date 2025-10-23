// Suppress punycode deprecation warning - using userland alternative
require('../suppress-punycode-warning');

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/database';
import jobRoutes from './routes/jobRoutes';
import resumeRoutes from './routes/resumeRoutes';
import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import extensionRoutes from './routes/extensionRoutes';
import emailRoutes from './routes/emailRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Middleware
// Configure CORS to allow frontend requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api', applicationRoutes);
app.use('/api', extensionRoutes);
app.use('/api/emails', emailRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CV-Express API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

