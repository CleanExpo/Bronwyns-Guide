import express from 'express';
import { body, validationResult } from 'express-validator';
import { User, FamilyMember } from '../models/index.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{
        model: FamilyMember,
        as: 'familyMembers',
        where: { isActive: true },
        required: false
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.toJSON());
  } catch (error) {
    next(error);
  }
});

router.put('/profile',
  [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('preferences').optional().isObject()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { firstName, lastName, preferences } = req.body;

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (preferences) user.preferences = { ...user.preferences, ...preferences };

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/family-members', async (req, res, next) => {
  try {
    const familyMembers = await FamilyMember.findAll({
      where: { 
        userId: req.userId,
        isActive: true
      }
    });

    res.json(familyMembers);
  } catch (error) {
    next(error);
  }
});

router.post('/family-members',
  [
    body('name').notEmpty().trim(),
    body('relationship').notEmpty().trim(),
    body('dietaryProfile').isObject()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, relationship, dietaryProfile, notes } = req.body;

      const familyMember = await FamilyMember.create({
        userId: req.userId,
        name,
        relationship,
        dietaryProfile,
        notes
      });

      res.status(201).json({
        message: 'Family member added successfully',
        familyMember
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/family-members/:memberId', async (req, res, next) => {
  try {
    const familyMember = await FamilyMember.findOne({
      where: {
        memberId: req.params.memberId,
        userId: req.userId
      }
    });

    if (!familyMember) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    res.json(familyMember);
  } catch (error) {
    next(error);
  }
});

router.put('/family-members/:memberId',
  [
    body('name').optional().trim(),
    body('relationship').optional().trim(),
    body('dietaryProfile').optional().isObject(),
    body('notes').optional()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const familyMember = await FamilyMember.findOne({
        where: {
          memberId: req.params.memberId,
          userId: req.userId
        }
      });

      if (!familyMember) {
        return res.status(404).json({ error: 'Family member not found' });
      }

      const { name, relationship, dietaryProfile, notes } = req.body;

      if (name) familyMember.name = name;
      if (relationship) familyMember.relationship = relationship;
      if (dietaryProfile) {
        familyMember.dietaryProfile = {
          ...familyMember.dietaryProfile,
          ...dietaryProfile
        };
      }
      if (notes !== undefined) familyMember.notes = notes;

      await familyMember.save();

      res.json({
        message: 'Family member updated successfully',
        familyMember
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/family-members/:memberId', async (req, res, next) => {
  try {
    const familyMember = await FamilyMember.findOne({
      where: {
        memberId: req.params.memberId,
        userId: req.userId
      }
    });

    if (!familyMember) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    familyMember.isActive = false;
    await familyMember.save();

    res.json({ message: 'Family member removed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;