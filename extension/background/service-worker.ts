import browser from 'webextension-polyfill';
import { auth } from '../utils/auth';
import { storage } from '../utils/storage';
import { apiClient } from './api-client';
import { ExtensionMessage, ExtensionResponse } from '../utils/types';

/**
 * Background service worker for CV-Express extension (Chrome & Safari compatible)
 * Handles API communication, authentication, and message passing
 */

console.log('CV-Express extension background service worker loaded');

// Listen for extension installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('CV-Express extension installed');
    // Open welcome page
    browser.tabs.create({
      url: 'http://localhost:3000', // CV-Express web app
    });
  } else if (details.reason === 'update') {
    console.log('CV-Express extension updated');
  }
});

// Listen for messages from content scripts and popup
browser.runtime.onMessage.addListener((
  message: ExtensionMessage,
  sender
) => {
  return handleMessage(message, sender)
    .catch((error) => {
      console.error('Error handling message:', error);
      return { success: false, error: error.message };
    });
});

/**
 * Handle messages from content scripts and popup
 */
async function handleMessage(
  message: ExtensionMessage,
  sender: browser.Runtime.MessageSender
): Promise<ExtensionResponse> {
  console.log('Received message:', message.type, message.payload);

  switch (message.type) {
    case 'AUTH_STATUS':
      return await handleAuthStatus();

    case 'GET_JOB_DATA':
      return await handleGetJobData(sender.tab?.id);

    case 'CREATE_APPLICATION':
      return await handleCreateApplication(message.payload);

    case 'DETECT_FORM':
      return await handleDetectForm(sender.tab?.id);

    default:
      return { success: false, error: 'Unknown message type' };
  }
}

/**
 * Get authentication status
 */
async function handleAuthStatus(): Promise<ExtensionResponse> {
  try {
    const authStatus = await auth.getAuthStatus();
    
    // If authenticated and data needs sync, refresh it
    if (authStatus.authenticated && await storage.needsSync()) {
      await auth.refreshUserData();
      await apiClient.fetchLatestResume();
    }

    const data = await storage.getAllData();
    
    return {
      success: true,
      data: {
        authenticated: authStatus.authenticated,
        userData: data.userData,
        resume: data.latestResume,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get job data from current page
 */
async function handleGetJobData(tabId?: number): Promise<ExtensionResponse> {
  if (!tabId) {
    return { success: false, error: 'No tab ID' };
  }

  try {
    // Send message to content script to extract job data
    const response = await browser.tabs.sendMessage(tabId, {
      type: 'EXTRACT_JOB_DATA',
    });

    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Create application in CV-Express
 */
async function handleCreateApplication(payload: any): Promise<ExtensionResponse> {
  try {
    const { jobData, coverLetter } = payload;
    
    // Create application via API
    const result = await apiClient.createApplication({
      jobData,
      coverLetter,
      submissionMethod: 'cv_express_extension',
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Detect form on current page
 */
async function handleDetectForm(tabId?: number): Promise<ExtensionResponse> {
  if (!tabId) {
    return { success: false, error: 'No tab ID' };
  }

  try {
    // Send message to content script to detect form
    const response = await browser.tabs.sendMessage(tabId, {
      type: 'DETECT_APPLICATION_FORM',
    });

    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update badge when authentication status changes
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.cv_express_token) {
    updateBadge();
  }
});

/**
 * Update extension badge based on authentication status
 */
async function updateBadge() {
  const authenticated = await auth.isAuthenticated();
  
  if (authenticated) {
    browser.action.setBadgeText({ text: '✓' });
    browser.action.setBadgeBackgroundColor({ color: '#10b981' });
  } else {
    browser.action.setBadgeText({ text: '' });
  }
}

// Initialize badge on startup
updateBadge();

// Context menu for quick actions
// Note: Safari has limited contextMenus support, wrapped in try-catch for safety
try {
  browser.contextMenus.create({
    id: 'cv-express-apply',
    title: 'Apply with CV-Express',
    contexts: ['page', 'link'],
    documentUrlPatterns: [
      'https://*.greenhouse.io/*',
      'https://*.myworkdayjobs.com/*',
      'https://*.lever.co/*',
      'https://*.icims.com/*',
      'https://*.jobvite.com/*',
    ],
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'cv-express-apply' && tab?.id) {
      // Send message to content script to trigger auto-fill
      browser.tabs.sendMessage(tab.id, {
        type: 'TRIGGER_AUTO_FILL',
      });
    }
  });
} catch (error) {
  console.warn('Context menus not fully supported in this browser:', error);
}

