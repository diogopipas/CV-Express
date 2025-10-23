// Shared type definitions for the extension

export interface UserData {
  id: string;
  name: string;
  email: string;
  applicationEmail?: string; // Dedicated email for applications
  phone?: string;
  linkedinUrl?: string;
  applicationPreferences?: {
    defaultCoverLetter?: string;
    signature?: string;
    phone?: string;
    linkedinUrl?: string;
  };
}

export interface Resume {
  _id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  extractedSkills: string[];
}

export interface JobData {
  title: string;
  company: string;
  location: string;
  description?: string;
  url: string;
}

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'file' | 'checkbox' | 'radio';
  element: HTMLElement;
  required: boolean;
  label?: string;
  value?: string;
}

export interface ATSType {
  name: 'workday' | 'greenhouse' | 'lever' | 'icims' | 'jobvite' | 'generic';
  confidence: number;
}

export interface FormSchema {
  atsType: ATSType;
  fields: FormField[];
  submitButton?: HTMLElement;
  isMultiStep: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export interface FillResult {
  success: boolean;
  fieldsFilled: number;
  totalFields: number;
  errors: string[];
}

export interface ExtensionMessage {
  type: 'FILL_FORM' | 'GET_JOB_DATA' | 'CREATE_APPLICATION' | 'AUTH_STATUS' | 'DETECT_FORM' | 
        'EXTRACT_JOB_DATA' | 'DETECT_APPLICATION_FORM' | 'TRIGGER_AUTO_FILL' | 'TRACK_USAGE' | 'FORM_DETECTED';
  payload?: any;
}

export interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface StorageData {
  token?: string;
  userData?: UserData;
  latestResume?: Resume;
  lastSync?: number;
}

