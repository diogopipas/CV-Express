import mongoose, { Document, Schema } from 'mongoose';

export interface INote {
  text: string;
  date: Date;
  type: 'general' | 'interview' | 'follow-up' | 'offer' | 'rejection';
}

export interface IContact {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface ITimelineEvent {
  action: string;
  date: Date;
  details?: string;
}

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  status: 'pending' | 'applied' | 'interviewing' | 'offered' | 'rejected' | 'accepted' | 'withdrawn';
  appliedDate: Date;
  coverLetter?: string;
  notes: INote[];
  interviewDate?: Date;
  salaryOffered?: string;
  contacts: IContact[];
  documents: string[];
  timeline: ITimelineEvent[];
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  submissionMethod: 'cv_express_extension' | 'manual' | 'external';
  externalApplicationId?: string;
}

const NoteSchema = new Schema({
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  type: { 
    type: String, 
    enum: ['general', 'interview', 'follow-up', 'offer', 'rejection'],
    default: 'general'
  }
}, { _id: false });

const ContactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  role: { type: String }
}, { _id: false });

const TimelineEventSchema = new Schema({
  action: { type: String, required: true },
  date: { type: Date, default: Date.now },
  details: { type: String }
}, { _id: false });

const ApplicationSchema: Schema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  jobId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  resumeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Resume', 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'applied', 'interviewing', 'offered', 'rejected', 'accepted', 'withdrawn'],
    default: 'pending',
    required: true
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  coverLetter: {
    type: String
  },
  notes: [NoteSchema],
  interviewDate: {
    type: Date
  },
  salaryOffered: {
    type: String
  },
  contacts: [ContactSchema],
  documents: [{ type: String }],
  timeline: [TimelineEventSchema],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [{ type: String }],
  submissionMethod: {
    type: String,
    enum: ['cv_express_extension', 'manual', 'external'],
    default: 'manual'
  },
  externalApplicationId: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
ApplicationSchema.index({ userId: 1, appliedDate: -1 });
ApplicationSchema.index({ status: 1, userId: 1 });
ApplicationSchema.index({ jobId: 1 });

// Middleware to automatically add timeline events
ApplicationSchema.pre<IApplication>('save', function(next) {
  if (this.isNew) {
    this.timeline.push({
      action: 'Application created',
      date: new Date(),
      details: `Status: ${this.status}`
    } as ITimelineEvent);
  } else if (this.isModified('status')) {
    this.timeline.push({
      action: 'Status updated',
      date: new Date(),
      details: `Changed to: ${this.status}`
    } as ITimelineEvent);
  }
  next();
});

export default mongoose.model<IApplication>('Application', ApplicationSchema);

