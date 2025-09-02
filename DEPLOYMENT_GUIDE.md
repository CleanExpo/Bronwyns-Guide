# Deployment Guide for Bronwyn's Guide App

## Prerequisites
- GitHub account
- Vercel account
- Supabase project (already created: `lmrbgyhftmtvvmflheiq`)
- Node.js 18+ installed locally

## Step 1: Supabase Setup

### 1.1 Run Database Schema
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project (`lmrbgyhftmtvvmflheiq`)
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy contents from `backend/src/db/supabase-schema-simple.sql`
6. Paste and click **Run**
7. Verify tables were created in **Table Editor**

### 1.2 Get Supabase Credentials
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL**: `https://lmrbgyhftmtvvmflheiq.supabase.co`
   - **Anon/Public Key**: (starts with `eyJ...`)
   - **Service Role Key**: (starts with `eyJ...`) - KEEP SECRET!

3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password

## Step 2: Prepare for GitHub

### 2.1 Update Production Environment
1. Copy `.env.production` to `.env` (for local testing)
2. Update with your actual credentials:
```env
SUPABASE_URL=https://lmrbgyhftmtvvmflheiq.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_KEY=your-actual-service-key
SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.lmrbgyhftmtvvmflheiq.supabase.co:5432/postgres
JWT_SECRET=generate-secure-32-char-string
```

### 2.2 Generate JWT Secret
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Push to GitHub

### 3.1 Initialize Git Repository
```bash
cd bronwyns-guide-app
git init
git add .
git commit -m "Initial commit: Bronwyn's Guide dietary management app"
```

### 3.2 Create GitHub Repository
1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `bronwyns-guide-app`
3. Keep it private if sensitive
4. Don't initialize with README (we have one)

### 3.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/bronwyns-guide-app.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### 4.1 Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Select `bronwyns-guide-app`

### 4.2 Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4.3 Set Environment Variables
Click **Environment Variables** and add:

```
SUPABASE_URL=https://lmrbgyhftmtvvmflheiq.supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_KEY=[your-service-key]
SUPABASE_DB_URL=[your-connection-string]
JWT_SECRET=[your-jwt-secret]
NODE_ENV=production
FRONTEND_URL=https://[your-project].vercel.app
```

### 4.4 Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Your app will be live at `https://[your-project].vercel.app`

## Step 5: Post-Deployment

### 5.1 Update CORS Settings
1. In your Vercel project settings
2. Update the frontend URL in environment variables
3. Redeploy if needed

### 5.2 Enable Row Level Security (Optional)
In Supabase SQL Editor:
```sql
-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Recipe" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShoppingList" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIInteraction" ENABLE ROW LEVEL SECURITY;
```

### 5.3 Test Your Deployment
1. Visit your Vercel URL
2. Test user registration
3. Test recipe upload with image
4. Verify data saves to Supabase

## Step 6: Monitoring

### 6.1 Vercel Analytics
- Go to your project → Analytics
- Monitor performance and errors

### 6.2 Supabase Monitoring
- Check **Database** → **Reports** for query performance
- Monitor **API** → **Metrics** for usage

### 6.3 Error Tracking (Optional)
Consider adding Sentry for error tracking:
```bash
npm install @sentry/react @sentry/node
```

## Troubleshooting

### Database Connection Issues
- Verify Supabase password is correct
- Check if connection pooler is enabled
- Ensure SSL is configured properly

### Build Failures
- Check Vercel build logs
- Verify all environment variables are set
- Ensure Node version compatibility

### CORS Errors
- Update FRONTEND_URL in environment variables
- Check CORS_ORIGIN matches your domain
- Redeploy after changes

### Performance Issues
- Enable Vercel Edge Functions for API routes
- Use Supabase connection pooling
- Implement caching strategies

## Maintenance

### Update Dependencies
```bash
npm update
npm audit fix
```

### Database Migrations
1. Create migration file in `backend/src/db/migrations/`
2. Run in Supabase SQL Editor
3. Update models if needed

### Backup Strategy
- Supabase automatically backs up data
- Export data regularly via Dashboard
- Keep schema files in version control

## Security Checklist
- [ ] Environment variables set in Vercel (not in code)
- [ ] Service keys never exposed to frontend
- [ ] JWT secret is strong and unique
- [ ] RLS policies enabled in production
- [ ] HTTPS enforced on all endpoints
- [ ] Rate limiting configured
- [ ] Input validation on all forms
- [ ] SQL injection prevention via ORM

## Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

## Quick Deploy Commands

```bash
# Local Development
npm run dev

# Build for Production
npm run build

# Deploy to Vercel
vercel --prod

# Check Deployment Status
vercel ls

# View Logs
vercel logs [deployment-url]
```

Your app is now ready for production! 🚀