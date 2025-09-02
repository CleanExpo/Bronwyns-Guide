import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const user = await User.create({
        email,
        password,
        firstName,
        lastName
      });

      const token = generateToken(user.userId);

      res.status(201).json({
        message: 'User created successfully',
        user: user.toJSON(),
        token
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      user.lastActive = new Date();
      await user.save({ fields: ['lastActive'] });

      const token = generateToken(user.userId);

      res.json({
        message: 'Login successful',
        user: user.toJSON(),
        token
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json({ 
          message: 'If an account exists with this email, a reset link has been sent' 
        });
      }

      res.json({ 
        message: 'If an account exists with this email, a reset link has been sent' 
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;