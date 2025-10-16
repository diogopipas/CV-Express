import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import jobRoutes from './routes/jobRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', jobRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CV-Express API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

