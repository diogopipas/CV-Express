# Email OAuth Setup Guide

## Overview
This guide will help you set up Google and Microsoft OAuth for the email integration feature.

## Current Issue
When you try to connect Gmail or Outlook on the onboarding page, you're getting a 400 error because the OAuth credentials are not properly configured.

## Solution

### Step 1: Set Up Google OAuth

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (or select existing one)
   - Click on "Select a project" → "New Project"
   - Enter project name (e.g., "CV-Express")
   - Click "Create"

3. **Enable Gmail API**
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - Choose "External" for user type
     - Fill in required information:
       - App name: CV-Express
       - User support email: Your email
       - Developer contact: Your email
     - Add scopes: `https://www.googleapis.com/auth/gmail.readonly`
     - Add test users (for development)
     - Save and continue
   
   - For OAuth client ID:
     - Application type: "Web application"
     - Name: "CV-Express Web Client"
     - Authorized redirect URIs:
       - `http://localhost:5001/api/email-oauth/google/callback`
       - Add your production URL when deploying
     - Click "Create"

5. **Copy Credentials**
   - You'll see a popup with Client ID and Client Secret
   - Copy both values

### Step 2: Set Up Microsoft OAuth

1. **Go to Azure Portal**
   - Visit: https://portal.azure.com/
   - Sign in with your Microsoft account

2. **Register an Application**
   - Go to "Azure Active Directory" → "App registrations"
   - Click "+ New registration"
   - Fill in:
     - Name: CV-Express
     - Supported account types: **Personal Microsoft accounts only** (for consumer accounts)
     - Redirect URI: 
       - Platform: Web
       - URI: `http://localhost:5001/api/email-oauth/microsoft/callback`
   - Click "Register"

3. **Configure API Permissions**
   - Go to "API permissions"
   - Click "+ Add a permission"
   - Select "Microsoft Graph"
   - Choose "Delegated permissions"
   - Add the following permissions:
     - `User.Read`
     - `Mail.Read`
   - Click "Add permissions"
   - Click "Grant admin consent" (if you have admin rights)

4. **Create Client Secret**
   - Go to "Certificates & secrets"
   - Click "+ New client secret"
   - Add description (e.g., "CV-Express Secret")
   - Select expiration (recommended: 24 months)
   - Click "Add"
   - **Copy the secret value immediately** (you won't be able to see it again)

5. **Copy Application (Client) ID**
   - On the "Overview" page, copy the "Application (client) ID"

### Step 3: Update Environment Variables

1. **Open the `.env` file** in the backend directory:
   ```bash
   cd CV-Express/backend
   nano .env
   ```

2. **Update the following values**:
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here

   # Microsoft OAuth
   MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
   MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here

   # Make sure these are also set
   API_URL=http://localhost:5001
   FRONTEND_URL=http://localhost:3000
   SESSION_SECRET=your_session_secret_here
   ENCRYPTION_KEY=your_32_character_encryption_key_here
   ```

3. **Replace the placeholder values** with the actual credentials you copied

### Step 4: Restart the Backend Server

1. **Stop the current server** (if running)
   - Press `Ctrl+C` in the terminal

2. **Restart the server**:
   ```bash
   npm run dev
   ```

### Step 5: Test the OAuth Flow

1. **Go to the Onboarding page** on your frontend (usually `http://localhost:3000/onboarding`)

2. **Click "Connect Gmail" or "Connect Outlook"**

3. **You should now see**:
   - Google/Microsoft OAuth login page
   - Request for permissions
   - Success message after authorization

## Troubleshooting

### Still getting 400 error?
- Make sure the `.env` file was saved correctly
- Verify you restarted the backend server after updating `.env`
- Check that the credentials don't have extra spaces or quotes
- Verify the redirect URIs in Google/Microsoft console match exactly

### OAuth consent screen showing "Unverified"?
- This is normal for development
- Add yourself as a test user in the OAuth consent screen
- In production, you'll need to verify the app with Google/Microsoft

### "redirect_uri_mismatch" error?
- Check that the redirect URIs in your OAuth settings exactly match:
  - `http://localhost:5001/api/email-oauth/google/callback` (Google)
  - `http://localhost:5001/api/email-oauth/microsoft/callback` (Microsoft)
- Make sure there are no trailing slashes or extra characters

## Production Deployment

When deploying to production, you'll need to:
1. Update the authorized redirect URIs in Google/Microsoft to use your production URL
2. Update the `API_URL` and `FRONTEND_URL` in the `.env` file
3. Ensure your production domain is verified in Google/Microsoft
4. Submit your app for verification (if requesting sensitive scopes)

## Security Notes

- **Never commit the `.env` file** to version control
- Keep your OAuth credentials secure
- Rotate secrets periodically
- Use environment variables in production deployment systems
