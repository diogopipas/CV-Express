import { FormDetector } from './form-detector';
import { FormFiller } from './form-filler';
import { JobData, ExtensionMessage, ExtensionResponse } from '../utils/types';

/**
 * Content script for CV-Express extension
 * Runs on job application pages to detect and fill forms
 */

console.log('CV-Express content script loaded');

let floatingButton: HTMLElement | null = null;
let isFormDetected = false;

// Initialize
init();

function init() {
  // Detect if we're on an application form
  detectApplicationForm();
  
  // Listen for messages from background script and popup
  chrome.runtime.onMessage.addListener(handleMessage);
  
  // Observe DOM changes (for SPAs)
  observeDOMChanges();
}

/**
 * Detect if current page is an application form
 */
async function detectApplicationForm() {
  const detector = new FormDetector();
  const formSchema = detector.detectForm();
  
  if (formSchema) {
    isFormDetected = true;
    console.log('Application form detected:', formSchema.atsType.name);
    showFloatingButton();
    
    // Notify background script
    chrome.runtime.sendMessage({
      type: 'FORM_DETECTED',
      payload: { atsType: formSchema.atsType.name },
    });
  }
}

/**
 * Show floating action button
 */
function showFloatingButton() {
  if (floatingButton) return;
  
  floatingButton = document.createElement('div');
  floatingButton.id = 'cv-express-floating-button';
  floatingButton.innerHTML = `
    <div class="cv-express-fab">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2V8H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 13H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 17H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 9H9H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Auto-Fill with CV-Express</span>
    </div>
  `;
  
  floatingButton.addEventListener('click', handleAutoFillClick);
  document.body.appendChild(floatingButton);
}

/**
 * Handle auto-fill button click
 */
async function handleAutoFillClick() {
  try {
    // Show loading state
    const button = floatingButton?.querySelector('.cv-express-fab');
    if (button) {
      button.classList.add('loading');
      button.innerHTML = '<span>Filling form...</span>';
    }
    
    // Check authentication
    const authResponse = await chrome.runtime.sendMessage({
      type: 'AUTH_STATUS',
    });
    
    if (!authResponse.success || !authResponse.data.authenticated) {
      showNotification('Please login to CV-Express first', 'error');
      resetButton();
      return;
    }
    
    // Fill form
    const filler = new FormFiller(
      authResponse.data.userData,
      authResponse.data.resume
    );
    
    const result = await filler.fillForm();
    
    if (result.success) {
      showNotification(
        `Successfully filled ${result.fieldsFilled} of ${result.totalFields} fields!`,
        'success'
      );
      
      // Track usage
      chrome.runtime.sendMessage({
        type: 'TRACK_USAGE',
        payload: {
          eventType: 'form_filled',
          fieldsFilled: result.fieldsFilled,
          totalFields: result.totalFields,
        },
      });
    } else {
      showNotification(
        `Filled ${result.fieldsFilled} fields. ${result.errors.length} errors occurred.`,
        'warning'
      );
    }
    
    resetButton();
  } catch (error: any) {
    console.error('Auto-fill error:', error);
    showNotification('Failed to fill form: ' + error.message, 'error');
    resetButton();
  }
}

/**
 * Reset floating button to default state
 */
function resetButton() {
  const button = floatingButton?.querySelector('.cv-express-fab');
  if (button) {
    button.classList.remove('loading');
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2V8H20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 13H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 17H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 9H9H8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Auto-Fill with CV-Express</span>
    `;
  }
}

/**
 * Show notification to user
 */
function showNotification(message: string, type: 'success' | 'error' | 'warning') {
  const notification = document.createElement('div');
  notification.className = `cv-express-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/**
 * Extract job data from current page
 */
function extractJobData(): JobData | null {
  try {
    // Try to extract job information from the page
    // This is heuristic-based and may need refinement
    
    const title = 
      document.querySelector('[class*="job-title"]')?.textContent?.trim() ||
      document.querySelector('h1')?.textContent?.trim() ||
      '';
    
    const company = 
      document.querySelector('[class*="company"]')?.textContent?.trim() ||
      document.querySelector('[class*="employer"]')?.textContent?.trim() ||
      '';
    
    const location = 
      document.querySelector('[class*="location"]')?.textContent?.trim() ||
      document.querySelector('[class*="address"]')?.textContent?.trim() ||
      '';
    
    const description = 
      document.querySelector('[class*="description"]')?.textContent?.trim() ||
      document.querySelector('[class*="job-details"]')?.textContent?.trim() ||
      '';
    
    if (title && company) {
      return {
        title,
        company,
        location,
        description,
        url: window.location.href,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting job data:', error);
    return null;
  }
}

/**
 * Handle messages from background script
 */
function handleMessage(
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: ExtensionResponse) => void
) {
  console.log('Content script received message:', message.type);
  
  switch (message.type) {
    case 'EXTRACT_JOB_DATA':
      const jobData = extractJobData();
      sendResponse({ success: !!jobData, data: jobData });
      break;
      
    case 'DETECT_APPLICATION_FORM':
      const detector = new FormDetector();
      const formSchema = detector.detectForm();
      sendResponse({ 
        success: !!formSchema, 
        data: formSchema 
      });
      break;
      
    case 'TRIGGER_AUTO_FILL':
      handleAutoFillClick();
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  
  return true; // Keep channel open for async response
}

/**
 * Observe DOM changes for single-page applications
 */
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    // Debounce form detection
    if (!isFormDetected) {
      detectApplicationForm();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (floatingButton) {
    floatingButton.remove();
  }
});

