import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import rateLimit from 'express-rate-limit';

// Load and validate environment variables
dotenv.config();
import { validateEnvironment } from './config/validateEnv.js';
validateEnvironment();

import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
// Use Vercel-compatible routes in production
const recipeRoutes = process.env.VERCEL || process.env.VERCEL_ENV 
  ? await import('./routes/recipes-vercel.js').then(m => m.default)
  : await import('./routes/recipes.js').then(m => m.default);
import mealPlanRoutes from './routes/mealPlans.js';
import shoppingListRoutes from './routes/shoppingLists.js';
import aiRoutes from './routes/ai.js';
import imageAnalysisRoutes from './routes/imageAnalysis.js';
import { sequelize } from './db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'AI request limit exceeded. Please wait before making another request.'
});

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/recipes', authenticate, recipeRoutes);
app.use('/api/meal-plans', authenticate, mealPlanRoutes);
app.use('/api/shopping-lists', authenticate, shoppingListRoutes);
app.use('/api/ai', authenticate, aiLimiter, aiRoutes);
app.use('/api/image', authenticate, imageAnalysisRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ force: false });
    console.log('Database synchronized.');
    
    // Only start the server if not in Vercel environment
    if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
      });
    }
  } catch (error) {
    console.error('Unable to start server:', error);
    // Don't exit in Vercel environment
    if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
      process.exit(1);
    }
  }
}

// Initialize database connection
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  startServer();
} else {
  // For Vercel, just initialize the database
  sequelize.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));
}

export default app;