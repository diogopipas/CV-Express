import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/database';
import jobRoutes from './routes/jobRoutes';
import resumeRoutes from './routes/resumeRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', jobRoutes);
app.use('/api/resumes', resumeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CV-Express API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

