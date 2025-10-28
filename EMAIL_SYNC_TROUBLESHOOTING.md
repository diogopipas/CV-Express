# Email Sync Troubleshooting Guide

## Issue: "Failed to sync emails" Error

This guide will help you diagnose and fix the email synchronization error you're experiencing.

## Quick Diagnosis

I've enhanced the email sync service with better error handling and added a diagnostic endpoint. Here's how to troubleshoot:

### 1. Check Email Connection Status

First, let's diagnose your current email connection:

```bash
# Make a GET request to the diagnostic endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/email-oauth/diagnose
```

This will show you:
- Whether your email is connected
- Token status and expiry
- Environment configuration issues
- Specific problems identified

### 2. Common Causes and Solutions

#### A. OAuth Credentials Not Configured
**Symptoms:** Error mentions "OAuth credentials not configured"

**Solution:**
1. Follow the setup guide in `EMAIL_OAUTH_SETUP.md`
2. Set up Google/Microsoft OAuth applications
3. Update your `.env` file with real credentials:

```env
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
MICROSOFT_CLIENT_ID=your_actual_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_actual_microsoft_client_secret
ENCRYPTION_KEY=your_32_character_encryption_key
```

#### B. Access Token Expired
**Symptoms:** Error mentions "access token expired"

**Solution:**
1. Go to your profile/onboarding page
2. Disconnect your email account
3. Reconnect your email account
4. Try syncing again

#### C. API Permissions Issues
**Symptoms:** Error mentions "API access denied"

**Solution:**
1. Check your OAuth application permissions
2. For Gmail: Ensure Gmail API is enabled and `gmail.readonly` scope is granted
3. For Outlook: Ensure `Mail.Read` permission is granted
4. Re-authorize your email connection

#### D. Network Connectivity Issues
**Symptoms:** Error mentions "unable to connect to API"

**Solution:**
1. Check your internet connection
2. Verify firewall settings
3. Check if your organization blocks API access

### 3. Enhanced Error Messages

The email sync service now provides specific error messages:

- **"Email account not connected"** → Connect your email in onboarding
- **"Email access token not found"** → Reconnect your email account
- **"Gmail/Outlook access token is invalid or expired"** → Reconnect your email account
- **"Gmail/Outlook API access denied"** → Check API permissions
- **"Gmail/Outlook API rate limit exceeded"** → Wait and try again later
- **"Unable to connect to API"** → Check internet connection

### 4. Step-by-Step Fix Process

1. **Check Environment Variables:**
   ```bash
   cd CV-Express/backend
   cat .env | grep -E "(GOOGLE_|MICROSOFT_|ENCRYPTION_)"
   ```

2. **Restart Backend Server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Test Email Connection:**
   - Go to `http://localhost:3000/onboarding`
   - Try connecting your email again
   - Check for any error messages

4. **Test Email Sync:**
   - Go to the Resumes/Inbox page
   - Click the sync button
   - Check the error message for specific details

### 5. Development Mode (Skip Email)

If you want to continue development without email sync:

1. Click "Skip for now" on the onboarding page
2. Complete the rest of the onboarding process
3. Configure email OAuth later when ready

### 6. Testing the Fix

After applying fixes:

1. **Test OAuth Connection:**
   ```bash
   # Test Google OAuth
   curl -X POST http://localhost:5001/api/email-oauth/connect \
        -H "Content-Type: application/json" \
        -d '{"provider": "gmail"}'
   ```

2. **Test Email Sync:**
   ```bash
   # Test sync (requires authentication)
   curl -X POST http://localhost:5001/api/email-oauth/sync \
        -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Files Modified

- `backend/src/services/emailSyncService.ts` - Enhanced error handling and token refresh logic
- `backend/src/routes/emailOAuthRoutes.ts` - Added diagnostic endpoint

## Next Steps

1. Check your `.env` file configuration
2. Set up OAuth credentials if not already done
3. Test the diagnostic endpoint
4. Try email sync again
5. If issues persist, check the backend logs for specific error details

## Support

If you continue to experience issues:
1. Check the backend console logs for detailed error messages
2. Use the diagnostic endpoint to identify specific problems
3. Verify all environment variables are properly set
4. Ensure OAuth applications are correctly configured
