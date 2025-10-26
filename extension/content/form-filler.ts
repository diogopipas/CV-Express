import { FormDetector } from './form-detector';
import { UserData, Resume, FillResult, FormField } from '../utils/types';

/**
 * Form Filler - Auto-fills application forms with user data
 */
export class FormFiller {
  private userData: UserData;
  private resume: Resume;
  
  constructor(userData: UserData, resume: Resume) {
    this.userData = userData;
    this.resume = resume;
  }
  
  /**
   * Fill the detected form
   */
  async fillForm(): Promise<FillResult> {
    const detector = new FormDetector();
    const formSchema = detector.detectForm();
    
    if (!formSchema) {
      return {
        success: false,
        fieldsFilled: 0,
        totalFields: 0,
        errors: ['No application form detected on this page'],
      };
    }
    
    const errors: string[] = [];
    let fieldsFilled = 0;
    
    for (const field of formSchema.fields) {
      try {
        const filled = await this.fillField(field);
        if (filled) {
          fieldsFilled++;
        }
      } catch (error: any) {
        console.error(`Error filling field ${field.name}:`, error);
        errors.push(`${field.name}: ${error.message}`);
      }
    }
    
    return {
      success: errors.length === 0,
      fieldsFilled,
      totalFields: formSchema.fields.length,
      errors,
    };
  }
  
  /**
   * Fill a single form field
   */
  private async fillField(field: FormField): Promise<boolean> {
    const value = this.getValueForField(field.name);
    
    if (!value) {
      return false;
    }
    
    const element = field.element;
    
    // Handle different field types
    if (field.type === 'text' || field.type === 'email' || field.type === 'tel') {
      return this.fillTextInput(element as HTMLInputElement, value);
    }
    
    if (field.type === 'textarea') {
      return this.fillTextarea(element as HTMLTextAreaElement, value);
    }
    
    if (field.type === 'select') {
      return this.fillSelect(element as HTMLSelectElement, value);
    }
    
    if (field.type === 'file' && field.name === 'resume') {
      return await this.fillFileInput(element as HTMLInputElement);
    }
    
    return false;
  }
  
  /**
   * Get value for a field based on user data
   */
  private getValueForField(fieldName: string): string | undefined {
    const mapping: Record<string, string | undefined> = {
      firstName: this.getFirstName(),
      lastName: this.getLastName(),
      fullName: this.userData.name,
      email: this.userData.connectedEmail || this.userData.email, // Use connected email if available
      phone: this.userData.phone || this.userData.applicationPreferences?.phone,
      linkedin: this.userData.linkedinUrl || this.userData.applicationPreferences?.linkedinUrl,
      coverLetter: this.userData.applicationPreferences?.defaultCoverLetter,
    };
    
    return mapping[fieldName];
  }
  
  /**
   * Get first name from full name
   */
  private getFirstName(): string {
    return this.userData.name.split(' ')[0];
  }
  
  /**
   * Get last name from full name
   */
  private getLastName(): string {
    const parts = this.userData.name.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }
  
  /**
   * Fill text input field
   */
  private fillTextInput(input: HTMLInputElement, value: string): boolean {
    try {
      // Set value
      input.value = value;
      
      // Trigger events to ensure the value is recognized
      this.triggerInputEvents(input);
      
      return true;
    } catch (error) {
      console.error('Error filling text input:', error);
      return false;
    }
  }
  
  /**
   * Fill textarea field
   */
  private fillTextarea(textarea: HTMLTextAreaElement, value: string): boolean {
    try {
      textarea.value = value;
      this.triggerInputEvents(textarea);
      return true;
    } catch (error) {
      console.error('Error filling textarea:', error);
      return false;
    }
  }
  
  /**
   * Fill select dropdown
   */
  private fillSelect(select: HTMLSelectElement, value: string): boolean {
    try {
      // Try to find matching option
      const options = Array.from(select.options);
      
      // Try exact match
      let matchingOption = options.find(
        opt => opt.value.toLowerCase() === value.toLowerCase() ||
               opt.textContent?.toLowerCase() === value.toLowerCase()
      );
      
      // Try partial match
      if (!matchingOption) {
        matchingOption = options.find(
          opt => opt.value.toLowerCase().includes(value.toLowerCase()) ||
                 opt.textContent?.toLowerCase().includes(value.toLowerCase())
        );
      }
      
      if (matchingOption) {
        select.value = matchingOption.value;
        this.triggerInputEvents(select);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error filling select:', error);
      return false;
    }
  }
  
  /**
   * Fill file input (resume upload)
   */
  private async fillFileInput(input: HTMLInputElement): Promise<boolean> {
    try {
      // Note: Due to browser security restrictions, we cannot programmatically
      // set file inputs. We can only show a notification to the user.
      
      // Highlight the file input
      input.style.border = '2px solid #10b981';
      input.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
      
      // Show tooltip
      this.showFileUploadTooltip(input);
      
      // We return true to indicate we've handled it (by highlighting)
      return true;
    } catch (error) {
      console.error('Error handling file input:', error);
      return false;
    }
  }
  
  /**
   * Show tooltip for file upload
   */
  private showFileUploadTooltip(input: HTMLInputElement) {
    const tooltip = document.createElement('div');
    tooltip.className = 'cv-express-file-tooltip';
    tooltip.textContent = 'Please manually upload your resume here';
    tooltip.style.cssText = `
      position: absolute;
      background: #1f2937;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
      white-space: nowrap;
    `;
    
    const rect = input.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.top - 35}px`;
    
    document.body.appendChild(tooltip);
    
    setTimeout(() => {
      tooltip.remove();
      input.style.border = '';
      input.style.boxShadow = '';
    }, 5000);
  }
  
  /**
   * Trigger input events to ensure frameworks detect the change
   */
  private triggerInputEvents(element: HTMLElement) {
    // Trigger various events that frameworks might listen to
    const events = [
      new Event('input', { bubbles: true }),
      new Event('change', { bubbles: true }),
      new Event('blur', { bubbles: true }),
      new KeyboardEvent('keydown', { bubbles: true }),
      new KeyboardEvent('keyup', { bubbles: true }),
    ];
    
    // For React specifically
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    
    if (nativeInputValueSetter && element instanceof HTMLInputElement) {
      nativeInputValueSetter.call(element, element.value);
    }
    
    events.forEach(event => element.dispatchEvent(event));
  }
  
  /**
   * Scroll element into view smoothly
   */
  private scrollIntoView(element: HTMLElement) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
  
  /**
   * Highlight filled field temporarily
   */
  private highlightField(element: HTMLElement) {
    const originalBackground = element.style.backgroundColor;
    const originalTransition = element.style.transition;
    
    element.style.transition = 'background-color 0.3s';
    element.style.backgroundColor = '#d1fae5';
    
    setTimeout(() => {
      element.style.backgroundColor = originalBackground;
      setTimeout(() => {
        element.style.transition = originalTransition;
      }, 300);
    }, 1000);
  }
}

