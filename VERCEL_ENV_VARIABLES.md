# Required Vercel Environment Variables

## ✅ Variables You Have:
- `OPENAI_API_KEY` - For AI recipe analysis
- `SUPABASE_DB_URL` - PostgreSQL connection string  
- `DATABASE_PASSWORD` - Database password (redundant if using SUPABASE_DB_URL)
- `NODE_ENV` - Set to "production"
- `SUPABASE_ANON_KEY` - Public Supabase key
- `SUPABASE_URL` - Your Supabase project URL
- `JWT_SECRET` - For authentication tokens

## 🔴 Missing Critical Variables:
```
SUPABASE_SERVICE_KEY=[your-service-role-key]
FRONTEND_URL=https://[your-project].vercel.app
PORT=3000
```

## 🟡 Optional but Recommended:
```
CORS_ORIGIN=https://[your-project].vercel.app
MAX_FILE_SIZE=10485760
RATE_LIMIT_MAX_REQUESTS=100
```

## Complete Variable List for Vercel:

### Required (Add these):
1. **SUPABASE_SERVICE_KEY**
   - Get from Supabase Dashboard → Settings → API
   - Required for backend operations
   - Keep this SECRET!

2. **FRONTEND_URL** 
   - Your Vercel app URL
   - Example: `https://bronwyns-guide.vercel.app`

### Your Current Variables (Keep as is):
- **OPENAI_API_KEY** ✅
- **SUPABASE_DB_URL** ✅
- **SUPABASE_URL** ✅
- **SUPABASE_ANON_KEY** ✅
- **JWT_SECRET** ✅
- **NODE_ENV** = production ✅
- **DATABASE_PASSWORD** ✅ (already in SUPABASE_DB_URL)

## Vercel Settings Format:
```
NODE_ENV=production
SUPABASE_URL=https://lmrbgyhftmtvvmflheiq.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_KEY=eyJ...your-service-key
SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.lmrbgyhftmtvvmflheiq.supabase.co:5432/postgres
JWT_SECRET=your-32-char-secret
OPENAI_API_KEY=sk-...your-openai-key
FRONTEND_URL=https://your-app.vercel.app
PORT=3000
```

This is sufficient for a working prototype! 🚀