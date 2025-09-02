import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { Recipe, FamilyMember } from '../models/index.js';
import { Op } from 'sequelize';
import multer from 'multer';

const router = express.Router();

// Use memory storage for Vercel (serverless can't write to disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Image upload endpoint - returns base64 for Vercel
router.post('/upload-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Convert to base64 for storage in database or return to client
    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;
    
    // In production, you might want to upload to a service like Cloudinary or S3
    // For now, we'll return the base64 data URI
    res.json({
      imageUrl: dataUri,
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Get all recipes with pagination
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
        order: [['dateSaved', 'DESC']],
        attributes: ['recipeId', 'processedRecipe', 'tags', 'isFavorite', 'viewCount', 'rating', 'dateSaved']
      });

      res.json({
        recipes: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Create new recipe
router.post('/',
  [
    body('originalSource').notEmpty(),
    body('processedRecipe').notEmpty(),
    body('tags').optional().isArray()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const recipe = await Recipe.create({
        ...req.body,
        userId: req.userId
      });

      res.status(201).json(recipe);
    } catch (error) {
      next(error);
    }
  }
);

// Get single recipe
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

    // Update view count
    await recipe.increment('viewCount');
    await recipe.update({ lastViewed: new Date() });

    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// Update recipe
router.put('/:recipeId',
  [
    body('processedRecipe').optional(),
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

      await recipe.update(req.body);

      res.json(recipe);
    } catch (error) {
      next(error);
    }
  }
);

// Delete recipe
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

export default router;