import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  country?: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'Adzuna' | 'Arbeitnow' | 'JSearch' | 'Mock';
  postedDate?: Date;
  scrapedDate: Date;
  saved: boolean;
  tags: string[];
  resumeId?: mongoose.Types.ObjectId;
  requirements: string[];
  benefits: string[];
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
  applicationDeadline?: Date;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  country: { type: String },
  description: { type: String, required: true },
  salary: { type: String },
  jobUrl: { type: String, required: true, unique: true },
  source: { type: String, enum: ['Adzuna', 'Arbeitnow', 'JSearch', 'Mock'], required: true },
  postedDate: { type: Date },
  scrapedDate: { type: Date, default: Date.now },
  saved: { type: Boolean, default: false },
  tags: [{ type: String }],
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume' },
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  employmentType: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary']
  },
  applicationDeadline: { type: Date }
}, {
  timestamps: true
});

// Index for faster queries
JobSchema.index({ title: 'text', company: 'text', description: 'text' });
JobSchema.index({ source: 1, scrapedDate: -1 });
JobSchema.index({ resumeId: 1, scrapedDate: -1 });
JobSchema.index({ country: 1, scrapedDate: -1 });

export default mongoose.model<IJob>('Job', JobSchema);

