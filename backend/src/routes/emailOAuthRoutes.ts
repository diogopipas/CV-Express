import express, { Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = express.Router();

// Encryption/Decryption utilities
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here!';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedData = textParts.join(':');
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use('google-email', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/api/email-oauth/google/callback`,
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly']
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      return done(null, { profile, accessToken, refreshToken, provider: 'gmail' });
    } catch (error) {
      return done(error);
    }
  }));
}

// Configure Microsoft OAuth Strategy
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use('microsoft-email', new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/api/email-oauth/microsoft/callback`,
    scope: ['user.read', 'mail.read']
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      return done(null, { profile, accessToken, refreshToken, provider: 'outlook' });
    } catch (error) {
      return done(error);
    }
  }));
}

// POST /api/email-oauth/connect - Initiate OAuth flow
router.post('/connect', protect, async (req: any, res: Response) => {
  try {
    const { provider } = req.body;
    
    if (!provider || !['gmail', 'outlook'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider. Must be gmail or outlook' });
    }

    // Store user ID in session for callback
    (req.session as any).userId = req.user?._id;
    
    if (provider === 'gmail') {
      return res.redirect('/api/email-oauth/google/auth');
    } else if (provider === 'outlook') {
      return res.redirect('/api/email-oauth/microsoft/auth');
    }
  } catch (error) {
    console.error('Email OAuth connect error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
});

// GET /api/email-oauth/google/auth - Google OAuth initiation
router.get('/google/auth', protect, (req, res, next) => {
  passport.authenticate('google-email', { 
    prompt: 'consent'
  })(req, res, next);
});

// GET /api/email-oauth/google/callback - Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google-email', { failureRedirect: '/onboarding?error=email_oauth_failed' }),
  async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { profile, accessToken, refreshToken } = req.user;

      if (!userId || !profile) {
        return res.redirect('/onboarding?error=email_oauth_failed');
      }

      // Update user with email OAuth data
      const user = await User.findById(userId);
      if (user) {
        user.connectedEmail = profile.emails?.[0]?.value || profile.email;
        user.emailProvider = 'gmail';
        user.emailAccessToken = encrypt(accessToken);
        user.emailRefreshToken = encrypt(refreshToken);
        user.emailTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour
        user.emailConnected = true;
        user.lastEmailSync = new Date();

        await user.save();
      }

      res.redirect('/onboarding?email_oauth=success');
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/onboarding?error=email_oauth_failed');
    }
  }
);

// GET /api/email-oauth/microsoft/auth - Microsoft OAuth initiation
router.get('/microsoft/auth', protect, (req, res, next) => {
  passport.authenticate('microsoft-email', {
    prompt: 'consent'
  })(req, res, next);
});

// GET /api/email-oauth/microsoft/callback - Microsoft OAuth callback
router.get('/microsoft/callback',
  passport.authenticate('microsoft-email', { failureRedirect: '/onboarding?error=email_oauth_failed' }),
  async (req: any, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { profile, accessToken, refreshToken } = req.user;

      if (!userId || !profile) {
        return res.redirect('/onboarding?error=email_oauth_failed');
      }

      // Update user with email OAuth data
      const user = await User.findById(userId);
      if (user) {
        user.connectedEmail = profile.emails?.[0]?.value || profile.email;
        user.emailProvider = 'outlook';
        user.emailAccessToken = encrypt(accessToken);
        user.emailRefreshToken = encrypt(refreshToken);
        user.emailTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour
        user.emailConnected = true;
        user.lastEmailSync = new Date();

        await user.save();
      }

      res.redirect('/onboarding?email_oauth=success');
    } catch (error) {
      console.error('Microsoft OAuth callback error:', error);
      res.redirect('/onboarding?error=email_oauth_failed');
    }
  }
);

// POST /api/email-oauth/disconnect - Disconnect email
router.post('/disconnect', protect, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (user) {
      user.connectedEmail = undefined;
      user.emailProvider = undefined;
      user.emailAccessToken = undefined;
      user.emailRefreshToken = undefined;
      user.emailTokenExpiry = undefined;
      user.emailConnected = false;
      user.lastEmailSync = undefined;
      
      await user.save();
    }
    
    res.json({ success: true, message: 'Email disconnected successfully' });
  } catch (error) {
    console.error('Email disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect email' });
  }
});

// GET /api/email-oauth/status - Get connection status
router.get('/status', protect, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        emailConnected: user.emailConnected,
        connectedEmail: user.connectedEmail,
        emailProvider: user.emailProvider,
        lastEmailSync: user.lastEmailSync
      }
    });
  } catch (error) {
    console.error('Get email status error:', error);
    res.status(500).json({ error: 'Failed to get email status' });
  }
});

// POST /api/email-oauth/sync - Trigger manual sync
router.post('/sync', protect, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user || !user.emailConnected) {
      return res.status(400).json({ error: 'No email connected' });
    }

    // TODO: Trigger email sync service
    // This will be implemented when we create the email sync service
    
    res.json({ success: true, message: 'Email sync triggered' });
  } catch (error) {
    console.error('Email sync error:', error);
    res.status(500).json({ error: 'Failed to sync emails' });
  }
});

export default router;
