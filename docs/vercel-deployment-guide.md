# 🚀 Deploying to Vercel with Google Cloud Credentials

## ⚠️ SECURITY WARNING

**NEVER commit `stt.json` to GitHub!** This file contains sensitive credentials that would allow anyone to use your Google Cloud account.

## ✅ Safe Deployment Steps

### Step 1: Ensure `.gitignore` is Configured

Make sure `stt.json` is in your `.gitignore`:

```
# .gitignore
stt.json
*.json
!package.json
!package-lock.json
!tsconfig.json
!components.json
```

### Step 2: Convert JSON to Environment Variable

1. Open your `stt.json` file
2. Copy the **entire contents** (it should be a single line of JSON)
3. You'll use this in Vercel's environment variables

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (without `stt.json`)
   ```bash
   git add .
   git commit -m "Add Google Cloud STT integration"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Import Project"
   - Select your GitHub repository

3. **Add Environment Variable**
   - Before deploying, click "Environment Variables"
   - Add a new variable:
     - **Name**: `GOOGLE_CLOUD_CREDENTIALS`
     - **Value**: Paste the entire contents of `stt.json` (the JSON string)
     - **Environments**: Select "Production", "Preview", and "Development"
   - Click "Add"

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

#### Option B: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Add Environment Variable**
   ```bash
   vercel env add GOOGLE_CLOUD_CREDENTIALS
   ```
   - When prompted, paste the entire contents of `stt.json`
   - Select all environments (Production, Preview, Development)

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Step 4: Verify Deployment

1. Visit your deployed site
2. Upload an image
3. Click the microphone button
4. Test voice transcription
5. Check Vercel logs if there are any errors:
   ```bash
   vercel logs
   ```

## 🔐 How It Works

### Development (Local)
```typescript
// Uses the local file
const client = new SpeechClient({
  keyFilename: './stt.json',
});
```

### Production (Vercel)
```typescript
// Uses environment variable
const client = new SpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS),
});
```

The code automatically detects which environment it's in and uses the appropriate method.

## 📋 Checklist Before Deploying

- [ ] `stt.json` is in `.gitignore`
- [ ] `stt.json` is NOT committed to GitHub
- [ ] Environment variable `GOOGLE_CLOUD_CREDENTIALS` is set in Vercel
- [ ] Variable contains the full JSON content from `stt.json`
- [ ] Variable is set for all environments (Production, Preview, Development)
- [ ] Code is pushed to GitHub
- [ ] Deployment is successful
- [ ] Voice transcription works on production site

## 🐛 Troubleshooting

### "Authentication failed" error in production

**Cause**: Environment variable not set correctly

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `GOOGLE_CLOUD_CREDENTIALS` exists
3. Check that the value is valid JSON (copy from `stt.json` again)
4. Redeploy: `vercel --prod` or trigger redeploy in dashboard

### "Cannot find module './stt.json'" in production

**Cause**: Code is trying to use the file in production

**Solution**:
- Verify the API route code uses the environment variable check
- The code should have: `process.env.GOOGLE_CLOUD_CREDENTIALS ? ... : ...`

### Voice transcription works locally but not in production

**Cause**: Environment variable might be malformed

**Solution**:
1. Copy `stt.json` contents again (ensure it's valid JSON)
2. Update the environment variable in Vercel
3. Redeploy

## 🔄 Updating Credentials

If you need to rotate your service account key:

1. **Create new key in Google Cloud Console**
   - Go to IAM & Admin → Service Accounts
   - Select your service account
   - Keys → Add Key → Create New Key → JSON
   - Download the new `stt.json`

2. **Update Vercel environment variable**
   - Vercel Dashboard → Settings → Environment Variables
   - Edit `GOOGLE_CLOUD_CREDENTIALS`
   - Paste new JSON content
   - Save

3. **Redeploy**
   - Trigger a new deployment
   - Old key will be replaced

4. **Delete old key in Google Cloud**
   - Go back to Service Accounts → Keys
   - Delete the old key

## 💰 Cost Management

Monitor your Google Cloud usage:
- Visit Google Cloud Console → Billing
- Set up budget alerts
- Monitor Speech-to-Text API usage
- Consider setting quotas to prevent unexpected charges

## 🔒 Additional Security Best Practices

1. **Restrict Service Account Permissions**
   - Only grant "Speech-to-Text User" role
   - Don't use a service account with broader permissions

2. **Enable API Key Restrictions** (if using API keys)
   - Restrict to specific APIs
   - Restrict to specific domains/IPs

3. **Monitor Usage**
   - Set up Cloud Monitoring alerts
   - Review logs regularly for suspicious activity

4. **Rotate Keys Regularly**
   - Create new service account keys every 90 days
   - Delete old keys after rotation

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Google Cloud Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
