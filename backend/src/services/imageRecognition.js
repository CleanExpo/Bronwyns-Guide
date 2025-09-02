import aiProvider from './aiProviders.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Analyze an image to identify ingredients, food items, or recipes
 */
export async function analyzeImage(imageBase64, mimeType = 'image/jpeg') {
  try {
    const prompt = "Analyze this image and identify: 1) What food items or ingredients are visible 2) What dish this might be 3) Potential recipes that could be made with these ingredients. Return as JSON.";
    
    const result = await aiProvider.analyzeImage(imageBase64, prompt, {
      maxTokens: 1000
    });

    const content = result.text;
    
    // Try to parse as JSON, fallback to structured text parsing
    try {
      return JSON.parse(content);
    } catch (e) {
      // Parse the text response into structured data
      return parseTextResponse(content);
    }
  } catch (error) {
    console.error('Image analysis error:', error);
    throw new Error('Failed to analyze image');
  }
}

/**
 * Identify ingredients from an image
 */
export async function identifyIngredients(imageBase64, mimeType = 'image/jpeg') {
  try {
    const prompt = `You are an expert at identifying food ingredients from images.
    
    Identify all ingredients visible in this image. 
    Return a JSON object with:
    {
      "ingredients": ["ingredient1", "ingredient2", ...],
      "quantities": {"ingredient1": "estimated amount", ...},
      "freshness": "fresh/good/needs to be used soon",
      "category": "produce/meat/dairy/pantry/mixed",
      "confidence": 0.0-1.0
    }`;
    
    const result = await aiProvider.analyzeImage(imageBase64, prompt, {
      maxTokens: 500
    });

    const content = result.text;
    return JSON.parse(content);
  } catch (error) {
    console.error('Ingredient identification error:', error);
    throw new Error('Failed to identify ingredients');
  }
}

/**
 * Extract recipe from a recipe card/image
 */
export async function extractRecipeFromImage(imageBase64, mimeType = 'image/jpeg') {
  try {
    const prompt = `You are an expert at extracting recipe information from images of recipe cards, cookbooks, or handwritten recipes.
    
    Extract the complete recipe from this image. 
    Return a JSON object with:
    {
      "title": "recipe name",
      "ingredients": [{"item": "name", "amount": "quantity", "unit": "unit"}],
      "instructions": ["step 1", "step 2", ...],
      "prepTime": "minutes",
      "cookTime": "minutes",
      "servings": number,
      "difficulty": "easy/medium/hard",
      "cuisine": "type of cuisine",
      "dietary": ["vegetarian", "gluten-free", etc],
      "nutrition": {"calories": number, "protein": "g", ...}
    }`;
    
    const result = await aiProvider.analyzeImage(imageBase64, prompt, {
      maxTokens: 1500
    });

    const content = result.text;
    return JSON.parse(content);
  } catch (error) {
    console.error('Recipe extraction error:', error);
    throw new Error('Failed to extract recipe from image');
  }
}

/**
 * Suggest recipes based on identified ingredients
 */
export async function suggestRecipesFromIngredients(ingredients, dietary_restrictions = []) {
  try {
    // Use the specialized recipe generation method from aiProvider
    const result = await aiProvider.generateRecipeSuggestions(
      ingredients,
      dietary_restrictions
    );
    
    // If result is already parsed JSON, return it
    if (typeof result === 'object') {
      return result;
    }
    
    // Otherwise parse the text response
    return JSON.parse(result);
  } catch (error) {
    console.error('Recipe suggestion error:', error);
    throw new Error('Failed to suggest recipes');
  }
}

/**
 * Analyze nutritional content from food image
 */
export async function analyzeNutrition(imageBase64, mimeType = 'image/jpeg') {
  try {
    const prompt = `You are a nutritionist expert at estimating nutritional content from food images.
    
    Analyze the nutritional content of this food. 
    Estimate and return:
    {
      "dish_name": "identified dish",
      "serving_size": "estimated portion",
      "calories": number,
      "macros": {
        "protein": "grams",
        "carbs": "grams",
        "fat": "grams",
        "fiber": "grams",
        "sugar": "grams"
      },
      "vitamins": ["notable vitamins"],
      "minerals": ["notable minerals"],
      "health_rating": 1-10,
      "dietary_flags": ["high-protein", "low-carb", etc],
      "allergens": ["potential allergens"],
      "suitable_for_conditions": ["Crohn's safe", "Diabetes friendly", etc]
    }`;
    
    const result = await aiProvider.analyzeImage(imageBase64, prompt, {
      maxTokens: 800
    });

    const content = result.text;
    return JSON.parse(content);
  } catch (error) {
    console.error('Nutrition analysis error:', error);
    throw new Error('Failed to analyze nutrition');
  }
}

/**
 * Helper function to parse text responses into structured data
 */
function parseTextResponse(text) {
  const result = {
    identified_items: [],
    potential_dish: '',
    suggested_recipes: [],
    raw_analysis: text
  };

  // Extract patterns from text
  const lines = text.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.toLowerCase().includes('ingredient') || trimmed.toLowerCase().includes('item')) {
      currentSection = 'ingredients';
    } else if (trimmed.toLowerCase().includes('dish') || trimmed.toLowerCase().includes('recipe')) {
      currentSection = 'dish';
    } else if (trimmed.toLowerCase().includes('suggest')) {
      currentSection = 'suggestions';
    }

    if (currentSection === 'ingredients' && trimmed.startsWith('-')) {
      result.identified_items.push(trimmed.substring(1).trim());
    } else if (currentSection === 'dish' && trimmed && !trimmed.includes(':')) {
      result.potential_dish = trimmed;
    } else if (currentSection === 'suggestions' && trimmed.startsWith('-')) {
      result.suggested_recipes.push(trimmed.substring(1).trim());
    }
  }

  return result;
}

export default {
  analyzeImage,
  identifyIngredients,
  extractRecipeFromImage,
  suggestRecipesFromIngredients,
  analyzeNutrition
};