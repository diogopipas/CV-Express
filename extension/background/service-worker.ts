import { auth } from '../utils/auth';
import { storage } from '../utils/storage';
import { apiClient } from './api-client';
import { ExtensionMessage, ExtensionResponse } from '../utils/types';

/**
 * Background service worker for CV-Express extension
 * Handles API communication, authentication, and message passing
 */

console.log('CV-Express extension background service worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('CV-Express extension installed');
    // Open welcome page
    chrome.tabs.create({
      url: 'http://localhost:3000', // CV-Express web app
    });
  } else if (details.reason === 'update') {
    console.log('CV-Express extension updated');
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  sender,
  sendResponse: (response: ExtensionResponse) => void
) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    });
  
  // Return true to indicate we'll send a response asynchronously
  return true;
});

/**
 * Handle messages from content scripts and popup
 */
async function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender
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
    const response = await chrome.tabs.sendMessage(tabId, {
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
    const response = await chrome.tabs.sendMessage(tabId, {
      type: 'DETECT_APPLICATION_FORM',
    });

    return { success: true, data: response };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update badge when authentication status changes
chrome.storage.onChanged.addListener((changes, areaName) => {
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
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Initialize badge on startup
updateBadge();

// Context menu for quick actions
// Check if contextMenus API is available before using it
if (chrome.contextMenus) {
  chrome.contextMenus.create({
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

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'cv-express-apply' && tab?.id) {
      // Send message to content script to trigger auto-fill
      chrome.tabs.sendMessage(tab.id, {
        type: 'TRIGGER_AUTO_FILL',
      });
    }
  });
}

