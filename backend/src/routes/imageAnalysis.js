import express from 'express';
import multer from 'multer';
import imageRecognition from '../services/imageRecognition.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Use memory storage for image processing
const upload = multer({
  storage: multer.memoryStorage(),
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

// Analyze image to identify ingredients and suggest recipes
router.post('/analyze', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert image to base64
    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

    // Analyze the image
    const analysis = await imageRecognition.analyzeImage(dataUri, req.file.mimetype);

    // Get ingredient identification
    const ingredients = await imageRecognition.identifyIngredients(dataUri, req.file.mimetype);

    // Get recipe suggestions based on identified ingredients
    let recipeSuggestions = null;
    if (ingredients.ingredients && ingredients.ingredients.length > 0) {
      // Get user's dietary restrictions if available
      const dietary_restrictions = req.body.dietary_restrictions || [];
      recipeSuggestions = await imageRecognition.suggestRecipesFromIngredients(
        ingredients.ingredients,
        dietary_restrictions
      );
    }

    res.json({
      success: true,
      analysis,
      ingredients,
      recipeSuggestions,
      image: {
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      message: error.message 
    });
  }
});

// Identify ingredients from image
router.post('/identify-ingredients', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

    const ingredients = await imageRecognition.identifyIngredients(dataUri, req.file.mimetype);

    res.json({
      success: true,
      ingredients,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Ingredient identification error:', error);
    res.status(500).json({ 
      error: 'Failed to identify ingredients',
      message: error.message 
    });
  }
});

// Extract recipe from recipe card/image
router.post('/extract-recipe', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

    const recipe = await imageRecognition.extractRecipeFromImage(dataUri, req.file.mimetype);

    res.json({
      success: true,
      recipe,
      source: 'image_extraction',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recipe extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract recipe',
      message: error.message 
    });
  }
});

// Suggest recipes based on ingredients (text-based)
router.post('/suggest-recipes', authenticate, async (req, res) => {
  try {
    const { ingredients, dietary_restrictions } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients list is required' });
    }

    const suggestions = await imageRecognition.suggestRecipesFromIngredients(
      ingredients,
      dietary_restrictions || []
    );

    res.json({
      success: true,
      suggestions,
      ingredient_count: ingredients.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recipe suggestion error:', error);
    res.status(500).json({ 
      error: 'Failed to suggest recipes',
      message: error.message 
    });
  }
});

// Analyze nutritional content from food image
router.post('/analyze-nutrition', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

    const nutrition = await imageRecognition.analyzeNutrition(dataUri, req.file.mimetype);

    res.json({
      success: true,
      nutrition,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Nutrition analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze nutrition',
      message: error.message 
    });
  }
});

export default router;