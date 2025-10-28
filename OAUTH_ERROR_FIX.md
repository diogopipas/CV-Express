# Email OAuth 400 Error - Fixed

## Issue
When clicking "Connect Gmail" on the onboarding page, users were getting a 400 error from Google OAuth.

## Root Cause
The OAuth credentials in the `.env` file were set to placeholder values (`test_google_client_id`, `test_microsoft_client_id`), which caused Google's OAuth service to reject the authentication request.

## Changes Made

### 1. Backend Error Handling (`backend/src/routes/emailOAuthRoutes.ts`)
- Added validation to check if OAuth credentials are properly configured
- When placeholder credentials are detected, the backend now redirects to the onboarding page with a clear error message instead of attempting OAuth with invalid credentials

### 2. Frontend Error Handling (`frontend/src/pages/Onboarding.tsx`)
- Added handling for the `oauth_not_configured` error parameter
- Displays user-friendly error message: "Email OAuth is not configured. Please contact the administrator."

## What You Need To Do

### Option 1: Configure Real OAuth Credentials (Recommended for Production)

Follow the detailed guide in `EMAIL_OAUTH_SETUP.md` to:
1. Set up Google OAuth in Google Cloud Console
2. Set up Microsoft OAuth in Azure Portal
3. Update the `.env` file with real credentials
4. Restart the backend server

### Option 2: Skip Email Connection (For Development)

For development purposes, you can:
1. Click "Skip for now" on the onboarding page
2. Continue with the rest of the onboarding process
3. Configure OAuth later when ready

## Testing

After configuring OAuth credentials:
1. Go to `http://localhost:3000/onboarding`
2. Click "Connect Gmail" or "Connect Outlook"
3. You should be redirected to Google/Microsoft login
4. After authorization, you'll be redirected back with a success message

## Files Changed
- `CV-Express/backend/src/routes/emailOAuthRoutes.ts` - Added OAuth configuration checks
- `CV-Express/frontend/src/pages/Onboarding.tsx` - Added error handling for OAuth configuration issues

## New Files Created
- `CV-Express/EMAIL_OAUTH_SETUP.md` - Complete setup guide for OAuth configuration
- `CV-Express/OAUTH_ERROR_FIX.md` - This file
