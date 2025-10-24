import { GoogleGenAI } from '@google/genai';
import { IParsedData } from '../models/Resume';

// Initialize Gemini client (will be null if API key not provided)
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

/**
 * Check if the text appears to be a CV/resume
 */
function isValidCV(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Common CV indicators
  const cvIndicators = [
    'experience', 'education', 'skills', 'summary', 'objective',
    'work history', 'employment', 'career', 'professional',
    'cv', 'resume', 'curriculum vitae',
    'bachelor', 'master', 'degree', 'university', 'college',
    'years of experience', 'worked at', 'employed at'
  ];
  
  // Count how many CV indicators are present
  const indicatorCount = cvIndicators.filter(indicator => 
    lowerText.includes(indicator)
  ).length;
  
  // Check for minimum length (CVs should be substantial)
  const minLength = 200;
  const hasMinimumLength = text.trim().length >= minLength;
  
  // Check for basic contact information patterns
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasContactInfo = hasEmail || hasPhone;
  
  // If we have at least 3 CV indicators, minimum length, and contact info, it's likely a CV
  return indicatorCount >= 3 && hasMinimumLength && hasContactInfo;
}

/**
 * Sanitize and validate parsed data to ensure it matches the expected schema
 */
function sanitizeParsedData(data: any): IParsedData {
  const sanitized: IParsedData = {};
  
  // Sanitize basic fields
  sanitized.name = sanitizeString(data.name);
  sanitized.email = sanitizeString(data.email);
  sanitized.phone = sanitizeString(data.phone);
  sanitized.location = sanitizeString(data.location);
  sanitized.summary = sanitizeString(data.summary);
  
  // Sanitize work experience
  if (Array.isArray(data.workExperience)) {
    sanitized.workExperience = data.workExperience
      .filter((exp: any) => exp && typeof exp === 'object')
      .map((exp: any) => ({
        title: sanitizeString(exp.title),
        company: sanitizeString(exp.company),
        startDate: sanitizeString(exp.startDate),
        endDate: sanitizeString(exp.endDate),
        current: sanitizeBoolean(exp.current),
        description: sanitizeString(exp.description),
        location: sanitizeString(exp.location)
      }))
      .filter((exp: any) => exp.title || exp.company); // Remove empty entries
  }
  
  // Sanitize education
  if (Array.isArray(data.education)) {
    sanitized.education = data.education
      .filter((edu: any) => edu && typeof edu === 'object')
      .map((edu: any) => ({
        degree: sanitizeString(edu.degree),
        institution: sanitizeString(edu.institution),
        graduationYear: sanitizeNumber(edu.graduationYear),
        field: sanitizeString(edu.field)
      }))
      .filter((edu: any) => edu.degree || edu.institution); // Remove empty entries
  }
  
  // Sanitize arrays
  sanitized.technicalSkills = sanitizeStringArray(data.technicalSkills);
  sanitized.softSkills = sanitizeStringArray(data.softSkills);
  sanitized.certifications = sanitizeStringArray(data.certifications);
  sanitized.languages = sanitizeStringArray(data.languages);
  
  return sanitized;
}

/**
 * Sanitize a string value
 */
function sanitizeString(value: any): string | undefined {
  if (value === null || value === undefined || value === 'null' || value === 'undefined') {
    return undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return String(value).trim() || undefined;
}

/**
 * Sanitize a boolean value
 */
function sanitizeBoolean(value: any): boolean | undefined {
  if (value === null || value === undefined || value === 'null' || value === 'undefined') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === '1';
  }
  return Boolean(value);
}

/**
 * Sanitize a number value
 */
function sanitizeNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === 'null' || value === 'undefined') {
    return undefined;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? undefined : value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      return undefined;
    }
    const parsed = parseInt(trimmed, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Sanitize an array of strings
 */
function sanitizeStringArray(value: any): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => sanitizeString(item))
    .filter((item): item is string => item !== undefined)
    .filter(item => item.length > 0);
}

/**
 * Validate that parsed data contains meaningful information
 */
function isValidParsedData(data: IParsedData): boolean {
  // Check if we have at least some basic information
  const hasBasicInfo = !!(data.name || data.email || data.phone);
  const hasWorkExperience = !!(data.workExperience && data.workExperience.length > 0);
  const hasEducation = !!(data.education && data.education.length > 0);
  const hasSkills = !!(data.technicalSkills && data.technicalSkills.length > 0) || 
                   !!(data.softSkills && data.softSkills.length > 0);
  
  // At least basic info OR work experience OR education OR skills should be present
  return hasBasicInfo || hasWorkExperience || hasEducation || hasSkills;
}

/**
 * Parse resume text using Gemini to extract structured data
 */
export async function parseResumeWithAI(text: string): Promise<IParsedData> {
  // First, check if this looks like a CV
  if (!isValidCV(text)) {
    console.warn('Text does not appear to be a CV/resume, using fallback parser');
    return parseFallback(text);
  }

  if (!genAI) {
    console.warn('Gemini API key not configured, using fallback parser');
    return parseFallback(text);
  }

  try {
    const prompt = `You are a resume parser. Extract structured information from resumes and return it as JSON.
Return ONLY valid JSON with this exact structure:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "string",
  "workExperience": [
    {
      "title": "string",
      "company": "string",
      "startDate": "string (YYYY-MM or YYYY)",
      "endDate": "string (YYYY-MM or YYYY) or 'Present'",
      "current": boolean,
      "description": "string",
      "location": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "graduationYear": number,
      "field": "string"
    }
  ],
  "technicalSkills": ["string"],
  "softSkills": ["string"],
  "certifications": ["string"],
  "languages": ["string"]
}

Guidelines:
- Extract all information accurately from the resume
- For dates, use YYYY-MM format when possible, or just YYYY
- Mark current positions with "current": true and "endDate": "Present"
- Separate technical skills (programming, tools) from soft skills (leadership, communication)
- If a field is not found, omit it or set it to null/empty array
- Return ONLY valid JSON - no markdown formatting, no explanations, no extra text
- Ensure all JSON keys and string values are properly quoted
- Do not include trailing commas in arrays or objects

Parse this resume:

${text}`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const responseText = result.text;

    if (!responseText) {
      throw new Error('No response from Gemini');
    }

    // Clean up response (remove markdown code blocks if present)
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Try to extract JSON from the response if it contains extra text
    let jsonStart = cleanedResponse.indexOf('{');
    let jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd);
    }

    // Additional cleanup for common JSON issues
    cleanedResponse = cleanedResponse
      .replace(/,\s*}/g, '}')  // Remove trailing commas before closing braces
      .replace(/,\s*]/g, ']')  // Remove trailing commas before closing brackets
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')  // Quote unquoted keys
      .replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}])/g, ':"$1"$2');  // Quote unquoted string values

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      console.error('Cleaned response:', cleanedResponse);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }
    
    // Sanitize and validate the parsed data
    parsedData = sanitizeParsedData(parsedData);
    
    // Validate that we got meaningful data
    if (!isValidParsedData(parsedData)) {
      console.warn('AI returned invalid or empty data, falling back to regex parser');
      return parseFallback(text);
    }
    
    parsedData.fullText = text;

    return parsedData as IParsedData;
  } catch (error: any) {
    console.error('Gemini parsing error:', error);
    // Fallback to basic parsing
    return parseFallback(text);
  }
}

/**
 * Fallback parser using regex and keyword matching
 */
function parseFallback(text: string): IParsedData {
  const parsedData: IParsedData = {
    fullText: text,
  };

  // Extract email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) {
    parsedData.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    parsedData.phone = phoneMatch[0];
  }

  // Extract technical skills (basic keyword matching)
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQL', 'NoSQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Linux',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'AI',
    'REST API', 'GraphQL', 'Microservices',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
    'Testing', 'Jest', 'Cypress', 'Selenium'
  ];

  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();

  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  parsedData.technicalSkills = [...new Set(foundSkills)];

  // Extract common soft skills
  const softSkills = [
    'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration',
    'Project Management', 'Critical Thinking', 'Agile', 'Scrum'
  ];

  const foundSoftSkills: string[] = [];
  softSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSoftSkills.push(skill);
    }
  });

  parsedData.softSkills = [...new Set(foundSoftSkills)];

  // Try to extract name (first line that's not too long and has capital letters)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines.slice(0, 5)) {
    if (line.length < 50 && /[A-Z]/.test(line) && !/@/.test(line) && !/\d{3}/.test(line)) {
      parsedData.name = line;
      break;
    }
  }

  // Sanitize the fallback parsed data as well
  return sanitizeParsedData(parsedData);
}

/**
 * Extract and categorize skills from parsed data
 */
export function extractAllSkills(parsedData: IParsedData): string[] {
  const skills: string[] = [];
  
  if (parsedData.technicalSkills) {
    skills.push(...parsedData.technicalSkills);
  }
  
  if (parsedData.softSkills) {
    skills.push(...parsedData.softSkills);
  }
  
  return [...new Set(skills)];
}

/**
 * Suggest job roles based on parsed resume data
 */
export function suggestRoles(parsedData: IParsedData): string[] {
  const roles: string[] = [];
  const allSkills = [
    ...(parsedData.technicalSkills || []),
    ...(parsedData.softSkills || [])
  ].map(s => s.toLowerCase());

  // Check work experience titles
  if (parsedData.workExperience && parsedData.workExperience.length > 0) {
    const latestJob = parsedData.workExperience[0];
    if (latestJob.title) {
      roles.push(latestJob.title);
    }
  }

  // Role suggestions based on skills
  if (allSkills.some(s => ['react', 'vue', 'angular', 'javascript', 'typescript'].includes(s))) {
    roles.push('Frontend Developer', 'Software Engineer', 'Full Stack Developer');
  }
  
  if (allSkills.some(s => ['node.js', 'express', 'python', 'django', 'flask', 'java', 'spring'].includes(s))) {
    roles.push('Backend Developer', 'Software Engineer', 'Full Stack Developer');
  }
  
  if (allSkills.some(s => ['machine learning', 'tensorflow', 'pytorch', 'data science', 'ai'].includes(s))) {
    roles.push('Data Scientist', 'Machine Learning Engineer', 'AI Engineer');
  }
  
  if (allSkills.some(s => ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'devops'].includes(s))) {
    roles.push('DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer');
  }
  
  if (allSkills.some(s => ['project management', 'agile', 'scrum', 'leadership'].includes(s))) {
    roles.push('Project Manager', 'Product Manager', 'Technical Lead');
  }

  return [...new Set(roles)];
}

