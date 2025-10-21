import { storage } from './storage';

/**
 * Authentication utility for CV-Express extension
 */
class AuthManager {
  private readonly API_BASE_URL = 'http://localhost:5001/api';

  /**
   * Login with CV-Express credentials
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      // Save token and user data
      await storage.saveToken(data.token);
      await storage.saveUserData({
        id: data._id,
        name: data.name,
        email: data.email,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await storage.clearAll();
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await storage.isAuthenticated();
  }

  /**
   * Get current authentication status
   */
  async getAuthStatus(): Promise<{
    authenticated: boolean;
    userData: any;
  }> {
    const authenticated = await this.isAuthenticated();
    const userData = authenticated ? await storage.getUserData() : null;

    return {
      authenticated,
      userData,
    };
  }

  /**
   * Refresh user data from API
   */
  async refreshUserData(): Promise<void> {
    const token = await storage.getToken();
    if (!token) return;

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token might be invalid
        await this.logout();
        return;
      }

      const data = await response.json();
      await storage.saveUserData({
        id: data._id,
        name: data.name,
        email: data.email,
        phone: data.applicationPreferences?.phone,
        linkedinUrl: data.applicationPreferences?.linkedinUrl,
        applicationPreferences: data.applicationPreferences,
      });
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }

  /**
   * Get authorization header
   */
  async getAuthHeader(): Promise<Record<string, string>> {
    const token = await storage.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
}

export const auth = new AuthManager();

