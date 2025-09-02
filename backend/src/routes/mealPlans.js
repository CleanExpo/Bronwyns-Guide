import express from 'express';
import { body, validationResult } from 'express-validator';
import { MealPlan, FamilyMember, Recipe } from '../models/index.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/', async (req, res, next) => {
  try {
    const mealPlans = await MealPlan.findAll({
      where: { userId: req.userId },
      include: [{
        model: FamilyMember,
        as: 'FamilyMember'
      }],
      order: [['startDate', 'DESC']]
    });

    res.json(mealPlans);
  } catch (error) {
    next(error);
  }
});

router.post('/',
  [
    body('name').notEmpty().trim(),
    body('ownerMemberId').notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').optional().isISO8601(),
    body('meals').isArray()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, description, ownerMemberId, startDate, endDate, meals } = req.body;

      const familyMember = await FamilyMember.findOne({
        where: {
          memberId: ownerMemberId,
          userId: req.userId
        }
      });

      if (!familyMember) {
        return res.status(404).json({ error: 'Family member not found' });
      }

      const mealPlan = await MealPlan.create({
        userId: req.userId,
        name,
        description,
        ownerMemberId,
        startDate,
        endDate,
        meals: meals || []
      });

      res.status(201).json({
        message: 'Meal plan created successfully',
        mealPlan
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:planId', async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findOne({
      where: {
        planId: req.params.planId,
        userId: req.userId
      },
      include: [{
        model: FamilyMember,
        as: 'FamilyMember'
      }]
    });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    const mealsWithRecipes = await Promise.all(
      mealPlan.meals.map(async (meal) => {
        const recipe = await Recipe.findByPk(meal.recipeId);
        return {
          ...meal,
          recipe: recipe ? recipe.processedRecipe : null
        };
      })
    );

    res.json({
      ...mealPlan.toJSON(),
      meals: mealsWithRecipes
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:planId',
  [
    body('name').optional().trim(),
    body('description').optional(),
    body('meals').optional().isArray(),
    body('status').optional().isIn(['draft', 'active', 'completed', 'archived'])
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const mealPlan = await MealPlan.findOne({
        where: {
          planId: req.params.planId,
          userId: req.userId
        }
      });

      if (!mealPlan) {
        return res.status(404).json({ error: 'Meal plan not found' });
      }

      const { name, description, meals, status } = req.body;

      if (name) mealPlan.name = name;
      if (description !== undefined) mealPlan.description = description;
      if (meals) mealPlan.meals = meals;
      if (status) mealPlan.status = status;

      await mealPlan.updateCompletionRate();

      res.json({
        message: 'Meal plan updated successfully',
        mealPlan
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:planId', async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findOne({
      where: {
        planId: req.params.planId,
        userId: req.userId
      }
    });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    await mealPlan.destroy();

    res.json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.put('/:planId/meals/:mealIndex/complete', async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findOne({
      where: {
        planId: req.params.planId,
        userId: req.userId
      }
    });

    if (!mealPlan) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    const mealIndex = parseInt(req.params.mealIndex);
    if (mealIndex < 0 || mealIndex >= mealPlan.meals.length) {
      return res.status(400).json({ error: 'Invalid meal index' });
    }

    const meals = [...mealPlan.meals];
    meals[mealIndex].isCompleted = true;
    mealPlan.meals = meals;

    await mealPlan.updateCompletionRate();

    res.json({
      message: 'Meal marked as complete',
      mealPlan
    });
  } catch (error) {
    next(error);
  }
});

export default router;