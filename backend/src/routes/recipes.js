import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { Recipe, FamilyMember } from '../models/index.js';
import { Op } from 'sequelize';
import { uploadSingle } from '../middleware/upload.js';
import path from 'path';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('tags').optional(),
    query('isFavorite').optional().isBoolean(),
    query('isSafe').optional().isBoolean()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      const where = { userId: req.userId };

      if (req.query.search) {
        where[Op.or] = [
          { '$processedRecipe.title$': { [Op.like]: `%${req.query.search}%` } },
          { tags: { [Op.contains]: [req.query.search] } }
        ];
      }

      if (req.query.isFavorite !== undefined) {
        where.isFavorite = req.query.isFavorite === 'true';
      }

      if (req.query.tags) {
        const tagsArray = req.query.tags.split(',');
        where.tags = { [Op.contains]: tagsArray };
      }

      const { count, rows } = await Recipe.findAndCountAll({
        where,
        limit,
        offset,
        order: [['dateSaved', 'DESC']]
      });

      res.json({
        recipes: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/',
  [
    body('originalSource').isObject(),
    body('processedRecipe').isObject(),
    body('aiAnalysis').optional().isObject(),
    body('tags').optional().isArray()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { originalSource, processedRecipe, aiAnalysis, tags } = req.body;

      const recipe = await Recipe.create({
        userId: req.userId,
        originalSource,
        processedRecipe,
        aiAnalysis: aiAnalysis || {},
        tags: tags || []
      });

      res.status(201).json({
        message: 'Recipe saved successfully',
        recipe
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:recipeId', async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({
      where: {
        recipeId: req.params.recipeId,
        userId: req.userId
      }
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    await recipe.incrementViewCount();

    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

router.put('/:recipeId',
  [
    body('processedRecipe').optional().isObject(),
    body('tags').optional().isArray(),
    body('isFavorite').optional().isBoolean(),
    body('rating').optional().isFloat({ min: 1, max: 5 })
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const recipe = await Recipe.findOne({
        where: {
          recipeId: req.params.recipeId,
          userId: req.userId
        }
      });

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      const { processedRecipe, tags, isFavorite, rating } = req.body;

      if (processedRecipe) {
        recipe.processedRecipe = {
          ...recipe.processedRecipe,
          ...processedRecipe
        };
      }
      if (tags !== undefined) recipe.tags = tags;
      if (isFavorite !== undefined) recipe.isFavorite = isFavorite;
      if (rating !== undefined) recipe.rating = rating;

      await recipe.save();

      res.json({
        message: 'Recipe updated successfully',
        recipe
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:recipeId', async (req, res, next) => {
  try {
    const recipe = await Recipe.findOne({
      where: {
        recipeId: req.params.recipeId,
        userId: req.userId
      }
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    await recipe.destroy();

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/upload-image', uploadSingle, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:recipeId/check-safety', async (req, res, next) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: 'Family member ID required' });
    }

    const recipe = await Recipe.findOne({
      where: {
        recipeId: req.params.recipeId,
        userId: req.userId
      }
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const familyMember = await FamilyMember.findOne({
      where: {
        memberId,
        userId: req.userId
      }
    });

    if (!familyMember) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    const safetyAnalysis = analyzeSafety(recipe.processedRecipe, familyMember.dietaryProfile);

    res.json({
      isSafe: safetyAnalysis.isSafe,
      violations: safetyAnalysis.violations,
      suggestions: safetyAnalysis.suggestions
    });
  } catch (error) {
    next(error);
  }
});

function analyzeSafety(recipe, dietaryProfile) {
  const violations = [];
  const suggestions = [];

  for (const ingredient of recipe.ingredients || []) {
    for (const restriction of dietaryProfile.restrictions || []) {
      if (ingredientViolatesRestriction(ingredient, restriction)) {
        violations.push({
          ingredient: ingredient.name,
          restriction: restriction.value,
          type: restriction.type,
          severity: restriction.severity || 'moderate'
        });

        const alternative = findAlternative(ingredient, restriction);
        if (alternative) {
          suggestions.push({
            original: ingredient.name,
            alternative,
            reason: `Contains ${restriction.value}`
          });
        }
      }
    }
  }

  return {
    isSafe: violations.length === 0,
    violations,
    suggestions
  };
}

function ingredientViolatesRestriction(ingredient, restriction) {
  const ingredientLower = ingredient.name.toLowerCase();
  const restrictionLower = restriction.value.toLowerCase();
  
  return ingredientLower.includes(restrictionLower);
}

function findAlternative(ingredient, restriction) {
  const alternatives = {
    'gluten': {
      'flour': 'gluten-free flour',
      'bread': 'gluten-free bread',
      'pasta': 'rice pasta'
    },
    'dairy': {
      'milk': 'almond milk',
      'cheese': 'dairy-free cheese',
      'butter': 'olive oil'
    }
  };

  const restrictionAlts = alternatives[restriction.value.toLowerCase()];
  if (restrictionAlts) {
    for (const [key, alt] of Object.entries(restrictionAlts)) {
      if (ingredient.name.toLowerCase().includes(key)) {
        return alt;
      }
    }
  }

  return null;
}

export default router;