import { FormSchema, ATSType, FormField } from '../utils/types';

/**
 * Form Detector - Identifies ATS systems and form fields
 */
export class FormDetector {
  /**
   * Detect form on current page
   */
  detectForm(): FormSchema | null {
    const atsType = this.detectATSType();
    
    if (!atsType) {
      return null;
    }
    
    const fields = this.detectFormFields();
    const submitButton = this.findSubmitButton();
    const { isMultiStep, currentStep, totalSteps } = this.detectMultiStep();
    
    return {
      atsType,
      fields,
      submitButton: submitButton || undefined,
      isMultiStep,
      currentStep,
      totalSteps,
    };
  }
  
  /**
   * Detect which ATS system is being used
   */
  private detectATSType(): ATSType | null {
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    // Workday
    if (hostname.includes('myworkdayjobs.com') || url.includes('workday')) {
      return { name: 'workday', confidence: 0.95 };
    }
    
    // Greenhouse
    if (hostname.includes('greenhouse.io') || url.includes('boards.greenhouse')) {
      return { name: 'greenhouse', confidence: 0.95 };
    }
    
    // Lever
    if (hostname.includes('lever.co') || url.includes('jobs.lever')) {
      return { name: 'lever', confidence: 0.95 };
    }
    
    // iCIMS
    if (hostname.includes('icims.com') || document.querySelector('[class*="icims"]')) {
      return { name: 'icims', confidence: 0.90 };
    }
    
    // Jobvite
    if (hostname.includes('jobvite.com') || document.querySelector('[class*="jobvite"]')) {
      return { name: 'jobvite', confidence: 0.90 };
    }
    
    // Generic detection - look for application forms
    const forms = document.querySelectorAll('form');
    for (const form of Array.from(forms)) {
      const inputs = form.querySelectorAll('input, textarea, select');
      if (inputs.length >= 3) {
        // Check if it looks like an application form
        const hasNameField = Array.from(inputs).some(input => 
          this.isFieldType(input as HTMLElement, 'name')
        );
        const hasEmailField = Array.from(inputs).some(input => 
          this.isFieldType(input as HTMLElement, 'email')
        );
        
        if (hasNameField && hasEmailField) {
          return { name: 'generic', confidence: 0.70 };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Detect all form fields on the page
   */
  private detectFormFields(): FormField[] {
    const fields: FormField[] = [];
    const inputs = document.querySelectorAll('input, textarea, select');
    
    for (const element of Array.from(inputs)) {
      const field = this.analyzeField(element as HTMLElement);
      if (field) {
        fields.push(field);
      }
    }
    
    return fields;
  }
  
  /**
   * Analyze a single form field
   */
  private analyzeField(element: HTMLElement): FormField | null {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'input') {
      const input = element as HTMLInputElement;
      const type = input.type || 'text';
      
      // Skip hidden, submit, and button inputs
      if (['hidden', 'submit', 'button', 'image'].includes(type)) {
        return null;
      }
      
      const name = this.inferFieldName(element);
      const label = this.findLabel(element);
      const required = input.required || input.hasAttribute('aria-required');
      
      return {
        name,
        type: this.normalizeFieldType(type),
        element,
        required,
        label,
      };
    }
    
    if (tagName === 'textarea') {
      const name = this.inferFieldName(element);
      const label = this.findLabel(element);
      const required = element.hasAttribute('required') || element.hasAttribute('aria-required');
      
      return {
        name,
        type: 'textarea',
        element,
        required,
        label,
      };
    }
    
    if (tagName === 'select') {
      const name = this.inferFieldName(element);
      const label = this.findLabel(element);
      const required = element.hasAttribute('required') || element.hasAttribute('aria-required');
      
      return {
        name,
        type: 'select',
        element,
        required,
        label,
      };
    }
    
    return null;
  }
  
  /**
   * Infer field name from element attributes and context
   */
  private inferFieldName(element: HTMLElement): string {
    const input = element as HTMLInputElement;
    
    // Check common name patterns
    const name = input.name?.toLowerCase() || '';
    const id = input.id?.toLowerCase() || '';
    const placeholder = input.placeholder?.toLowerCase() || '';
    const ariaLabel = input.getAttribute('aria-label')?.toLowerCase() || '';
    const label = this.findLabel(element)?.toLowerCase() || '';
    
    const allText = `${name} ${id} ${placeholder} ${ariaLabel} ${label}`;
    
    // First name
    if (this.matchesPattern(allText, ['first', 'fname', 'given'])) {
      return 'firstName';
    }
    
    // Last name
    if (this.matchesPattern(allText, ['last', 'lname', 'family', 'surname'])) {
      return 'lastName';
    }
    
    // Full name
    if (this.matchesPattern(allText, ['name', 'full name', 'fullname']) && 
        !this.matchesPattern(allText, ['first', 'last', 'company'])) {
      return 'fullName';
    }
    
    // Email
    if (this.matchesPattern(allText, ['email', 'e-mail'])) {
      return 'email';
    }
    
    // Phone
    if (this.matchesPattern(allText, ['phone', 'mobile', 'telephone', 'tel'])) {
      return 'phone';
    }
    
    // Address
    if (this.matchesPattern(allText, ['address', 'street'])) {
      return 'address';
    }
    
    // City
    if (this.matchesPattern(allText, ['city'])) {
      return 'city';
    }
    
    // State
    if (this.matchesPattern(allText, ['state', 'province', 'region'])) {
      return 'state';
    }
    
    // Zip code
    if (this.matchesPattern(allText, ['zip', 'postal', 'postcode'])) {
      return 'zipCode';
    }
    
    // LinkedIn
    if (this.matchesPattern(allText, ['linkedin', 'linked-in'])) {
      return 'linkedin';
    }
    
    // Resume/CV file
    if (this.matchesPattern(allText, ['resume', 'cv', 'curriculum'])) {
      return 'resume';
    }
    
    // Cover letter
    if (this.matchesPattern(allText, ['cover', 'letter', 'motivation'])) {
      return 'coverLetter';
    }
    
    // Return the original name or id as fallback
    return name || id || 'unknown';
  }
  
  /**
   * Check if field type matches a category
   */
  private isFieldType(element: HTMLElement, type: string): boolean {
    const fieldName = this.inferFieldName(element);
    
    if (type === 'name') {
      return ['firstName', 'lastName', 'fullName'].includes(fieldName);
    }
    
    if (type === 'email') {
      return fieldName === 'email';
    }
    
    return false;
  }
  
  /**
   * Find label for an input element
   */
  private findLabel(element: HTMLElement): string | undefined {
    // Check for associated label element
    const input = element as HTMLInputElement;
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) {
        return label.textContent?.trim();
      }
    }
    
    // Check for parent label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.textContent?.trim();
    }
    
    // Check for aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return ariaLabel.trim();
    }
    
    // Check for placeholder
    const placeholder = (element as HTMLInputElement).placeholder;
    if (placeholder) {
      return placeholder.trim();
    }
    
    return undefined;
  }
  
  /**
   * Find submit button
   */
  private findSubmitButton(): HTMLElement | null {
    // Look for submit buttons
    const submitButtons = document.querySelectorAll(
      'button[type="submit"], input[type="submit"], button:not([type])'
    );
    
    for (const button of Array.from(submitButtons)) {
      const text = button.textContent?.toLowerCase() || '';
      const value = (button as HTMLInputElement).value?.toLowerCase() || '';
      
      if (text.includes('submit') || text.includes('apply') || 
          value.includes('submit') || value.includes('apply')) {
        return button as HTMLElement;
      }
    }
    
    // Fallback to any button with "submit" or "apply" in class
    const buttons = document.querySelectorAll('button, input[type="button"]');
    for (const button of Array.from(buttons)) {
      const className = (button as HTMLElement).className.toLowerCase();
      const text = button.textContent?.toLowerCase() || '';
      
      if (className.includes('submit') || className.includes('apply') ||
          text.includes('submit') || text.includes('apply')) {
        return button as HTMLElement;
      }
    }
    
    return null;
  }
  
  /**
   * Detect if form is multi-step
   */
  private detectMultiStep(): { 
    isMultiStep: boolean; 
    currentStep?: number; 
    totalSteps?: number;
  } {
    // Look for step indicators
    const stepIndicators = document.querySelectorAll(
      '[class*="step"], [class*="progress"], [aria-label*="step"]'
    );
    
    if (stepIndicators.length > 0) {
      // Try to parse step information
      for (const indicator of Array.from(stepIndicators)) {
        const text = indicator.textContent || '';
        const match = text.match(/(\d+)\s*(?:of|\/)\s*(\d+)/i);
        
        if (match) {
          return {
            isMultiStep: true,
            currentStep: parseInt(match[1]),
            totalSteps: parseInt(match[2]),
          };
        }
      }
      
      return { isMultiStep: true };
    }
    
    return { isMultiStep: false };
  }
  
  /**
   * Check if text matches any of the patterns
   */
  private matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }
  
  /**
   * Normalize field type
   */
  private normalizeFieldType(type: string): FormField['type'] {
    const typeMap: Record<string, FormField['type']> = {
      'text': 'text',
      'email': 'email',
      'tel': 'tel',
      'phone': 'tel',
      'textarea': 'textarea',
      'select': 'select',
      'file': 'file',
      'checkbox': 'checkbox',
      'radio': 'radio',
    };
    
    return typeMap[type] || 'text';
  }
}

