import OpenAI from 'openai';
import { IParsedData } from '../models/Resume';

// Initialize OpenAI client (will be null if API key not provided)
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Parse resume text using OpenAI to extract structured data
 */
export async function parseResumeWithAI(text: string): Promise<IParsedData> {
  if (!openai) {
    console.warn('OpenAI API key not configured, using fallback parser');
    return parseFallback(text);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a resume parser. Extract structured information from resumes and return it as JSON.
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
- Return ONLY the JSON object, no markdown formatting or explanation`
        },
        {
          role: 'user',
          content: `Parse this resume:\n\n${text}`
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Clean up response (remove markdown code blocks if present)
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsedData = JSON.parse(cleanedResponse);
    parsedData.fullText = text;

    return parsedData as IParsedData;
  } catch (error: any) {
    console.error('OpenAI parsing error:', error);
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

  return parsedData;
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

