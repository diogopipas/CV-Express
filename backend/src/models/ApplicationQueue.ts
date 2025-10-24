import mongoose, { Document, Schema } from 'mongoose';

export interface IAutoFillData {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  coverLetter?: string;
  [key: string]: any;
}

export interface IMatchReason {
  category: 'skills' | 'role' | 'location' | 'salary';
  score: number;
  details: string;
}

export interface IApplicationQueue extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  matchScore: number;
  matchReasons: IMatchReason[];
  status: 'pending_review' | 'approved' | 'rejected' | 'processing';
  autoFillData: IAutoFillData;
  queuedAt: Date;
  reviewedAt?: Date;
  processedAt?: Date;
  errorMessage?: string;
  retryCount: number;
}

const MatchReasonSchema = new Schema({
  category: {
    type: String,
    enum: ['skills', 'role', 'location', 'salary'],
    required: true
  },
  score: { type: Number, required: true },
  details: { type: String }
}, { _id: false });

const ApplicationQueueSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  resumeId: {
    type: Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchReasons: [MatchReasonSchema],
  status: {
    type: String,
    enum: ['pending_review', 'approved', 'rejected', 'processing'],
    default: 'pending_review',
    required: true,
    index: true
  },
  autoFillData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  queuedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  reviewedAt: {
    type: Date
  },
  processedAt: {
    type: Date
  },
  errorMessage: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
ApplicationQueueSchema.index({ userId: 1, status: 1 });
ApplicationQueueSchema.index({ userId: 1, queuedAt: -1 });
ApplicationQueueSchema.index({ status: 1, queuedAt: 1 });

// Prevent duplicate job in queue for same user
ApplicationQueueSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export default mongoose.model<IApplicationQueue>('ApplicationQueue', ApplicationQueueSchema);

