# LinkedIn OAuth Integration Guide

This guide will help you add LinkedIn OAuth integration when you're ready. All the data structures are already in place - you just need to set up the OAuth flow.

## Prerequisites

1. **LinkedIn Developer Account**: Create at [https://www.linkedin.com/developers/](https://www.linkedin.com/developers/)
2. **Create LinkedIn App**: This can take 3-7 days for approval
3. **OAuth Credentials**: You'll receive Client ID and Client Secret

## Data Structures Already Implemented

### User Model (`/backend/src/models/User.ts`)
```typescript
linkedinProfile: {
  linkedinId: String,
  headline: String,
  summary: String,
  profileUrl: String,
  connections: Number,
  lastSync: Date
}
linkedinConnected: Boolean
```

## Implementation Steps

### 1. Install Dependencies (Already Done)
The required packages are already in package.json:
- `passport`
- `passport-linkedin-oauth2`

### 2. Create LinkedIn Routes

Create `/backend/src/routes/linkedinRoutes.ts`:

```typescript
import express from 'express';
import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Configure LinkedIn Strategy
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    callbackURL: `${process.env.API_URL}/api/linkedin/callback`,
    scope: ['r_liteprofile', 'r_emailaddress'],
    state: true
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Profile will be handled in the callback route
      return done(null, { profile, accessToken });
    } catch (error) {
      return done(error);
    }
  }
));

// Initiate LinkedIn OAuth
router.get('/auth', protect, (req, res, next) => {
  // Store user ID in session for callback
  (req.session as any).userId = (req as AuthRequest).user?._id;
  passport.authenticate('linkedin', { state: 'SOME_RANDOM_STRING' })(req, res, next);
});

// LinkedIn OAuth Callback
router.get('/callback',
  passport.authenticate('linkedin', { failureRedirect: '/onboarding' }),
  async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const linkedinData = req.user?.profile;

      if (!userId || !linkedinData) {
        return res.redirect('/onboarding?error=linkedin_failed');
      }

      // Update user with LinkedIn data
      const user = await User.findById(userId);
      if (user) {
        user.linkedinProfile = {
          linkedinId: linkedinData.id,
          headline: linkedinData.headline,
          summary: linkedinData.summary,
          profileUrl: linkedinData.publicProfileUrl,
          connections: linkedinData.numConnections || 0,
          lastSync: new Date()
        };
        user.linkedinConnected = true;

        // Merge profile data
        if (!user.profile) user.profile = {};
        if (!user.profile.location && linkedinData.location?.name) {
          user.profile.location = linkedinData.location.name;
        }
        
        await user.save();
      }

      res.redirect('/onboarding?linkedin=success');
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      res.redirect('/onboarding?error=linkedin_failed');
    }
  }
);

// Disconnect LinkedIn
router.post('/disconnect', protect, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?._id);
    if (user) {
      user.linkedinProfile = undefined;
      user.linkedinConnected = false;
      await user.save();
    }
    res.json({ success: true, message: 'LinkedIn disconnected' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to disconnect LinkedIn' });
  }
});

export default router;
```

### 3. Register Routes in Server

Add to `/backend/src/server.ts`:

```typescript
import linkedinRoutes from './routes/linkedinRoutes';
import session from 'express-session';
import passport from 'passport';

// Before your existing routes
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Add route
app.use('/api/linkedin', linkedinRoutes);
```

### 4. Add Environment Variables

Add to `/backend/.env`:

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
SESSION_SECRET=your_random_session_secret_here
API_URL=http://localhost:5000
```

### 5. Update Frontend - Add LinkedIn Button

In `/frontend/src/pages/Onboarding.tsx`, add a LinkedIn connect button:

```typescript
const handleLinkedInConnect = () => {
  // Redirect to LinkedIn auth
  window.location.href = `${API_URL}/linkedin/auth`;
};

// In your onboarding UI (step 4 or before step 1):
<Button onClick={handleLinkedInConnect} variant="outline">
  <Linkedin className="w-4 h-4 mr-2" />
  Import from LinkedIn
</Button>
```

### 6. Handle OAuth Callback in Frontend

Update `/frontend/src/pages/Onboarding.tsx` to handle the redirect:

```typescript
useEffect(() => {
  // Check for LinkedIn callback
  const params = new URLSearchParams(window.location.search);
  if (params.get('linkedin') === 'success') {
    toast.success('LinkedIn profile imported successfully!');
    // Fetch updated profile
    fetchProfile();
  } else if (params.get('error') === 'linkedin_failed') {
    toast.error('Failed to connect LinkedIn');
  }
}, []);
```

## LinkedIn API Scopes

Request these scopes for best data:
- `r_liteprofile` - Basic profile information
- `r_emailaddress` - Email address
- `r_basicprofile` - More detailed profile (if needed)

## Data Mapping

Map LinkedIn profile to User model:

```typescript
// LinkedIn → User Profile Mapping
{
  headline: linkedinData.headline,           // → profile.currentJobTitle
  summary: linkedinData.summary,             // → linkedinProfile.summary
  location: linkedinData.location.name,      // → profile.location
  positions: linkedinData.positions,         // → profile.workExperience
  educations: linkedinData.educations,       // → profile.education
  skills: linkedinData.skills,               // → profile.skills
  certifications: linkedinData.certifications // → profile.certifications
}
```

## Enhanced Parsing (Optional)

If you want to extract more detailed information:

```typescript
// In callback, after getting LinkedIn data:
const parseLinkedInProfile = (linkedinData: any) => {
  const workExperience = linkedinData.positions?.values?.map((pos: any) => ({
    title: pos.title,
    company: pos.company.name,
    startDate: new Date(pos.startDate?.year, pos.startDate?.month || 0),
    endDate: pos.isCurrent ? undefined : new Date(pos.endDate?.year, pos.endDate?.month || 0),
    current: pos.isCurrent,
    description: pos.summary,
    location: pos.location?.name
  })) || [];

  const education = linkedinData.educations?.values?.map((edu: any) => ({
    degree: edu.degree,
    institution: edu.schoolName,
    graduationYear: edu.endDate?.year,
    field: edu.fieldOfStudy
  })) || [];

  const skills = linkedinData.skills?.values?.map((skill: any) => skill.name) || [];

  return { workExperience, education, skills };
};

// Apply to user
const parsed = parseLinkedInProfile(linkedinData);
user.profile.workExperience = parsed.workExperience;
user.profile.education = parsed.education;
user.profile.skills = parsed.skills;
```

## Testing

1. **Development Callback URL**: `http://localhost:5000/api/linkedin/callback`
2. **Production Callback URL**: `https://yourdomain.com/api/linkedin/callback`

Update both in your LinkedIn app settings.

### Test Flow:
1. Click "Import from LinkedIn" button
2. Redirected to LinkedIn OAuth
3. Authorize the app
4. Redirected back to your app with code
5. Backend exchanges code for access token
6. Fetch LinkedIn profile data
7. Update user profile
8. Redirect to onboarding with success message

## Security Considerations

1. **State Parameter**: Prevents CSRF attacks (already included)
2. **Session Secret**: Use strong random string in production
3. **HTTPS Only**: Always use HTTPS in production for OAuth
4. **Token Storage**: Don't store access tokens long-term (LinkedIn tokens expire)
5. **Data Refresh**: Only sync on user request, don't auto-sync

## Error Handling

Common errors:
- **Invalid Credentials**: Check Client ID and Secret
- **Redirect URI Mismatch**: Must exactly match LinkedIn app settings
- **Scope Not Approved**: Some scopes require LinkedIn approval
- **Rate Limiting**: LinkedIn limits API calls

## Production Checklist

- [ ] LinkedIn app approved by LinkedIn
- [ ] Client ID and Secret in production environment variables
- [ ] Production callback URL registered in LinkedIn app
- [ ] HTTPS enabled on production domain
- [ ] Session secret is strong and secure
- [ ] Error handling and logging in place
- [ ] User can disconnect LinkedIn
- [ ] Privacy policy updated to mention LinkedIn data usage

## Alternative: Manual Profile Import

If LinkedIn OAuth is too complex, you could add a simple form to manually enter LinkedIn profile URL, and the user can copy-paste their experience from LinkedIn. This is simpler but requires more user effort.

## Notes

- LinkedIn OAuth can take 3-7 days for app approval
- Some features require "Partner Program" access
- LinkedIn limits API calls (throttling)
- Profile data quality depends on user's LinkedIn completeness
- Consider making this optional (not required for onboarding)

The data structures are ready - just follow these steps when you have LinkedIn OAuth credentials!

