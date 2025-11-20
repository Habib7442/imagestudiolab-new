# Google OAuth Setup Guide for ImageStudioLab

## Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project (or select existing)**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it: `ImageStudioLab`
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" (unless you have a Google Workspace)
   - Click "Create"
   - Fill in the required fields:
     - App name: `ImageStudioLab`
     - User support email: Your email
     - Developer contact email: Your email
   - Click "Save and Continue"
   - Skip "Scopes" (click "Save and Continue")
   - Add test users if needed (your email)
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: `ImageStudioLab Web Client`
   - **Authorized JavaScript origins**: Leave empty for now
   - **Authorized redirect URIs**: We'll add this from Supabase in the next step
   - Click "Create"
   - **SAVE** the Client ID and Client Secret (you'll need these)

---

## Step 2: Configure Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your `imagestudiolab` project

2. **Navigate to Authentication Settings**
   - Click "Authentication" in the left sidebar
   - Click "Providers"
   - Find "Google" in the list

3. **Enable Google Provider**
   - Toggle "Enable Sign in with Google" to ON
   - You'll see a **Callback URL** like:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
   - **Copy this URL** - you'll need it for Google Cloud Console

4. **Add Google Credentials to Supabase**
   - Paste your **Google Client ID** from Step 1
   - Paste your **Google Client Secret** from Step 1
   - Click "Save"

---

## Step 3: Update Google Cloud Console with Supabase Callback

1. **Go back to Google Cloud Console**
   - Navigate to "APIs & Services" > "Credentials"
   - Click on your OAuth 2.0 Client ID

2. **Add Authorized Redirect URI**
   - Under "Authorized redirect URIs", click "Add URI"
   - Paste the Supabase callback URL from Step 2.3:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
   - Click "Save"

---

## Step 4: Update Environment Variables

Add the following to your `.env.local` file (if not already present):

```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, update `NEXT_PUBLIC_SITE_URL` to your actual domain.

---

## Step 5: Test the Integration

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login`

3. Click "Continue with Google"

4. You should be redirected to Google's OAuth consent screen

5. After authorizing, you'll be redirected back to your app

---

## Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in Google Cloud Console **exactly matches** the Supabase callback URL
- Check for trailing slashes or http vs https

### "Access Blocked" Error
- Make sure you've added your email as a test user in the OAuth consent screen
- Or publish your app (move from "Testing" to "In Production")

### User Not Created in Supabase
- Check Supabase logs in the Dashboard > Logs
- Verify that the Google provider is enabled

---

## Next Steps

Once Google OAuth is working:
- Consider adding other providers (GitHub, Discord, etc.)
- Customize the user profile with additional metadata
- Set up email templates in Supabase for password resets
