/**
 * Vercel Serverless Function Entry Point
 * This file handles all API requests in the Vercel environment
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://bronwyns-guide.vercel.app',
      'https://bronwyns-guide-app.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Bronwyn\'s Guide API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    database: 'checking...',
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      openrouter: !!(process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_GPT_KEY),
      supabase: !!process.env.SUPABASE_URL
    }
  };
  
  // Check database connection
  try {
    const { sequelize } = require('../backend/src/db/database');
    sequelize.authenticate()
      .then(() => {
        healthCheck.database = 'connected';
        res.json(healthCheck);
      })
      .catch(err => {
        healthCheck.database = 'disconnected';
        healthCheck.error = err.message;
        res.status(503).json(healthCheck);
      });
  } catch (error) {
    healthCheck.database = 'error';
    healthCheck.error = error.message;
    res.status(503).json(healthCheck);
  }
});

// Import and use routes
try {
  // Auth routes
  const authRoutes = require('../backend/src/routes/auth');
  app.use('/api/auth', authRoutes);

  // Recipe routes (Vercel-compatible version)
  const recipeRoutes = require('../backend/src/routes/recipes-vercel');
  app.use('/api/recipes', recipeRoutes);

  // Family members routes
  const familyRoutes = require('../backend/src/routes/familyMembers');
  app.use('/api/family-members', familyRoutes);

  // Meal plans routes
  const mealPlanRoutes = require('../backend/src/routes/mealPlans');
  app.use('/api/meal-plans', mealPlanRoutes);

  // Shopping lists routes
  const shoppingListRoutes = require('../backend/src/routes/shoppingLists');
  app.use('/api/shopping-lists', shoppingListRoutes);

  // AI routes
  const aiRoutes = require('../backend/src/routes/ai');
  app.use('/api/ai', aiRoutes);

  // Image analysis routes
  const imageRoutes = require('../backend/src/routes/image');
  app.use('/api/image', imageRoutes);

} catch (error) {
  console.error('Error loading routes:', error);
  app.get('/api/*', (req, res) => {
    res.status(500).json({
      error: 'Routes initialization failed',
      message: error.message,
      path: req.path
    });
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS policy violation',
      message: 'Origin not allowed',
      origin: req.headers.origin
    });
  }
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'File size exceeds the maximum limit of 10MB'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: err.message,
      details: err.errors
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Token expired'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      '/api/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/recipes',
      '/api/family-members',
      '/api/meal-plans',
      '/api/shopping-lists',
      '/api/ai/analyze-recipe',
      '/api/image/analyze'
    ]
  });
});

// Export for Vercel
module.exports = app;