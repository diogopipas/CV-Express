import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Resume from '../models/Resume';

const router = express.Router();

// Dynamically import pdf-parse to handle potential ES module issues
let pdfParse: any = null;
try {
  pdfParse = require('pdf-parse');
} catch (error) {
  console.warn('PDF parsing not available:', error);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && (mimetype || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'text/plain')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word documents, and text files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Extract skills from resume text (simple keyword matching)
const extractSkills = (text: string): string[] => {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'ASP.NET',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQL', 'NoSQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'Linux',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'AI',
    'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum',
    'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
    'Testing', 'Jest', 'Cypress', 'Selenium',
    'Problem Solving', 'Classroom Management', 'Bash', 'C/C++'
  ];

  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();

  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return [...new Set(foundSkills)]; // Remove duplicates
};

// Suggest roles based on skills
const suggestRoles = (skills: string[]): string[] => {
  const roles: string[] = [];
  const skillsLower = skills.map(s => s.toLowerCase());

  if (skillsLower.some(s => ['react', 'vue', 'angular', 'javascript', 'typescript'].includes(s))) {
    roles.push('Software Engineer', 'Frontend Developer', 'Full Stack Developer');
  }
  if (skillsLower.some(s => ['node.js', 'express', 'python', 'django', 'flask'].includes(s))) {
    roles.push('Backend Developer', 'Software Engineer', 'Full Stack Developer');
  }
  if (skillsLower.some(s => ['machine learning', 'tensorflow', 'pytorch', 'data science'].includes(s))) {
    roles.push('Data Science Intern', 'Machine Learning Intern');
  }
  if (skillsLower.some(s => ['classroom management'].includes(s))) {
    roles.push('Software Development Intern');
  }

  return [...new Set(roles)]; // Remove duplicates
};

// Upload resume
router.post('/upload', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Check if user already has 5 resumes
    const resumeCount = await Resume.countDocuments();
    if (resumeCount >= 5) {
      // Clean up the uploaded file since we won't save it
      if (fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to clean up file:', cleanupError);
        }
      }
      return res.status(400).json({ 
        success: false, 
        message: 'You have reached the maximum limit of 5 CVs. Please delete an existing CV before uploading a new one.' 
      });
    }

    // Set all other resumes as not latest
    await Resume.updateMany({}, { isLatest: false });

    // Create resume record
    const resume = new Resume({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      status: 'processing',
      isLatest: true,
    });

    await resume.save();

    // Process resume to extract text and skills (async)
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    if (fileExtension === '.txt') {
      // Handle text file
      try {
        const extractedText = fs.readFileSync(req.file.path, 'utf-8');

        const skills = extractSkills(extractedText);
        const roles = suggestRoles(skills);

        resume.extractedSkills = skills;
        resume.suggestedRoles = roles;
        resume.status = 'completed';
        await resume.save();
      } catch (error) {
        console.error('Text file parsing error:', error);
        resume.status = 'completed'; // Still mark as completed even if parsing fails
        await resume.save();
      }
    } else if (fileExtension === '.pdf' && pdfParse) {
      // Handle PDF file
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        const extractedText = pdfData.text;

        const skills = extractSkills(extractedText);
        const roles = suggestRoles(skills);

        resume.extractedSkills = skills;
        resume.suggestedRoles = roles;
        resume.status = 'completed';
        await resume.save();
      } catch (error) {
        console.error('PDF parsing error:', error);
        resume.status = 'completed'; // Still mark as completed even if parsing fails
        await resume.save();
      }
    } else {
      resume.status = 'completed';
      await resume.save();
    }

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: resume
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if database operation failed
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to clean up file:', cleanupError);
      }
    }
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to upload resume';
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      errorMessage = 'Database connection error. Please ensure MongoDB is running.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// Get all resumes
router.get('/', async (req: Request, res: Response) => {
  try {
    const resumes = await Resume.find().sort({ uploadDate: -1 });
    res.json({ success: true, data: resumes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get latest resume
router.get('/latest', async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findOne({ isLatest: true });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found' });
    }
    res.json({ success: true, data: resume });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get resume by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.json({ success: true, data: resume });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete resume
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }

    await Resume.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update resume stats
router.patch('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { jobSearchesUsed, totalJobs, newJobs, appliedJobs, successfulApplications, failedApplications, inQueue } = req.body;
    
    const resume = await Resume.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          jobSearchesUsed,
          totalJobs,
          newJobs,
          appliedJobs,
          successfulApplications,
          failedApplications,
          inQueue
        }
      },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({ success: true, data: resume });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add searched title to resume
router.post('/:id/search-title', async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (!resume.searchedTitles.includes(title)) {
      resume.searchedTitles.push(title);
      resume.jobSearchesUsed += 1;
      await resume.save();
    }

    res.json({ success: true, data: resume });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download/View resume file
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    // Note: Authentication should be handled by the frontend when making the request
    // The token is passed via query param for direct browser access
    
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (!fs.existsSync(resume.filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found' });
    }

    const fileExtension = path.extname(resume.filePath).toLowerCase();
    
    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    } else if (fileExtension === '.txt') {
      contentType = 'text/plain';
    } else if (fileExtension === '.doc') {
      contentType = 'application/msword';
    } else if (fileExtension === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${resume.originalName}"`);
    
    const fileStream = fs.createReadStream(resume.filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

