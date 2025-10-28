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
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedData = textParts.join(':');
  const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
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
      console.log('Google OAuth callback - tokens received:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken,
        profileId: profile?.id 
      });
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
router.post('/connect', async (req: any, res: Response) => {
  try {
    const { provider } = req.body;
    
    if (!provider || !['gmail', 'outlook'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider. Must be gmail or outlook' });
    }

    // Create a temporary session to store OAuth state
    // We'll use a session ID to track the OAuth flow
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    // Store session ID for later retrieval
    if (!req.session) {
      req.session = {};
    }
    (req.session as any).oauthSessionId = sessionId;
    
    const baseUrl = process.env.API_URL || 'http://localhost:5001';
    res.json({ 
      success: true, 
      redirectUrl: provider === 'gmail' 
        ? `${baseUrl}/api/email-oauth/google/auth` 
        : `${baseUrl}/api/email-oauth/microsoft/auth`
    });
  } catch (error) {
    console.error('Email OAuth connect error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
});

// GET /api/email-oauth/google/auth - Google OAuth initiation
router.get('/google/auth', (req, res, next) => {
  // Check if Google OAuth is properly configured
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'test_google_client_id') {
    console.error('Google OAuth not configured properly');
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?error=oauth_not_configured`);
  }
  
  passport.authenticate('google-email', { 
    prompt: 'consent'
  })(req, res, next);
});

// GET /api/email-oauth/google/callback - Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google-email', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?error=email_oauth_failed` }),
  async (req: any, res: Response) => {
    try {
      const { profile, accessToken, refreshToken } = req.user;

      if (!profile) {
        console.error('No profile in OAuth callback');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?error=email_oauth_failed`);
      }

      // Validate tokens exist before encrypting
      if (!accessToken) {
        console.error('No access token received from Google OAuth');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?error=email_oauth_failed`);
      }

      // Store OAuth data in session for later use during registration
      if (req.session) {
        (req.session as any).oauthData = {
          connectedEmail: profile.emails?.[0]?.value || profile.email,
          emailProvider: 'gmail',
          accessToken: encrypt(accessToken || ''),
          refreshToken: refreshToken ? encrypt(refreshToken) : undefined,
          tokenExpiry: new Date(Date.now() + 3600 * 1000) // 1 hour
        };
      }

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?email_oauth=success&provider=gmail`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?error=email_oauth_failed`);
    }
  }
);

// GET /api/email-oauth/microsoft/auth - Microsoft OAuth initiation
router.get('/microsoft/auth', (req, res, next) => {
  // Check if Microsoft OAuth is properly configured
  if (!process.env.MICROSOFT_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID === 'test_microsoft_client_id') {
    console.error('Microsoft OAuth not configured properly');
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?error=oauth_not_configured`);
  }
  
  passport.authenticate('microsoft-email', {
    prompt: 'consent'
  })(req, res, next);
});

// GET /api/email-oauth/microsoft/callback - Microsoft OAuth callback
router.get('/microsoft/callback',
  passport.authenticate('microsoft-email', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?error=email_oauth_failed` }),
  async (req: any, res: Response) => {
    try {
      const { profile, accessToken, refreshToken } = req.user;

      if (!profile) {
        console.error('No profile in OAuth callback');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?error=email_oauth_failed`);
      }

      // Validate tokens exist before encrypting
      if (!accessToken) {
        console.error('No access token received from Microsoft OAuth');
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?error=email_oauth_failed`);
      }

      // Store OAuth data in session for later use during registration
      if (req.session) {
        (req.session as any).oauthData = {
          connectedEmail: profile.emails?.[0]?.value || profile.email,
          emailProvider: 'outlook',
          accessToken: encrypt(accessToken || ''),
          refreshToken: refreshToken ? encrypt(refreshToken) : undefined,
          tokenExpiry: new Date(Date.now() + 3600 * 1000) // 1 hour
        };
      }

      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?email_oauth=success&provider=outlook`);
    } catch (error) {
      console.error('Microsoft OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/onboarding?error=email_oauth_failed`);
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

// GET /api/email-oauth/diagnose - Diagnose email connection issues
router.get('/diagnose', protect, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const diagnosis = {
      emailConnected: user.emailConnected,
      emailProvider: user.emailProvider,
      connectedEmail: user.connectedEmail,
      hasAccessToken: !!user.emailAccessToken,
      hasRefreshToken: !!user.emailRefreshToken,
      tokenExpiry: user.emailTokenExpiry,
      lastEmailSync: user.lastEmailSync,
      issues: [] as string[]
    };

    // Check for common issues
    if (!user.emailConnected) {
      diagnosis.issues.push('Email account not connected');
    }

    if (!user.emailAccessToken) {
      diagnosis.issues.push('No access token found');
    }

    if (user.emailTokenExpiry && new Date() > user.emailTokenExpiry) {
      diagnosis.issues.push('Access token has expired');
    }

    if (!user.emailProvider || !['gmail', 'outlook'].includes(user.emailProvider)) {
      diagnosis.issues.push('Invalid or missing email provider');
    }

    // Check environment variables
    const envIssues = [];
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'test_google_client_id') {
      envIssues.push('Google OAuth credentials not configured');
    }
    if (!process.env.MICROSOFT_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID === 'test_microsoft_client_id') {
      envIssues.push('Microsoft OAuth credentials not configured');
    }
    if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY === 'your-32-character-secret-key-here!') {
      envIssues.push('Encryption key not configured');
    }

    if (envIssues.length > 0) {
      diagnosis.issues.push(...envIssues);
    }

    res.json({ success: true, diagnosis });
  } catch (error: any) {
    console.error('Email diagnosis error:', error);
    res.status(500).json({ error: 'Failed to diagnose email connection' });
  }
});

// POST /api/email-oauth/sync - Trigger manual sync
router.post('/sync', protect, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.emailConnected) {
      return res.status(400).json({ error: 'No email account connected. Please connect your email in the onboarding flow.' });
    }

    if (!user.emailAccessToken) {
      return res.status(400).json({ error: 'Email access token not found. Please reconnect your email account.' });
    }

    // Import and use the EmailSyncService
    const { EmailSyncService } = await import('../services/emailSyncService');
    const userId = (user._id as any).toString();
    await EmailSyncService.syncUserEmails(userId);
    
    res.json({ success: true, message: 'Emails synced successfully' });
  } catch (error: any) {
    console.error('Email sync error:', error);
    const errorMessage = error.message || 'Failed to sync emails';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
