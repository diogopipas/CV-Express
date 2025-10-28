import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IApplicationPreferences {
  defaultCoverLetter?: string;
  signature?: string;
  phone?: string;
  linkedinUrl?: string;
}

export interface IWorkExperience {
  title: string;
  company: string;
  startDate?: Date;
  endDate?: Date;
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

export interface IUserProfile {
  location?: string;
  yearsOfExperience?: number;
  currentJobTitle?: string;
  workExperience?: IWorkExperience[];
  education?: IEducation[];
  certifications?: string[];
  languages?: string[];
  skills?: string[];
  learnedFields?: Record<string, {
    value: any;
    source: string;
    learnedAt: Date;
  }>;
}

export interface IJobPreferences {
  desiredRoles?: string[];
  desiredLocations?: string[];
  remotePreference?: 'remote' | 'hybrid' | 'onsite' | 'any';
  salaryExpectations?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  workAuthorization?: string;
  availabilityDate?: Date;
  willingToRelocate?: boolean;
  noticePeriod?: string;
}

export interface ILinkedInProfile {
  linkedinId?: string;
  headline?: string;
  summary?: string;
  profileUrl?: string;
  connections?: number;
  lastSync?: Date;
}

export interface INotificationPreferences {
  emailOnInterview?: boolean;
  emailOnRejection?: boolean;
  emailOnOffer?: boolean;
  emailOnFollowUp?: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  applicationPreferences?: IApplicationPreferences;
  profile?: IUserProfile;
  jobPreferences?: IJobPreferences;
  linkedinProfile?: ILinkedInProfile;
  linkedinConnected?: boolean;
  connectedEmail?: string;
  applicationEmail?: string;
  emailProvider?: 'gmail' | 'outlook';
  emailAccessToken?: string;
  emailRefreshToken?: string;
  emailTokenExpiry?: Date;
  emailConnected?: boolean;
  lastEmailSync?: Date;
  notificationPreferences?: INotificationPreferences;
  onboardingCompleted?: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const WorkExperienceSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String },
  location: { type: String }
}, { _id: false });

const EducationSchema = new Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  graduationYear: { type: Number },
  field: { type: String }
}, { _id: false });

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    applicationPreferences: {
      defaultCoverLetter: { type: String },
      signature: { type: String },
      phone: { type: String },
      linkedinUrl: { type: String }
    },
    profile: {
      location: { type: String },
      yearsOfExperience: { type: Number },
      currentJobTitle: { type: String },
      workExperience: [WorkExperienceSchema],
      education: [EducationSchema],
      certifications: [{ type: String }],
      languages: [{ type: String }],
      skills: [{ type: String }]
    },
    jobPreferences: {
      desiredRoles: [{ type: String }],
      desiredLocations: [{ type: String }],
      remotePreference: { 
        type: String, 
        enum: ['remote', 'hybrid', 'onsite', 'any'],
        default: 'any'
      },
      salaryExpectations: {
        min: { type: Number },
        max: { type: Number },
        currency: { type: String, default: 'USD' }
      },
      workAuthorization: { type: String },
      availabilityDate: { type: Date },
      willingToRelocate: { type: Boolean, default: false },
      noticePeriod: { type: String }
    },
    linkedinProfile: {
      linkedinId: { type: String },
      headline: { type: String },
      summary: { type: String },
      profileUrl: { type: String },
      connections: { type: Number },
      lastSync: { type: Date }
    },
    linkedinConnected: { type: Boolean, default: false },
    connectedEmail: { type: String },
    applicationEmail: { type: String },
    emailProvider: { 
      type: String, 
      enum: ['gmail', 'outlook'],
      sparse: true
    },
    emailAccessToken: { type: String },
    emailRefreshToken: { type: String },
    emailTokenExpiry: { type: Date },
    emailConnected: { type: Boolean, default: false },
    lastEmailSync: { type: Date },
    notificationPreferences: {
      emailOnInterview: { type: Boolean, default: true },
      emailOnRejection: { type: Boolean, default: false },
      emailOnOffer: { type: Boolean, default: true },
      emailOnFollowUp: { type: Boolean, default: true }
    },
    onboardingCompleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;

