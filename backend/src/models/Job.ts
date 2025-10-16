import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobUrl: string;
  source: 'LinkedIn' | 'Indeed' | 'Glassdoor' | 'Adzuna';
  postedDate?: Date;
  scrapedDate: Date;
  saved: boolean;
  tags: string[];
  resumeId?: mongoose.Types.ObjectId;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  salary: { type: String },
  jobUrl: { type: String, required: true, unique: true },
  source: { type: String, enum: ['LinkedIn', 'Indeed', 'Glassdoor', 'Adzuna'], required: true },
  postedDate: { type: Date },
  scrapedDate: { type: Date, default: Date.now },
  saved: { type: Boolean, default: false },
  tags: [{ type: String }],
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume' }
}, {
  timestamps: true
});

// Index for faster queries
JobSchema.index({ title: 'text', company: 'text', description: 'text' });
JobSchema.index({ source: 1, scrapedDate: -1 });
JobSchema.index({ resumeId: 1, scrapedDate: -1 });

export default mongoose.model<IJob>('Job', JobSchema);

