import browser from 'webextension-polyfill';
import { StorageData, UserData, Resume } from './types';

/**
 * Storage utility for browser extension (Chrome & Safari compatible)
 * Handles secure storage of authentication tokens and user data
 */
class StorageManager {
  private static readonly STORAGE_KEYS = {
    TOKEN: 'cv_express_token',
    USER_DATA: 'cv_express_user_data',
    RESUME: 'cv_express_resume',
    LAST_SYNC: 'cv_express_last_sync',
  };

  /**
   * Save authentication token
   */
  async saveToken(token: string): Promise<void> {
    await browser.storage.local.set({
      [StorageManager.STORAGE_KEYS.TOKEN]: token,
    });
  }

  /**
   * Get authentication token
   */
  async getToken(): Promise<string | null> {
    const result = await browser.storage.local.get(StorageManager.STORAGE_KEYS.TOKEN);
    return result[StorageManager.STORAGE_KEYS.TOKEN] || null;
  }

  /**
   * Save user data
   */
  async saveUserData(userData: UserData): Promise<void> {
    await browser.storage.local.set({
      [StorageManager.STORAGE_KEYS.USER_DATA]: userData,
      [StorageManager.STORAGE_KEYS.LAST_SYNC]: Date.now(),
    });
  }

  /**
   * Get user data
   */
  async getUserData(): Promise<UserData | null> {
    const result = await browser.storage.local.get(StorageManager.STORAGE_KEYS.USER_DATA);
    return result[StorageManager.STORAGE_KEYS.USER_DATA] || null;
  }

  /**
   * Save resume data
   */
  async saveResume(resume: Resume): Promise<void> {
    await browser.storage.local.set({
      [StorageManager.STORAGE_KEYS.RESUME]: resume,
    });
  }

  /**
   * Get resume data
   */
  async getResume(): Promise<Resume | null> {
    const result = await browser.storage.local.get(StorageManager.STORAGE_KEYS.RESUME);
    return result[StorageManager.STORAGE_KEYS.RESUME] || null;
  }

  /**
   * Get all storage data
   */
  async getAllData(): Promise<StorageData> {
    const result = await browser.storage.local.get([
      StorageManager.STORAGE_KEYS.TOKEN,
      StorageManager.STORAGE_KEYS.USER_DATA,
      StorageManager.STORAGE_KEYS.RESUME,
      StorageManager.STORAGE_KEYS.LAST_SYNC,
    ]);

    return {
      token: result[StorageManager.STORAGE_KEYS.TOKEN],
      userData: result[StorageManager.STORAGE_KEYS.USER_DATA],
      latestResume: result[StorageManager.STORAGE_KEYS.RESUME],
      lastSync: result[StorageManager.STORAGE_KEYS.LAST_SYNC],
    };
  }

  /**
   * Clear all data (logout)
   */
  async clearAll(): Promise<void> {
    await browser.storage.local.clear();
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Check if data needs sync (older than 1 hour)
   */
  async needsSync(): Promise<boolean> {
    const result = await browser.storage.local.get(StorageManager.STORAGE_KEYS.LAST_SYNC);
    const lastSync = result[StorageManager.STORAGE_KEYS.LAST_SYNC];
    
    if (!lastSync) return true;
    
    const oneHour = 60 * 60 * 1000;
    return Date.now() - lastSync > oneHour;
  }
}

export const storage = new StorageManager();

