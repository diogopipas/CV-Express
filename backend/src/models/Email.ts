import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment {
  filename: string;
  contentType: string;
  size: number;
  url?: string;
}

export interface IEmail extends Document {
  userId: mongoose.Types.ObjectId;
  applicationId?: mongoose.Types.ObjectId;
  from: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  receivedAt: Date;
  isRead: boolean;
  category: 'general' | 'interview' | 'rejection' | 'offer' | 'followup' | 'assessment';
  attachments: IAttachment[];
  rawEmail?: string;
  metadata?: {
    interviewDate?: Date;
    interviewLocation?: string;
    interviewType?: 'phone' | 'video' | 'onsite';
    salaryOffer?: string;
    assessmentDeadline?: Date;
    [key: string]: any;
  };
}

const AttachmentSchema = new Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String }
}, { _id: false });

const EmailSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  applicationId: {
    type: Schema.Types.ObjectId,
    ref: 'Application',
    index: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  htmlBody: {
    type: String
  },
  receivedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  category: {
    type: String,
    enum: ['general', 'interview', 'rejection', 'offer', 'followup', 'assessment'],
    default: 'general',
    index: true
  },
  attachments: [AttachmentSchema],
  rawEmail: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound indexes
EmailSchema.index({ userId: 1, receivedAt: -1 });
EmailSchema.index({ userId: 1, category: 1, receivedAt: -1 });
EmailSchema.index({ userId: 1, isRead: 1, receivedAt: -1 });
EmailSchema.index({ applicationId: 1, receivedAt: -1 });

export default mongoose.model<IEmail>('Email', EmailSchema);

