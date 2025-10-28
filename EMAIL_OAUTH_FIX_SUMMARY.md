# Email OAuth Blank Page Fix

## Issue
Email provider logins (Gmail/Outlook) were showing a blank page during the OAuth flow.

## Root Causes

1. **Missing Environment Variables**: The `.env` file was missing critical OAuth configuration variables:
   - `API_URL` - Backend API URL for OAuth callbacks
   - `FRONTEND_URL` - Frontend URL for redirecting after OAuth
   - `SESSION_SECRET` - Session secret for OAuth state management
   - `ENCRYPTION_KEY` - Key for encrypting stored OAuth tokens

2. **Incorrect Redirect Flow**: The frontend was trying to redirect directly without proper authentication state management.

3. **Relative Redirect URLs**: The OAuth callbacks were using relative URLs instead of absolute URLs, causing redirects to fail.

4. **Deprecated Crypto Methods**: The encryption functions were using deprecated `createCipher` instead of `createCipheriv`.

## Changes Made

### Backend (`CV-Express/backend/src/routes/emailOAuthRoutes.ts`)

1. **Fixed OAuth connect endpoint** to return a redirect URL instead of attempting server-side redirect
2. **Updated callbacks** to use absolute URLs from environment variables
3. **Fixed encryption/decryption** functions to use `createCipheriv` instead of deprecated `createCipher`

### Frontend (`CV-Express/frontend/src/pages/Onboarding.tsx`)

1. **Updated `handleEmailConnect`** to properly make POST request to `/connect` endpoint
2. **Added proper error handling** for OAuth flow
3. **Added loading states** during OAuth initiation

### Environment Configuration (`CV-Express/backend/.env`)

Added required OAuth configuration:
```env
API_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=...
ENCRYPTION_KEY=12345678901234567890123456789012
```

## OAuth Flow (Fixed)

1. User clicks "Connect Gmail" or "Connect Outlook"
2. Frontend makes POST request to `/api/email-oauth/connect` with provider
3. Backend stores user ID in session and returns redirect URL
4. Frontend redirects to OAuth provider (Google/Microsoft)
5. User authorizes the application
6. OAuth provider redirects to `/api/email-oauth/{provider}/callback`
7. Backend validates OAuth data and saves tokens
8. Backend redirects to `${FRONTEND_URL}/onboarding?email_oauth=success`
9. Frontend detects success parameter and updates UI

## Next Steps

To enable email OAuth, you need to:

1. **Set up Google OAuth**:
   - Go to https://console.cloud.google.com/
   - Create OAuth 2.0 credentials
   - Add `http://localhost:5001/api/email-oauth/google/callback` to authorized redirect URIs
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

2. **Set up Microsoft OAuth**:
   - Go to https://portal.azure.com/
   - Register an application in Azure Active Directory
   - Add `http://localhost:5001/api/email-oauth/microsoft/callback` to redirect URIs
   - Add `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` to `.env`

3. **Test the flow**:
   - Start backend: `npm run dev` in `CV-Express/backend`
   - Start frontend: `npm run dev` in `CV-Express/frontend`
   - Go to onboarding page and try connecting email

## Notes

- The blank page issue was caused by incorrect redirect URLs and missing environment configuration
- The fix ensures proper absolute URLs are used throughout the OAuth flow
- All redirects now include the full domain to work correctly
