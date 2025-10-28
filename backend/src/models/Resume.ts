import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkExperience {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  location?: string;
}

export interface IEducation {
  degree: string;
  institution: string;
  graduationYear?: number;
  field?: string;
}

export interface IParsedData {
  fullText?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  workExperience?: IWorkExperience[];
  education?: IEducation[];
  certifications?: string[];
  languages?: string[];
  technicalSkills?: string[];
  softSkills?: string[];
  summary?: string;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  uploadDate: Date;
  status: 'processing';
  extractedSkills: string[];
  suggestedRoles: string[];
  searchedTitles: string[];
  jobSearchesUsed: number;
  jobSearchesLimit: number;
  totalJobs: number;
  newJobs: number;
  appliedJobs: number;
  successfulApplications: number;
  failedApplications: number;
  inQueue: number;
  resumeUsageCount: number;
  resumeUsageLimit: number;
  plan: 'FREE' | 'PRO';
  isLatest: boolean;
  parsedData?: IParsedData;
}

const WorkExperienceSchema = new Schema({
  title: { type: String },
  company: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  current: { type: Boolean },
  description: { type: String },
  location: { type: String }
}, { _id: false });

const EducationSchema = new Schema({
  degree: { type: String },
  institution: { type: String },
  graduationYear: { type: Number },
  field: { type: String }
}, { _id: false });

const ParsedDataSchema = new Schema({
  fullText: { type: String },
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  location: { type: String },
  workExperience: [WorkExperienceSchema],
  education: [EducationSchema],
  certifications: [{ type: String }],
  languages: [{ type: String }],
  technicalSkills: [{ type: String }],
  softSkills: [{ type: String }],
  summary: { type: String }
}, { _id: false });

const ResumeSchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['processing'],
    default: 'processing'
  },
  extractedSkills: [{ type: String }],
  suggestedRoles: [{ type: String }],
  searchedTitles: [{ type: String }],
  jobSearchesUsed: { type: Number, default: 0 },
  jobSearchesLimit: { type: Number, default: 1 },
  totalJobs: { type: Number, default: 0 },
  newJobs: { type: Number, default: 0 },
  appliedJobs: { type: Number, default: 0 },
  successfulApplications: { type: Number, default: 0 },
  failedApplications: { type: Number, default: 0 },
  inQueue: { type: Number, default: 0 },
  resumeUsageCount: { type: Number, default: 0 },
  resumeUsageLimit: { type: Number, default: 3 },
  plan: { 
    type: String, 
    enum: ['FREE', 'PRO'],
    default: 'FREE'
  },
  isLatest: { type: Boolean, default: false },
  parsedData: ParsedDataSchema
});

// Index for faster user-specific queries
ResumeSchema.index({ userId: 1, uploadDate: -1 });
ResumeSchema.index({ userId: 1, isLatest: 1 });

export default mongoose.model<IResume>('Resume', ResumeSchema);

