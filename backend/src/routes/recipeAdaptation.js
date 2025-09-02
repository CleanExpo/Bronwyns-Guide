import express from 'express';
import healthAdaptation from '../services/healthAdaptation.js';
import { authenticate as authenticateToken } from '../middleware/auth.js';
import supabaseDb from '../db/supabase.js';

const router = express.Router();

/**
 * POST /api/adapt/recipe
 * Adapt a recipe based on user's health profile
 */
router.post('/recipe', authenticateToken, async (req, res) => {
  try {
    const { recipe, healthProfile: providedProfile } = req.body;
    const userId = req.user.userId;

    // Get health profile from database or use provided one
    let healthProfile = providedProfile;
    
    if (!healthProfile && supabaseDb.isConfigured()) {
      try {
        // Try to fetch from Supabase
        const profileData = await supabaseDb.users.findById(userId);
        if (profileData && profileData.health_profile) {
          healthProfile = profileData.health_profile;
        }
      } catch (error) {
        console.log('Could not fetch profile from Supabase:', error.message);
      }
    }

    // If still no profile, return error
    if (!healthProfile) {
      return res.status(400).json({
        success: false,
        error: 'Health profile is required for recipe adaptation'
      });
    }

    // Adapt the recipe
    const adaptation = await healthAdaptation.adaptRecipeForHealth(recipe, healthProfile);

    res.json({
      success: true,
      adaptation
    });
  } catch (error) {
    console.error('Recipe adaptation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to adapt recipe'
    });
  }
});

/**
 * POST /api/adapt/validate
 * Validate if a recipe is safe for user's health profile
 */
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { recipe, healthProfile } = req.body;

    if (!healthProfile) {
      return res.status(400).json({
        success: false,
        error: 'Health profile is required'
      });
    }

    const validation = healthAdaptation.validateRecipeSafety(recipe, healthProfile);

    res.json({
      success: true,
      validation
    });
  } catch (error) {
    console.error('Recipe validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate recipe'
    });
  }
});

/**
 * POST /api/adapt/ingredients
 * Get alternative ingredients for a specific ingredient
 */
router.post('/ingredients', authenticateToken, async (req, res) => {
  try {
    const { ingredient, healthProfile } = req.body;

    if (!healthProfile) {
      return res.status(400).json({
        success: false,
        error: 'Health profile is required'
      });
    }

    const alternatives = healthAdaptation.getIngredientAlternatives(ingredient, healthProfile);

    res.json({
      success: true,
      ingredient,
      alternatives
    });
  } catch (error) {
    console.error('Ingredient alternatives error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ingredient alternatives'
    });
  }
});

/**
 * POST /api/adapt/analyze-image
 * Analyze a food image and adapt based on health profile
 */
router.post('/analyze-image', authenticateToken, async (req, res) => {
  try {
    const { imageUrl, healthProfile } = req.body;
    
    if (!imageUrl || !healthProfile) {
      return res.status(400).json({
        success: false,
        error: 'Image URL and health profile are required'
      });
    }

    // First, identify ingredients in the image
    const identificationResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/image/identify-ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization
      },
      body: JSON.stringify({ imageUrl })
    });

    const identificationData = await identificationResponse.json();
    
    if (!identificationData.success) {
      throw new Error('Failed to identify ingredients');
    }

    // Create a recipe object from identified ingredients
    const recipe = {
      title: identificationData.dishName || 'Analyzed Dish',
      ingredients: identificationData.ingredients.map(ing => 
        `${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim()
      )
    };

    // Adapt the recipe based on health profile
    const adaptation = await healthAdaptation.adaptRecipeForHealth(recipe, healthProfile);

    res.json({
      success: true,
      originalAnalysis: identificationData,
      adaptation,
      healthCompliant: adaptation.isCompliant,
      safetyScore: adaptation.safetyScore
    });
  } catch (error) {
    console.error('Image analysis adaptation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze and adapt image'
    });
  }
});

export default router;