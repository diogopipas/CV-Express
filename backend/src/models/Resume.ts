import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'failed';
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
}

const ResumeSchema: Schema = new Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['processing', 'completed', 'failed'],
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
});

export default mongoose.model<IResume>('Resume', ResumeSchema);

