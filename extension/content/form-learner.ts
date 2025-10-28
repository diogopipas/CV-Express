import { UserData } from '../utils/types';

/**
 * Form Learner - Captures manually entered data from forms
 * and syncs it to the backend to improve autofill accuracy
 */
export class FormLearner {
  private userData: UserData | null = null;
  private capturedData: Record<string, any> = {};
  private isLearning = false;

  constructor() {
    this.initializeLearner();
  }

  /**
   * Initialize the form learner
   */
  private async initializeLearner() {
    try {
      // Get user data from storage
      const { storage } = await import('../utils/storage');
      this.userData = await storage.getUserData();
      
      if (this.userData) {
        this.startLearning();
      }
    } catch (error) {
      console.error('Form learner initialization error:', error);
    }
  }

  /**
   * Start learning from form interactions
   */
  private startLearning() {
    if (this.isLearning) return;
    this.isLearning = true;

    // Listen for form submissions
    document.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Listen for input changes to capture data
    document.addEventListener('input', this.handleInputChange.bind(this));
    
    // Listen for focus events to track which fields are being filled manually
    document.addEventListener('focus', this.handleFieldFocus.bind(this), true);
    
    console.log('Form learner started');
  }

  /**
   * Handle form submission to capture learned data
   */
  private handleFormSubmit(event: Event) {
    const form = event.target as HTMLFormElement;
    if (!form || this.isApplicationForm(form)) {
      this.captureFormData(form);
    }
  }

  /**
   * Handle input changes to track manual data entry
   */
  private handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input || !this.isApplicationForm(input.closest('form'))) return;

    const fieldName = this.getFieldName(input);
    if (fieldName && input.value.trim()) {
      this.capturedData[fieldName] = input.value.trim();
    }
  }

  /**
   * Handle field focus to detect manual entry
   */
  private handleFieldFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    if (!input || !this.isApplicationForm(input.closest('form'))) return;

    // Mark field as manually filled
    input.setAttribute('data-manually-filled', 'true');
  }

  /**
   * Check if this is an application form
   */
  private isApplicationForm(form: HTMLFormElement | null): boolean {
    if (!form) return false;

    // Check for common application form indicators
    const applicationKeywords = [
      'application', 'apply', 'job', 'career', 'position', 'employment',
      'resume', 'cv', 'candidate', 'applicant', 'hire', 'recruit'
    ];

    const formText = (form.textContent || '').toLowerCase();
    const formAction = (form.action || '').toLowerCase();
    const formClass = (form.className || '').toLowerCase();

    return applicationKeywords.some(keyword => 
      formText.includes(keyword) || 
      formAction.includes(keyword) || 
      formClass.includes(keyword)
    );
  }

  /**
   * Get standardized field name
   */
  private getFieldName(input: HTMLInputElement): string | null {
    // Try different methods to get field name
    const name = input.name || input.id || input.getAttribute('data-name');
    if (name) {
      return this.normalizeFieldName(name);
    }

    // Try to infer from placeholder or label
    const placeholder = input.placeholder?.toLowerCase() || '';
    const label = this.getAssociatedLabel(input)?.toLowerCase() || '';

    return this.inferFieldName(placeholder, label);
  }

  /**
   * Get associated label for input
   */
  private getAssociatedLabel(input: HTMLInputElement): string | null {
    // Try label[for] association
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return label.textContent;
    }

    // Try parent label
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.textContent;

    // Try previous sibling text
    const prevSibling = input.previousElementSibling;
    if (prevSibling && prevSibling.textContent) {
      return prevSibling.textContent;
    }

    return null;
  }

  /**
   * Normalize field name
   */
  private normalizeFieldName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Infer field name from placeholder or label
   */
  private inferFieldName(placeholder: string, label: string): string | null {
    const text = `${placeholder} ${label}`.toLowerCase();

    // Common field mappings
    const fieldMappings: Record<string, string> = {
      'first name': 'firstName',
      'firstname': 'firstName',
      'last name': 'lastName',
      'lastname': 'lastName',
      'full name': 'fullName',
      'fullname': 'fullName',
      'email': 'email',
      'phone': 'phone',
      'telephone': 'phone',
      'mobile': 'phone',
      'address': 'address',
      'city': 'city',
      'state': 'state',
      'zip': 'zipCode',
      'postal': 'zipCode',
      'country': 'country',
      'linkedin': 'linkedinUrl',
      'linkedin url': 'linkedinUrl',
      'github': 'githubUrl',
      'github url': 'githubUrl',
      'portfolio': 'portfolioUrl',
      'portfolio url': 'portfolioUrl',
      'website': 'websiteUrl',
      'website url': 'websiteUrl',
      'work authorization': 'workAuthorization',
      'authorization': 'workAuthorization',
      'visa': 'workAuthorization',
      'citizenship': 'workAuthorization',
      'cover letter': 'coverLetter',
      'coverletter': 'coverLetter',
      'message': 'coverLetter',
      'additional': 'additionalInfo',
      'comments': 'additionalInfo',
      'notes': 'additionalInfo'
    };

    for (const [key, value] of Object.entries(fieldMappings)) {
      if (text.includes(key)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Capture form data when form is submitted
   */
  private async captureFormData(form: HTMLFormElement) {
    try {
      const formData = new FormData(form);
      const capturedFields: Record<string, any> = {};

      // Extract data from form fields
      for (const [name, value] of formData.entries()) {
        if (typeof value === 'string' && value.trim()) {
          const normalizedName = this.normalizeFieldName(name);
          capturedFields[normalizedName] = value.trim();
        }
      }

      // Also capture from inputs that might not be in FormData
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach((input: any) => {
        if (input.value && input.value.trim()) {
          const fieldName = this.getFieldName(input);
          if (fieldName) {
            capturedFields[fieldName] = input.value.trim();
          }
        }
      });

      // Filter out fields that are already in user data
      const newFields = this.filterNewFields(capturedFields);

      if (Object.keys(newFields).length > 0) {
        await this.syncLearnedData(newFields);
      }
    } catch (error) {
      console.error('Error capturing form data:', error);
    }
  }

  /**
   * Filter out fields that are already known
   */
  private filterNewFields(capturedFields: Record<string, any>): Record<string, any> {
    if (!this.userData) return capturedFields;

    const newFields: Record<string, any> = {};

    for (const [key, value] of Object.entries(capturedFields)) {
      // Check if this field is already known
      const isKnown = this.isFieldKnown(key, value);
      if (!isKnown) {
        newFields[key] = value;
      }
    }

    return newFields;
  }

  /**
   * Check if a field is already known in user data
   */
  private isFieldKnown(fieldName: string, value: string): boolean {
    if (!this.userData) return false;

    const userData = this.userData;
    const valueLower = value.toLowerCase();

    // Check common field mappings
    switch (fieldName) {
      case 'firstName':
        return userData.name?.toLowerCase().includes(valueLower) || false;
      case 'lastName':
        return userData.name?.toLowerCase().includes(valueLower) || false;
      case 'email':
        return userData.email?.toLowerCase() === valueLower || 
               userData.applicationEmail?.toLowerCase() === valueLower;
      case 'phone':
        return userData.applicationPreferences?.phone === value;
      case 'linkedinUrl':
        return userData.applicationPreferences?.linkedinUrl === value;
      case 'address':
        return userData.profile?.location?.toLowerCase().includes(valueLower) || false;
      case 'workAuthorization':
        return userData.jobPreferences?.workAuthorization === value;
      default:
        return false;
    }
  }

  /**
   * Sync learned data to backend
   */
  private async syncLearnedData(learnedData: Record<string, any>) {
    try {
      const { storage } = await import('../utils/storage');
      const token = await storage.getToken();
      
      if (!token) {
        console.log('No auth token, skipping data sync');
        return;
      }

      const response = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/auth/profile/learn`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ learnedData })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Learned data synced successfully:', result);
        
        // Update local user data
        await this.updateLocalUserData(learnedData);
      } else {
        console.error('Failed to sync learned data:', response.statusText);
      }
    } catch (error) {
      console.error('Error syncing learned data:', error);
    }
  }

  /**
   * Update local user data with learned fields
   */
  private async updateLocalUserData(learnedData: Record<string, any>) {
    try {
      const { storage } = await import('../utils/storage');
      const userData = await storage.getUserData();
      
      if (userData) {
        // Update user data with learned fields
        Object.entries(learnedData).forEach(([key, value]) => {
          switch (key) {
            case 'phone':
              if (!userData.applicationPreferences) userData.applicationPreferences = {};
              userData.applicationPreferences.phone = value;
              break;
            case 'linkedinUrl':
              if (!userData.applicationPreferences) userData.applicationPreferences = {};
              userData.applicationPreferences.linkedinUrl = value;
              break;
            case 'address':
              if (!userData.profile) userData.profile = {};
              userData.profile.location = value;
              break;
            case 'workAuthorization':
              if (!userData.jobPreferences) userData.jobPreferences = {};
              userData.jobPreferences.workAuthorization = value;
              break;
          }
        });

        await storage.saveUserData(userData);
        this.userData = userData;
      }
    } catch (error) {
      console.error('Error updating local user data:', error);
    }
  }

  /**
   * Stop learning
   */
  public stopLearning() {
    this.isLearning = false;
    document.removeEventListener('submit', this.handleFormSubmit.bind(this));
    document.removeEventListener('input', this.handleInputChange.bind(this));
    document.removeEventListener('focus', this.handleFieldFocus.bind(this), true);
    console.log('Form learner stopped');
  }
}

// Initialize form learner when content script loads
const formLearner = new FormLearner();
