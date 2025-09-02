import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    // SECURITY: Authentication bypass removed - all environments require proper auth

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    // Validate JWT secret exists and is strong enough
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      console.error('SECURITY WARNING: JWT_SECRET is missing or too weak');
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          error: 'Server configuration error',
          message: 'Authentication service is not properly configured'
        });
      }
    }
    
    const decoded = jwt.verify(token, jwtSecret || 'development-only-secret-change-in-production');
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new Error();
    }

    user.lastActive = new Date();
    await user.save({ fields: ['lastActive'] });

    req.user = user;
    req.userId = user.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

export const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  
  return jwt.sign(
    { userId },
    jwtSecret || 'development-only-secret-change-in-production',
    { expiresIn: '7d' }
  );
};