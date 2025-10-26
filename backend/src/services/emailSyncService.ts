import axios from 'axios';
import User from '../models/User';
import Email from '../models/Email';
import { classifyEmail, linkEmailToApplication, autoUpdateApplicationStatus } from './emailClassifier';
import crypto from 'crypto';

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

interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: {
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body: { data?: string };
      parts?: Array<{ mimeType: string; body: { data?: string } }>;
    }>;
  };
}

interface OutlookMessage {
  id: string;
  subject: string;
  body: {
    content: string;
    contentType: string;
  };
  from: {
    emailAddress: {
      address: string;
      name: string;
    };
  };
  receivedDateTime: string;
  isRead: boolean;
}

export class EmailSyncService {
  /**
   * Sync emails for a specific user
   */
  static async syncUserEmails(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.emailConnected || !user.emailAccessToken) {
        throw new Error('User not found or email not connected');
      }

      const accessToken = decrypt(user.emailAccessToken);
      
      if (user.emailProvider === 'gmail') {
        await this.syncGmailEmails(user, accessToken);
      } else if (user.emailProvider === 'outlook') {
        await this.syncOutlookEmails(user, accessToken);
      }

      // Update last sync time
      user.lastEmailSync = new Date();
      await user.save();
    } catch (error) {
      console.error(`Email sync error for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Sync emails from Gmail
   */
  private static async syncGmailEmails(user: any, accessToken: string): Promise<void> {
    try {
      // Get recent messages
      const response = await axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=in:inbox`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const messageIds = response.data.messages?.map((msg: any) => msg.id) || [];

      for (const messageId of messageIds) {
        try {
          const messageResponse = await axios.get(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          const message = messageResponse.data as GmailMessage;
          await this.processGmailMessage(user, message);
        } catch (error) {
          console.error(`Error processing Gmail message ${messageId}:`, error);
        }
      }
    } catch (error) {
      console.error('Gmail sync error:', error);
      throw error;
    }
  }

  /**
   * Process a Gmail message
   */
  private static async processGmailMessage(user: any, message: GmailMessage): Promise<void> {
    try {
      const headers = message.payload.headers;
      const from = headers.find(h => h.name === 'From')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Extract body text
      let body = message.snippet || '';
      if (message.payload.body?.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
      } else if (message.payload.parts) {
        const textPart = message.payload.parts.find(part => 
          part.mimeType === 'text/plain' || part.mimeType === 'text/html'
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      // Check if email already exists
      const existingEmail = await Email.findOne({
        userId: user._id,
        from,
        subject,
        receivedAt: new Date(date)
      });

      if (existingEmail) {
        return; // Skip if already processed
      }

      // Classify email
      const classification = classifyEmail(subject, body);

      // Only process application-related emails
      if (classification.category === 'general' && classification.confidence < 0.3) {
        return; // Skip non-application emails
      }

      // Create email record
      const email = new Email({
        userId: user._id,
        from,
        to,
        subject,
        body,
        category: classification.category,
        receivedAt: new Date(date),
        metadata: classification.metadata
      });

      await email.save();

      // Try to link to application
      const applicationId = await linkEmailToApplication(user._id.toString(), email);
      if (applicationId) {
        email.applicationId = applicationId as any;
        await email.save();

        // Auto-update application status
        await autoUpdateApplicationStatus(applicationId, email.category, email.subject);
      }
    } catch (error) {
      console.error('Error processing Gmail message:', error);
    }
  }

  /**
   * Sync emails from Outlook
   */
  private static async syncOutlookEmails(user: any, accessToken: string): Promise<void> {
    try {
      const response = await axios.get(
        'https://graph.microsoft.com/v1.0/me/messages?$top=50&$orderby=receivedDateTime desc',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const messages = response.data.value as OutlookMessage[];

      for (const message of messages) {
        try {
          await this.processOutlookMessage(user, message);
        } catch (error) {
          console.error(`Error processing Outlook message ${message.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Outlook sync error:', error);
      throw error;
    }
  }

  /**
   * Process an Outlook message
   */
  private static async processOutlookMessage(user: any, message: OutlookMessage): Promise<void> {
    try {
      const from = message.from.emailAddress.address;
      const to = user.connectedEmail || '';
      const subject = message.subject;
      const body = message.body.content;
      const receivedAt = new Date(message.receivedDateTime);

      // Check if email already exists
      const existingEmail = await Email.findOne({
        userId: user._id,
        from,
        subject,
        receivedAt
      });

      if (existingEmail) {
        return; // Skip if already processed
      }

      // Classify email
      const classification = classifyEmail(subject, body);

      // Only process application-related emails
      if (classification.category === 'general' && classification.confidence < 0.3) {
        return; // Skip non-application emails
      }

      // Create email record
      const email = new Email({
        userId: user._id,
        from,
        to,
        subject,
        body,
        category: classification.category,
        receivedAt,
        metadata: classification.metadata
      });

      await email.save();

      // Try to link to application
      const applicationId = await linkEmailToApplication(user._id.toString(), email);
      if (applicationId) {
        email.applicationId = applicationId as any;
        await email.save();

        // Auto-update application status
        await autoUpdateApplicationStatus(applicationId, email.category, email.subject);
      }
    } catch (error) {
      console.error('Error processing Outlook message:', error);
    }
  }

  /**
   * Sync emails for all connected users
   */
  static async syncAllUsers(): Promise<void> {
    try {
      const users = await User.find({ 
        emailConnected: true,
        emailAccessToken: { $exists: true }
      });

      for (const user of users) {
        try {
          await this.syncUserEmails((user._id as any).toString());
        } catch (error) {
          console.error(`Failed to sync emails for user ${user._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Bulk email sync error:', error);
    }
  }

  /**
   * Refresh access token if needed
   */
  static async refreshTokenIfNeeded(user: any): Promise<string> {
    if (!user.emailTokenExpiry || new Date() < user.emailTokenExpiry) {
      return decrypt(user.emailAccessToken);
    }

    // Token is expired, need to refresh
    if (user.emailProvider === 'gmail') {
      return await this.refreshGmailToken(user);
    } else if (user.emailProvider === 'outlook') {
      return await this.refreshOutlookToken(user);
    }

    throw new Error('Unknown email provider');
  }

  private static async refreshGmailToken(user: any): Promise<string> {
    // Gmail tokens are long-lived, but we'll implement refresh logic here
    // For now, return the existing token
    return decrypt(user.emailAccessToken);
  }

  private static async refreshOutlookToken(user: any): Promise<string> {
    try {
      const refreshToken = decrypt(user.emailRefreshToken);
      
      const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        scope: 'https://graph.microsoft.com/mail.read'
      });

      const { access_token, expires_in } = response.data;
      
      // Update user with new token
      user.emailAccessToken = encrypt(access_token);
      user.emailTokenExpiry = new Date(Date.now() + expires_in * 1000);
      await user.save();

      return access_token;
    } catch (error) {
      console.error('Outlook token refresh error:', error);
      throw error;
    }
  }
}

export default EmailSyncService;
