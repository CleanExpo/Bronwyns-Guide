# Deploy to GitHub and Vercel - Step by Step Guide

## 🚀 GitHub Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository with these settings:
   - Repository name: `bronwyns-guide-app`
   - Description: "Mobile-first dietary management app for tracking recipes and managing dietary restrictions"
   - Public or Private (your choice)
   - DO NOT initialize with README (we already have one)
   - DO NOT add .gitignore (we already have one)

### 2. Push to GitHub

After creating the repository, run these commands in your terminal:

```bash
# Navigate to project directory
cd "D:\Bronwyns Personal Chief\Seemless-Architecture\bronwyns-guide-app"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/bronwyns-guide-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 📦 Vercel Deployment

### 1. Connect to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your `bronwyns-guide-app` repository

### 2. Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `cd frontend-new && npm install && npm run build`
- **Output Directory**: `frontend-new/dist`
- **Install Command**: `npm install`

### 3. Environment Variables

Add these environment variables in Vercel dashboard:

```env
# Required
NODE_ENV=production
JWT_SECRET=generate-a-secure-random-string-here
DATABASE_URL=file:./data/bronwyns-guide.db

# Optional (add if you have OpenAI API key)
OPENAI_API_KEY=your-openai-api-key

# Frontend URL (update after first deploy)
FRONTEND_URL=https://your-app-name.vercel.app
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## 🔧 Post-Deployment Setup

### Update Environment Variables

After your first deployment, update these:

1. In Vercel dashboard, update `FRONTEND_URL` with your actual Vercel URL
2. Redeploy for changes to take effect

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## 📱 Testing Your Deployed App

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Test on mobile device
3. Try the image upload feature
4. Add to home screen for PWA experience

## 🛠️ Troubleshooting

### If build fails:

1. Check build logs in Vercel dashboard
2. Common issues:
   - Missing dependencies: Add to package.json
   - TypeScript errors: Fix or add `// @ts-ignore`
   - Build timeout: Optimize build process

### If API doesn't work:

1. Check environment variables are set
2. Verify CORS settings
3. Check API routes in vercel.json

### Database Issues:

For production, consider using:
- Vercel Postgres
- PlanetScale
- Supabase

## 📝 Quick Commands Reference

```bash
# Local development
cd backend && npm run dev
cd frontend-new && npm run dev

# Build for production
cd frontend-new && npm run build

# Deploy to Vercel (after initial setup)
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## 🎉 Success Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel account connected
- [ ] Project imported to Vercel
- [ ] Environment variables configured
- [ ] First deployment successful
- [ ] Mobile testing completed
- [ ] Image upload working

## 📧 Need Help?

- Vercel Documentation: https://vercel.com/docs
- GitHub Documentation: https://docs.github.com
- Open an issue on GitHub for app-specific questions

---

Good luck with your deployment! 🚀