import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken((user._id as any).toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken((user._id as any).toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get complete user profile with all fields
// @access  Private
router.get('/profile', protect, async (req: Request, res: Response) => {
  try {
    const authUser = (req as AuthRequest).user;
    if (!authUser) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(authUser._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      applicationEmail: user.applicationEmail,
      applicationPreferences: user.applicationPreferences,
      profile: user.profile,
      jobPreferences: user.jobPreferences,
      linkedinProfile: user.linkedinProfile,
      linkedinConnected: user.linkedinConnected,
      notificationPreferences: user.notificationPreferences,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   PATCH /api/auth/profile
// @desc    Update user profile
// @access  Private
router.patch('/profile', protect, async (req: Request, res: Response) => {
  try {
    const authUser = (req as AuthRequest).user;
    if (!authUser) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const user = await User.findById(authUser._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    const {
      name,
      applicationPreferences,
      profile,
      jobPreferences,
      notificationPreferences,
      onboardingCompleted
    } = req.body;

    if (name !== undefined) user.name = name;
    if (applicationPreferences !== undefined) {
      user.applicationPreferences = { ...user.applicationPreferences, ...applicationPreferences };
    }
    if (profile !== undefined) {
      user.profile = { ...user.profile, ...profile };
    }
    if (jobPreferences !== undefined) {
      user.jobPreferences = { ...user.jobPreferences, ...jobPreferences };
    }
    if (notificationPreferences !== undefined) {
      user.notificationPreferences = { ...user.notificationPreferences, ...notificationPreferences };
    }
    if (onboardingCompleted !== undefined) user.onboardingCompleted = onboardingCompleted;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      applicationEmail: user.applicationEmail,
      applicationPreferences: user.applicationPreferences,
      profile: user.profile,
      jobPreferences: user.jobPreferences,
      linkedinProfile: user.linkedinProfile,
      linkedinConnected: user.linkedinConnected,
      notificationPreferences: user.notificationPreferences,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;

