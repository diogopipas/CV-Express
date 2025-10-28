// Suppress punycode deprecation warning - using userland alternative
require('../suppress-punycode-warning');

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import passport from 'passport';
import connectDB from './config/database';
import jobRoutes from './routes/jobRoutes';
import resumeRoutes from './routes/resumeRoutes';
import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import extensionRoutes from './routes/extensionRoutes';
import emailRoutes from './routes/emailRoutes';
import emailOAuthRoutes from './routes/emailOAuthRoutes';
import CronService from './services/cronService';

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
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email-oauth', emailOAuthRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api', applicationRoutes);
app.use('/api', extensionRoutes);
app.use('/api', jobRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CV-Express API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start cron service for email synchronization
  CronService.start();
  console.log('📧 Email sync cron jobs started');
});

