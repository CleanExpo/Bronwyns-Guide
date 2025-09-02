import express from 'express';
import { body, validationResult } from 'express-validator';
import { AIInteraction, FamilyMember, Recipe } from '../models/index.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key'
});

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/analyze-recipe',
  [
    body('imageUrl').optional().isURL(),
    body('text').optional().isString(),
    body('url').optional().isURL()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    const startTime = Date.now();
    
    try {
      const { imageUrl, text, url } = req.body;

      if (!imageUrl && !text && !url) {
        return res.status(400).json({ 
          error: 'Please provide either an image URL, text, or recipe URL' 
        });
      }

      const prompt = constructRecipeAnalysisPrompt(imageUrl, text, url);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a dietary expert specializing in recipe analysis and modification for people with dietary restrictions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const analysis = JSON.parse(completion.choices[0].message.content);

      const aiInteraction = await AIInteraction.create({
        userId: req.userId,
        type: 'recipe-analysis',
        input: { imageUrl, text, url },
        output: analysis,
        modelVersion: 'gpt-4-vision-preview',
        processingTime: Date.now() - startTime,
        tokenCount: completion.usage?.total_tokens
      });

      res.json({
        analysis,
        interactionId: aiInteraction.interactionId
      });
    } catch (error) {
      await AIInteraction.create({
        userId: req.userId,
        type: 'recipe-analysis',
        input: req.body,
        isSuccessful: false,
        errorMessage: error.message,
        processingTime: Date.now() - startTime
      });
      
      next(error);
    }
  }
);

router.post('/modify-recipe',
  [
    body('recipeId').notEmpty(),
    body('memberId').notEmpty()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    const startTime = Date.now();
    
    try {
      const { recipeId, memberId } = req.body;

      const recipe = await Recipe.findOne({
        where: { recipeId, userId: req.userId }
      });

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      const familyMember = await FamilyMember.findOne({
        where: { memberId, userId: req.userId }
      });

      if (!familyMember) {
        return res.status(404).json({ error: 'Family member not found' });
      }

      const prompt = constructModificationPrompt(recipe.processedRecipe, familyMember.dietaryProfile);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a dietary expert specializing in modifying recipes for people with specific dietary restrictions and medical conditions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const modifiedRecipe = JSON.parse(completion.choices[0].message.content);

      const aiInteraction = await AIInteraction.create({
        userId: req.userId,
        type: 'modification-suggestion',
        input: { recipeId, memberId, dietaryProfile: familyMember.dietaryProfile },
        output: modifiedRecipe,
        modelVersion: 'gpt-4',
        processingTime: Date.now() - startTime,
        tokenCount: completion.usage?.total_tokens
      });

      res.json({
        modifiedRecipe,
        interactionId: aiInteraction.interactionId
      });
    } catch (error) {
      await AIInteraction.create({
        userId: req.userId,
        type: 'modification-suggestion',
        input: req.body,
        isSuccessful: false,
        errorMessage: error.message,
        processingTime: Date.now() - startTime
      });
      
      next(error);
    }
  }
);

router.post('/generate-meal-plan',
  [
    body('memberId').notEmpty(),
    body('days').isInt({ min: 1, max: 30 }),
    body('preferences').optional().isObject()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    const startTime = Date.now();
    
    try {
      const { memberId, days, preferences } = req.body;

      const familyMember = await FamilyMember.findOne({
        where: { memberId, userId: req.userId }
      });

      if (!familyMember) {
        return res.status(404).json({ error: 'Family member not found' });
      }

      const prompt = constructMealPlanPrompt(familyMember, days, preferences);

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a nutritionist creating meal plans for people with specific dietary restrictions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.8
      });

      const mealPlan = JSON.parse(completion.choices[0].message.content);

      const aiInteraction = await AIInteraction.create({
        userId: req.userId,
        type: 'meal-planning',
        input: { memberId, days, preferences },
        output: mealPlan,
        modelVersion: 'gpt-4',
        processingTime: Date.now() - startTime,
        tokenCount: completion.usage?.total_tokens
      });

      res.json({
        mealPlan,
        interactionId: aiInteraction.interactionId
      });
    } catch (error) {
      await AIInteraction.create({
        userId: req.userId,
        type: 'meal-planning',
        input: req.body,
        isSuccessful: false,
        errorMessage: error.message,
        processingTime: Date.now() - startTime
      });
      
      next(error);
    }
  }
);

router.post('/interactions/:interactionId/feedback',
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('helpful').isBoolean(),
    body('comments').optional().isString()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const interaction = await AIInteraction.findOne({
        where: {
          interactionId: req.params.interactionId,
          userId: req.userId
        }
      });

      if (!interaction) {
        return res.status(404).json({ error: 'Interaction not found' });
      }

      const { rating, helpful, comments } = req.body;
      await interaction.addFeedback(rating, helpful, comments);

      res.json({
        message: 'Feedback recorded successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

function constructRecipeAnalysisPrompt(imageUrl, text, url) {
  let prompt = 'Analyze this recipe and extract the following information in JSON format:\n';
  prompt += '- title\n';
  prompt += '- ingredients (array with name, quantity, unit)\n';
  prompt += '- instructions (array of steps)\n';
  prompt += '- prepTime and cookTime\n';
  prompt += '- servings\n';
  prompt += '- detectedMethods (cooking methods used)\n';
  prompt += '- nutritionalEstimate (calories, protein, carbs, fat per serving)\n\n';

  if (imageUrl) {
    prompt += `Image URL: ${imageUrl}\n`;
  }
  if (text) {
    prompt += `Recipe text:\n${text}\n`;
  }
  if (url) {
    prompt += `Recipe URL: ${url}\n`;
  }

  prompt += '\nReturn only valid JSON.';
  return prompt;
}

function constructModificationPrompt(recipe, dietaryProfile) {
  let prompt = `Modify this recipe to be safe for someone with the following dietary restrictions:\n\n`;
  
  prompt += 'Medical Conditions:\n';
  dietaryProfile.conditions.forEach(c => {
    prompt += `- ${c.name}: ${c.description || ''}\n`;
  });

  prompt += '\nDietary Restrictions:\n';
  dietaryProfile.restrictions.forEach(r => {
    prompt += `- ${r.type}: ${r.value} (severity: ${r.severity || 'moderate'})\n`;
  });

  prompt += '\nOriginal Recipe:\n';
  prompt += JSON.stringify(recipe, null, 2);

  prompt += '\n\nProvide a modified version of the recipe in JSON format with:\n';
  prompt += '- All unsafe ingredients replaced or removed\n';
  prompt += '- A modifications array listing all changes made\n';
  prompt += '- isSafe: true if the modified recipe is safe\n';
  prompt += '- validationScore: confidence score 0-100\n';
  prompt += '\nReturn only valid JSON.';

  return prompt;
}

function constructMealPlanPrompt(familyMember, days, preferences) {
  let prompt = `Create a ${days}-day meal plan for ${familyMember.name} with these dietary requirements:\n\n`;
  
  prompt += 'Dietary Profile:\n';
  prompt += JSON.stringify(familyMember.dietaryProfile, null, 2);

  if (preferences) {
    prompt += '\n\nPreferences:\n';
    prompt += JSON.stringify(preferences, null, 2);
  }

  prompt += '\n\nGenerate a meal plan in JSON format with:\n';
  prompt += '- meals: array of objects with date, mealType (breakfast/lunch/dinner), recipe title, and brief description\n';
  prompt += '- All meals must be safe for the dietary restrictions\n';
  prompt += '- Include variety and balanced nutrition\n';
  prompt += '\nReturn only valid JSON.';

  return prompt;
}

export default router;