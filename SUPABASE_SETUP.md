# Supabase Setup Guide for Bronwyn's Guide App

## 🚀 Getting Your Supabase Credentials

Since you have the Supabase URL: `https://lmrbgyhftmtvvmflheiq.supabase.co`

### 1. Access Your Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (the one with URL ending in `lmrbgyhftmtvvmflheiq`)

### 2. Get Your API Keys

Navigate to **Settings** → **API** in your Supabase dashboard:

- **Project URL**: `https://lmrbgyhftmtvvmflheiq.supabase.co`
- **Anon/Public Key**: Copy the `anon` key (safe for frontend)
- **Service Role Key**: Copy the `service_role` key (backend only - keep secret!)

### 3. Get Database Connection String

Navigate to **Settings** → **Database**:

1. Find "Connection string" section
2. Copy the "URI" connection string
3. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.lmrbgyhftmtvvmflheiq.supabase.co:5432/postgres`
4. Replace `[YOUR-PASSWORD]` with your database password

## 📦 Setting Up the Database Schema

### Option 1: Using Supabase SQL Editor (Recommended)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `backend/src/db/supabase-schema.sql`
4. Paste and click "Run"
5. Your tables will be created!

### Option 2: Using Migration

```bash
# In your project directory
cd backend
npx sequelize-cli db:migrate
```

## 🔧 Configure Your Application

### 1. Create Environment File

Copy `.env.supabase.example` to `.env`:

```bash
cp .env.supabase.example .env
```

### 2. Update Environment Variables

Edit `.env` with your Supabase credentials:

```env
# Your Supabase Project
SUPABASE_URL=https://lmrbgyhftmtvvmflheiq.supabase.co
SUPABASE_ANON_KEY=eyJ... (your anon key)
SUPABASE_SERVICE_KEY=eyJ... (your service key)

# Database Connection
SUPABASE_DB_URL=postgresql://postgres:YOUR_PASSWORD@db.lmrbgyhftmtvvmflheiq.supabase.co:5432/postgres

# Your App Secret (generate a secure random string)
JWT_SECRET=your-secure-random-string-here
```

### 3. Update Database Configuration

The app is already configured to use Supabase when `SUPABASE_DB_URL` is present!

## 🚀 Deploy to Vercel with Supabase

### 1. Add Environment Variables in Vercel

Go to your Vercel project settings and add:

```
SUPABASE_URL=https://lmrbgyhftmtvvmflheiq.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_DB_URL=your-database-url
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### 2. Redeploy

```bash
vercel --prod
```

## 🔒 Security Best Practices

### Row Level Security (RLS)

The schema includes RLS policies. To enable them:

1. Go to **Authentication** → **Policies** in Supabase
2. Enable RLS for each table
3. The policies ensure users can only see their own data

### API Keys Security

- **Never expose** `SUPABASE_SERVICE_KEY` in frontend code
- **Only use** `SUPABASE_ANON_KEY` in frontend
- **Keep** database password secure

## 📊 Using Supabase Features

### Real-time Subscriptions (Optional)

```javascript
// Listen to recipe changes
const subscription = supabase
  .from('Recipe')
  .on('INSERT', payload => {
    console.log('New recipe!', payload)
  })
  .subscribe()
```

### File Storage (Optional)

Instead of local uploads, use Supabase Storage:

1. Go to **Storage** in Supabase Dashboard
2. Create a bucket called `recipe-images`
3. Update upload code to use Supabase Storage

```javascript
const { data, error } = await supabase.storage
  .from('recipe-images')
  .upload(`${userId}/${fileName}`, file)
```

## 🧪 Testing the Connection

### Test Locally

```bash
cd backend
npm run dev
```

Check the console for "Database connection established successfully"

### Test Query

```javascript
// Test in your app
const { data, error } = await supabase
  .from('User')
  .select('*')
  .limit(1)

console.log('Connection test:', data, error)
```

## 📈 Monitoring

### Database Metrics

- Go to **Database** → **Reports** in Supabase
- Monitor query performance
- Check storage usage

### API Metrics

- Go to **API** → **Metrics**
- Monitor request counts
- Check rate limits

## 🆘 Troubleshooting

### Connection Refused

- Check if database password is correct
- Verify IP is not blocked (check Supabase connection pooler)

### Authentication Issues

- Ensure RLS policies are correct
- Check if JWT secret matches

### Performance Issues

- Add indexes for frequently queried columns
- Use connection pooling for high traffic

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Sequelize with PostgreSQL](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

Your Supabase project `lmrbgyhftmtvvmflheiq` is ready to power your Bronwyn's Guide app! 🎉