import cron from 'node-cron';
import EmailSyncService from './emailSyncService';
import User from '../models/User';

/**
 * Cron service for periodic email synchronization
 */
export class CronService {
  private static isRunning = false;

  /**
   * Start all cron jobs
   */
  static start() {
    if (this.isRunning) {
      console.log('Cron service already running');
      return;
    }

    console.log('Starting cron service...');

    // Email sync job - runs every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      console.log('Running email sync job...');
      try {
        await EmailSyncService.syncAllUsers();
        console.log('Email sync job completed');
      } catch (error) {
        console.error('Email sync job failed:', error);
      }
    }, {
      timezone: 'UTC'
    });

    // Token refresh job - runs every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running token refresh job...');
      try {
        await this.refreshExpiredTokens();
        console.log('Token refresh job completed');
      } catch (error) {
        console.error('Token refresh job failed:', error);
      }
    }, {
      timezone: 'UTC'
    });

    // Cleanup job - runs daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running cleanup job...');
      try {
        await this.cleanupOldData();
        console.log('Cleanup job completed');
      } catch (error) {
        console.error('Cleanup job failed:', error);
      }
    }, {
      timezone: 'UTC'
    });

    this.isRunning = true;
    console.log('Cron service started successfully');
  }

  /**
   * Stop all cron jobs
   */
  static stop() {
    if (!this.isRunning) {
      console.log('Cron service not running');
      return;
    }

    cron.getTasks().forEach(task => task.destroy());
    this.isRunning = false;
    console.log('Cron service stopped');
  }

  /**
   * Refresh expired OAuth tokens
   */
  private static async refreshExpiredTokens() {
    try {
      const users = await User.find({
        emailConnected: true,
        emailTokenExpiry: { $lt: new Date() },
        emailRefreshToken: { $exists: true }
      });

      for (const user of users) {
        try {
          console.log(`Refreshing token for user ${user._id}`);
          await EmailSyncService.refreshTokenIfNeeded(user);
        } catch (error) {
          console.error(`Failed to refresh token for user ${user._id}:`, error);
          
          // If refresh fails, mark email as disconnected
          user.emailConnected = false;
          user.emailAccessToken = undefined;
          user.emailRefreshToken = undefined;
          user.emailTokenExpiry = undefined;
          await user.save();
        }
      }
    } catch (error) {
      console.error('Error in token refresh job:', error);
    }
  }

  /**
   * Cleanup old data
   */
  private static async cleanupOldData() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Clean up old email records (keep last 30 days)
      const { default: Email } = await import('../models/Email');
      const deletedEmails = await Email.deleteMany({
        receivedAt: { $lt: thirtyDaysAgo }
      });

      console.log(`Cleaned up ${deletedEmails.deletedCount} old email records`);

      // Clean up users who haven't been active for 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const inactiveUsers = await User.find({
        lastLogin: { $lt: ninetyDaysAgo },
        emailConnected: false
      });

      // Note: In a real application, you might want to send warning emails
      // before deleting user accounts
      console.log(`Found ${inactiveUsers.length} inactive users`);
    } catch (error) {
      console.error('Error in cleanup job:', error);
    }
  }

  /**
   * Get cron service status
   */
  static getStatus() {
    return {
      isRunning: this.isRunning,
      jobs: [
        {
          name: 'Email Sync',
          schedule: '*/15 * * * *',
          description: 'Sync emails every 15 minutes'
        },
        {
          name: 'Token Refresh',
          schedule: '0 * * * *',
          description: 'Refresh OAuth tokens every hour'
        },
        {
          name: 'Cleanup',
          schedule: '0 2 * * *',
          description: 'Cleanup old data daily at 2 AM'
        }
      ]
    };
  }

  /**
   * Manually trigger email sync for all users
   */
  static async triggerEmailSync() {
    try {
      console.log('Manually triggering email sync...');
      await EmailSyncService.syncAllUsers();
      console.log('Manual email sync completed');
      return { success: true, message: 'Email sync completed' };
    } catch (error) {
      console.error('Manual email sync failed:', error);
      return { success: false, message: 'Email sync failed', error: (error as Error).message };
    }
  }

  /**
   * Manually trigger email sync for specific user
   */
  static async triggerUserEmailSync(userId: string) {
    try {
      console.log(`Manually triggering email sync for user ${userId}...`);
      await EmailSyncService.syncUserEmails(userId);
      console.log(`Manual email sync for user ${userId} completed`);
      return { success: true, message: 'User email sync completed' };
    } catch (error) {
      console.error(`Manual email sync for user ${userId} failed:`, error);
      return { success: false, message: 'User email sync failed', error: (error as Error).message };
    }
  }
}

export default CronService;
