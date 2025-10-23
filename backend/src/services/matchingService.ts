import { IUser } from '../models/User';
import { IJob } from '../models/Job';
import { IMatchReason } from '../models/ApplicationQueue';

interface MatchResult {
  matchScore: number;
  matchReasons: IMatchReason[];
}

/**
 * Calculate match score between user profile and job
 * 
 * Weights:
 * - Skills match: 40%
 * - Role/title match: 25%
 * - Location match: 20%
 * - Salary range fit: 15%
 */
export function calculateMatchScore(user: IUser, job: IJob): MatchResult {
  const matchReasons: IMatchReason[] = [];
  let totalScore = 0;

  // 1. Skills Match (40% weight)
  const skillsScore = calculateSkillsMatch(user, job);
  totalScore += skillsScore * 0.4;
  matchReasons.push({
    category: 'skills',
    score: skillsScore,
    details: getSkillsMatchDetails(user, job)
  });

  // 2. Role/Title Match (25% weight)
  const roleScore = calculateRoleMatch(user, job);
  totalScore += roleScore * 0.25;
  matchReasons.push({
    category: 'role',
    score: roleScore,
    details: getRoleMatchDetails(user, job)
  });

  // 3. Location Match (20% weight)
  const locationScore = calculateLocationMatch(user, job);
  totalScore += locationScore * 0.2;
  matchReasons.push({
    category: 'location',
    score: locationScore,
    details: getLocationMatchDetails(user, job)
  });

  // 4. Salary Range Fit (15% weight)
  const salaryScore = calculateSalaryMatch(user, job);
  totalScore += salaryScore * 0.15;
  matchReasons.push({
    category: 'salary',
    score: salaryScore,
    details: getSalaryMatchDetails(user, job)
  });

  return {
    matchScore: Math.round(totalScore),
    matchReasons
  };
}

/**
 * Calculate skills match score (0-100)
 */
function calculateSkillsMatch(user: IUser, job: IJob): number {
  const userSkills = new Set(
    (user.profile?.skills || []).map(s => s.toLowerCase())
  );

  // Extract skills from job (description, required skills, etc.)
  const jobSkills = new Set<string>();
  
  // Add explicitly listed skills if available
  if (job.requirements && job.requirements.length > 0) {
    job.requirements.forEach(req => {
      const requirementWords = req.toLowerCase().split(/\W+/);
      requirementWords.forEach(word => {
        if (word.length > 3) { // Filter out very short words
          jobSkills.add(word);
        }
      });
    });
  }

  // Add from description
  if (job.description) {
    const descWords = job.description.toLowerCase().split(/\W+/);
    descWords.forEach(word => {
      if (word.length > 3) {
        jobSkills.add(word);
      }
    });
  }

  if (userSkills.size === 0 || jobSkills.size === 0) {
    return 50; // Neutral score if no skills data
  }

  // Calculate overlap
  let matchCount = 0;
  userSkills.forEach(skill => {
    if (jobSkills.has(skill)) {
      matchCount++;
    }
  });

  // Score based on percentage of user skills that match
  const matchPercentage = (matchCount / userSkills.size) * 100;
  return Math.min(matchPercentage * 1.5, 100); // Boost score slightly
}

function getSkillsMatchDetails(user: IUser, job: IJob): string {
  const userSkills = user.profile?.skills || [];
  if (userSkills.length === 0) {
    return 'No skills data available for matching';
  }
  return `${userSkills.slice(0, 5).join(', ')}${userSkills.length > 5 ? '...' : ''}`;
}

/**
 * Calculate role/title match score (0-100)
 */
function calculateRoleMatch(user: IUser, job: IJob): number {
  const desiredRoles = (user.jobPreferences?.desiredRoles || []).map(r => r.toLowerCase());
  const currentTitle = user.profile?.currentJobTitle?.toLowerCase() || '';
  const jobTitle = job.title.toLowerCase();

  if (desiredRoles.length === 0 && !currentTitle) {
    return 50; // Neutral if no role preferences
  }

  // Check if job title matches desired roles
  let maxScore = 0;
  
  desiredRoles.forEach(role => {
    if (jobTitle.includes(role) || role.includes(jobTitle)) {
      maxScore = Math.max(maxScore, 100);
    } else if (hasCommonWords(role, jobTitle)) {
      maxScore = Math.max(maxScore, 70);
    }
  });

  // Check current title similarity
  if (currentTitle && (jobTitle.includes(currentTitle) || currentTitle.includes(jobTitle))) {
    maxScore = Math.max(maxScore, 85);
  }

  return maxScore;
}

function getRoleMatchDetails(user: IUser, job: IJob): string {
  const desiredRoles = user.jobPreferences?.desiredRoles || [];
  if (desiredRoles.length === 0) {
    return 'No role preferences set';
  }
  return `Looking for: ${desiredRoles.slice(0, 3).join(', ')}`;
}

/**
 * Calculate location match score (0-100)
 */
function calculateLocationMatch(user: IUser, job: IJob): number {
  const desiredLocations = (user.jobPreferences?.desiredLocations || []).map(l => l.toLowerCase());
  const remotePreference = user.jobPreferences?.remotePreference || 'any';
  const jobLocation = job.location.toLowerCase();

  // Check if job is remote
  const isRemote = jobLocation.includes('remote') || 
                   jobLocation.includes('anywhere') ||
                   jobLocation.includes('worldwide');

  // Perfect match for remote preference
  if (remotePreference === 'remote' && isRemote) {
    return 100;
  }

  // If user wants remote but job isn't
  if (remotePreference === 'remote' && !isRemote) {
    return 30;
  }

  // If remote preference is 'any'
  if (remotePreference === 'any') {
    return 80; // Good score for flexibility
  }

  // Check desired locations
  if (desiredLocations.length === 0) {
    return 70; // Neutral-positive if no preference
  }

  for (const location of desiredLocations) {
    if (jobLocation.includes(location) || location.includes(jobLocation)) {
      return 95;
    }
  }

  // Check if willing to relocate
  if (user.jobPreferences?.willingToRelocate) {
    return 60;
  }

  return 40; // Location mismatch
}

function getLocationMatchDetails(user: IUser, job: IJob): string {
  const remotePreference = user.jobPreferences?.remotePreference || 'any';
  const desiredLocations = user.jobPreferences?.desiredLocations || [];
  
  if (remotePreference === 'remote') {
    return 'Seeking remote positions';
  }
  
  if (desiredLocations.length > 0) {
    return `Preferred: ${desiredLocations.slice(0, 2).join(', ')}`;
  }
  
  return 'Open to any location';
}

/**
 * Calculate salary match score (0-100)
 */
function calculateSalaryMatch(user: IUser, job: IJob): number {
  const expectations = user.jobPreferences?.salaryExpectations;
  
  if (!expectations || (!expectations.min && !expectations.max)) {
    return 70; // Neutral if no salary expectations
  }

  // Try to parse salary from job
  const jobSalary = extractSalaryFromJob(job);
  
  if (!jobSalary.min && !jobSalary.max) {
    return 70; // Neutral if job doesn't list salary
  }

  const userMin = expectations.min || 0;
  const userMax = expectations.max || Infinity;
  const jobMin = jobSalary.min || 0;
  const jobMax = jobSalary.max || Infinity;

  // Check overlap
  if (jobMax >= userMin && jobMin <= userMax) {
    // Calculate overlap percentage
    const overlapStart = Math.max(jobMin, userMin);
    const overlapEnd = Math.min(jobMax, userMax);
    const overlapSize = overlapEnd - overlapStart;
    const userRange = userMax - userMin;
    
    if (userRange > 0) {
      return Math.min((overlapSize / userRange) * 100, 100);
    }
    return 85;
  }

  // No overlap
  if (jobMax < userMin) {
    return 20; // Job pays less than expectation
  }
  
  return 60; // Job pays more (could still be good)
}

function getSalaryMatchDetails(user: IUser, job: IJob): string {
  const expectations = user.jobPreferences?.salaryExpectations;
  
  if (!expectations || (!expectations.min && !expectations.max)) {
    return 'No salary expectations set';
  }

  const currency = expectations.currency || 'USD';
  const min = expectations.min ? `${expectations.min}` : '';
  const max = expectations.max ? `${expectations.max}` : '';
  
  if (min && max) {
    return `Expecting: ${min}-${max} ${currency}`;
  } else if (min) {
    return `Expecting: ${min}+ ${currency}`;
  } else if (max) {
    return `Expecting: up to ${max} ${currency}`;
  }
  
  return 'Salary expectations set';
}

/**
 * Extract salary information from job description
 */
function extractSalaryFromJob(job: IJob): { min?: number; max?: number } {
  const text = `${job.salary || ''} ${job.description}`.toLowerCase();
  
  // Look for patterns like "$50,000 - $70,000", "50k-70k", etc.
  const patterns = [
    /\$?([\d,]+)k?\s*-\s*\$?([\d,]+)k?/,
    /\$?([\d,]+)\s*to\s*\$?([\d,]+)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let min = parseInt(match[1].replace(/,/g, ''));
      let max = parseInt(match[2].replace(/,/g, ''));
      
      // Convert k to thousands if needed
      if (text.includes('k')) {
        min *= 1000;
        max *= 1000;
      }
      
      return { min, max };
    }
  }

  // Single salary value
  const singleMatch = text.match(/\$?([\d,]+)k?/);
  if (singleMatch) {
    let value = parseInt(singleMatch[1].replace(/,/g, ''));
    if (text.includes('k')) {
      value *= 1000;
    }
    return { min: value, max: value };
  }

  return {};
}

/**
 * Check if two strings have common words
 */
function hasCommonWords(str1: string, str2: string): boolean {
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 3));
  
  for (const word of words1) {
    if (words2.has(word)) {
      return true;
    }
  }
  
  return false;
}

