import aiProvider from './aiProviders.js';

/**
 * Health-Aware Recipe Adaptation Service
 * Core functionality for personalizing recipes based on health profiles
 */

// Comprehensive substitution database for common health conditions
const HEALTH_SUBSTITUTIONS = {
  // Crohn's Disease & IBD
  "Crohn's Disease": {
    avoid: [
      'raw vegetables', 'nuts', 'seeds', 'whole grains', 'popcorn', 
      'beans', 'lentils', 'high-fiber foods', 'spicy foods', 'dairy',
      'fried foods', 'carbonated drinks', 'alcohol', 'caffeine'
    ],
    substitutions: {
      'whole wheat flour': 'white flour or rice flour',
      'brown rice': 'white rice',
      'raw vegetables': 'well-cooked, peeled vegetables',
      'milk': 'lactose-free milk or oat milk',
      'beans': 'tofu or chicken',
      'nuts': 'smooth nut butters in small amounts',
      'spicy peppers': 'mild herbs like basil or oregano',
      'onions': 'fennel or leeks (well-cooked)',
      'garlic': 'garlic-infused oil',
      'butter': 'olive oil or coconut oil'
    }
  },
  
  // Celiac Disease
  "Celiac Disease": {
    avoid: [
      'wheat', 'barley', 'rye', 'malt', 'wheat flour', 'bread crumbs',
      'pasta', 'couscous', 'beer', 'soy sauce', 'seitan'
    ],
    substitutions: {
      'wheat flour': 'gluten-free flour blend (rice, tapioca, potato starch)',
      'pasta': 'rice pasta or gluten-free pasta',
      'bread crumbs': 'gluten-free breadcrumbs or crushed rice crackers',
      'soy sauce': 'tamari or coconut aminos',
      'couscous': 'quinoa or rice',
      'beer': 'gluten-free beer or wine',
      'regular oats': 'certified gluten-free oats'
    }
  },
  
  // IBS
  "IBS (Irritable Bowel Syndrome)": {
    avoid: [
      'onions', 'garlic', 'wheat', 'dairy', 'beans', 'lentils',
      'apples', 'pears', 'stone fruits', 'artificial sweeteners',
      'high-fructose corn syrup', 'cabbage', 'broccoli'
    ],
    substitutions: {
      'onions': 'green onion tops (green part only)',
      'garlic': 'garlic-infused oil',
      'wheat bread': 'sourdough or gluten-free bread',
      'milk': 'lactose-free milk or almond milk',
      'apples': 'oranges or strawberries',
      'beans': 'firm tofu or tempeh',
      'honey': 'maple syrup',
      'yogurt': 'lactose-free yogurt'
    }
  },
  
  // Diabetes
  "Diabetes (Type 1 or 2)": {
    avoid: [
      'sugar', 'white bread', 'white rice', 'sugary drinks',
      'processed foods', 'fruit juice', 'candy', 'pastries'
    ],
    substitutions: {
      'sugar': 'stevia, erythritol, or monk fruit sweetener',
      'white rice': 'cauliflower rice or brown rice (smaller portions)',
      'white bread': 'whole grain or low-carb bread',
      'pasta': 'zucchini noodles or shirataki noodles',
      'potatoes': 'cauliflower or turnips',
      'fruit juice': 'whole fruit or flavored water',
      'flour': 'almond flour or coconut flour'
    }
  },
  
  // Kidney Disease
  "Kidney Disease": {
    avoid: [
      'high sodium foods', 'processed meats', 'canned foods',
      'potatoes', 'tomatoes', 'oranges', 'bananas', 'nuts',
      'whole grains', 'dairy', 'dark sodas'
    ],
    substitutions: {
      'salt': 'herbs and spices (without salt)',
      'potatoes': 'cauliflower or turnips',
      'tomato sauce': 'red pepper sauce',
      'oranges': 'apples or berries',
      'milk': 'rice milk or almond milk',
      'whole wheat': 'white bread or rice',
      'cheese': 'small amounts of cream cheese'
    }
  },
  
  // GERD
  "GERD (Acid Reflux)": {
    avoid: [
      'tomatoes', 'citrus', 'chocolate', 'coffee', 'mint',
      'spicy foods', 'fried foods', 'onions', 'garlic', 'alcohol'
    ],
    substitutions: {
      'tomato sauce': 'white sauce or pesto (without garlic)',
      'orange juice': 'apple juice or pear juice',
      'coffee': 'herbal tea or chicory coffee',
      'chocolate': 'carob',
      'vinegar': 'small amounts of apple cider vinegar',
      'fried foods': 'baked or grilled alternatives',
      'mint': 'basil or parsley'
    }
  },
  
  // FND (Functional Neurological Disorder)
  "FND (Functional Neurological Disorder)": {
    avoid: [
      'caffeine', 'alcohol', 'processed foods', 'high sugar foods',
      'artificial additives', 'MSG'
    ],
    substitutions: {
      'coffee': 'decaf coffee or herbal tea',
      'energy drinks': 'coconut water or green tea',
      'processed snacks': 'fresh fruits and vegetables',
      'sugary cereals': 'oatmeal with berries'
    }
  }
};

// Allergy substitutions
const ALLERGY_SUBSTITUTIONS = {
  'milk': {
    substitutes: ['oat milk', 'almond milk', 'soy milk', 'coconut milk', 'rice milk'],
    baking: 'non-dairy milk + 1 tsp vinegar for buttermilk substitute'
  },
  'eggs': {
    substitutes: ['flax eggs (1 tbsp ground flax + 3 tbsp water per egg)', 'chia eggs', 'applesauce (1/4 cup per egg)', 'mashed banana'],
    baking: 'commercial egg replacer'
  },
  'peanuts': {
    substitutes: ['sunflower seed butter', 'almond butter', 'cashew butter', 'tahini'],
    notes: 'Check for tree nut allergies as well'
  },
  'tree nuts': {
    substitutes: ['seeds (sunflower, pumpkin)', 'roasted chickpeas', 'granola (nut-free)'],
    notes: 'Many people with tree nut allergies can tolerate coconut'
  },
  'wheat': {
    substitutes: ['rice flour', 'oat flour', 'almond flour', 'coconut flour', 'cassava flour'],
    notes: 'Use gluten-free flour blends for best baking results'
  },
  'soy': {
    substitutes: ['coconut aminos instead of soy sauce', 'chickpea tofu', 'hemp milk'],
    notes: 'Check labels for hidden soy (lecithin, vegetable oil)'
  },
  'shellfish': {
    substitutes: ['fish (if not allergic)', 'chicken', 'mushrooms for umami flavor'],
    notes: 'Avoid fish sauce and worcestershire sauce'
  },
  'fish': {
    substitutes: ['chicken', 'tofu', 'hearts of palm for texture'],
    notes: 'Use seaweed for ocean flavor in dishes'
  }
};

// Dietary preference adaptations
const DIETARY_ADAPTATIONS = {
  'vegetarian': {
    substitutions: {
      'chicken': 'tofu, tempeh, or seitan',
      'beef': 'mushrooms, lentils, or plant-based ground',
      'fish': 'hearts of palm or banana blossom',
      'chicken broth': 'vegetable broth',
      'gelatin': 'agar agar',
      'fish sauce': 'soy sauce or mushroom sauce'
    }
  },
  'vegan': {
    substitutions: {
      'meat': 'tofu, tempeh, seitan, or legumes',
      'dairy': 'plant-based alternatives',
      'eggs': 'flax eggs or commercial replacer',
      'honey': 'maple syrup or agave',
      'butter': 'vegan butter or coconut oil',
      'cheese': 'nutritional yeast or vegan cheese'
    }
  },
  'low-sodium': {
    substitutions: {
      'salt': 'herbs, spices, lemon juice, vinegar',
      'soy sauce': 'low-sodium soy sauce or coconut aminos',
      'canned goods': 'fresh or frozen alternatives',
      'processed meats': 'fresh meats or plant proteins'
    }
  },
  'low-carb': {
    substitutions: {
      'pasta': 'zucchini noodles or shirataki noodles',
      'rice': 'cauliflower rice',
      'bread': 'lettuce wraps or low-carb tortillas',
      'potatoes': 'cauliflower or radishes',
      'sugar': 'stevia or erythritol'
    }
  }
};

class HealthAdaptationService {
  /**
   * Analyze a recipe and adapt it based on health profile
   */
  async adaptRecipeForHealth(recipe, healthProfile) {
    const adaptations = {
      originalRecipe: recipe,
      healthConsiderations: [],
      substitutions: [],
      warnings: [],
      alternativeIngredients: {},
      safetyScore: 100,
      isCompliant: true
    };

    // Check each health condition
    for (const condition of healthProfile.healthConditions || []) {
      const rules = HEALTH_SUBSTITUTIONS[condition];
      if (rules) {
        adaptations.healthConsiderations.push({
          condition,
          restrictions: rules.avoid
        });

        // Check each ingredient against restrictions
        for (const ingredient of recipe.ingredients || []) {
          const ingredientLower = ingredient.toLowerCase();
          
          // Check if ingredient should be avoided
          for (const avoidItem of rules.avoid) {
            if (ingredientLower.includes(avoidItem.toLowerCase())) {
              adaptations.warnings.push({
                ingredient,
                reason: `Contains ${avoidItem} which should be avoided with ${condition}`,
                severity: 'high'
              });
              adaptations.safetyScore -= 20;
              adaptations.isCompliant = false;

              // Find substitution
              for (const [original, substitute] of Object.entries(rules.substitutions)) {
                if (ingredientLower.includes(original.toLowerCase())) {
                  adaptations.substitutions.push({
                    original: ingredient,
                    substitute,
                    reason: condition
                  });
                  adaptations.alternativeIngredients[ingredient] = substitute;
                  break;
                }
              }
            }
          }
        }
      }
    }

    // Check allergies
    for (const allergy of healthProfile.allergies || []) {
      const allergyRules = ALLERGY_SUBSTITUTIONS[allergy.toLowerCase()];
      if (allergyRules) {
        for (const ingredient of recipe.ingredients || []) {
          if (ingredient.toLowerCase().includes(allergy.toLowerCase())) {
            adaptations.warnings.push({
              ingredient,
              reason: `Contains ${allergy} allergen`,
              severity: 'critical'
            });
            adaptations.safetyScore -= 30;
            adaptations.isCompliant = false;

            adaptations.substitutions.push({
              original: ingredient,
              substitute: allergyRules.substitutes[0],
              alternatives: allergyRules.substitutes,
              reason: `${allergy} allergy`
            });
          }
        }
      }
    }

    // Check dietary preferences
    for (const preference of healthProfile.dietaryPreferences || []) {
      const prefRules = DIETARY_ADAPTATIONS[preference.toLowerCase()];
      if (prefRules) {
        for (const ingredient of recipe.ingredients || []) {
          const ingredientLower = ingredient.toLowerCase();
          for (const [original, substitute] of Object.entries(prefRules.substitutions)) {
            if (ingredientLower.includes(original.toLowerCase())) {
              adaptations.substitutions.push({
                original: ingredient,
                substitute,
                reason: `${preference} diet`
              });
              if (!adaptations.alternativeIngredients[ingredient]) {
                adaptations.alternativeIngredients[ingredient] = substitute;
              }
            }
          }
        }
      }
    }

    // Generate adapted recipe with AI if needed
    if (!adaptations.isCompliant && adaptations.substitutions.length > 0) {
      adaptations.adaptedRecipe = await this.generateAdaptedRecipe(
        recipe, 
        adaptations.substitutions,
        healthProfile
      );
    }

    // Add safety recommendations
    adaptations.recommendations = this.generateSafetyRecommendations(adaptations);

    return adaptations;
  }

  /**
   * Generate an adapted recipe using AI
   */
  async generateAdaptedRecipe(originalRecipe, substitutions, healthProfile) {
    const prompt = `
      You are a medical nutrition expert helping someone with the following health profile:
      - Conditions: ${healthProfile.healthConditions.join(', ')}
      - Allergies: ${healthProfile.allergies.join(', ')}
      - Dietary Preferences: ${healthProfile.dietaryPreferences.join(', ')}
      
      Original Recipe: ${JSON.stringify(originalRecipe.title)}
      Original Ingredients: ${originalRecipe.ingredients.join(', ')}
      
      Required Substitutions:
      ${substitutions.map(s => `- Replace "${s.original}" with "${s.substitute}" (Reason: ${s.reason})`).join('\n')}
      
      Please create an adapted version of this recipe that:
      1. Is completely safe for this person's health conditions
      2. Maintains similar taste and texture where possible
      3. Includes clear cooking modifications if needed
      4. Provides nutritional benefits for their conditions
      
      Format the response as JSON with:
      - title: adapted recipe name
      - ingredients: list of ingredients with substitutions applied
      - instructions: modified cooking instructions
      - nutritionalBenefits: how this helps their conditions
      - tips: additional safety tips
    `;

    try {
      const response = await aiProvider.generateText(prompt, {
        model: 'medical',
        temperature: 0.3,
        responseFormat: 'json'
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating adapted recipe:', error);
      return null;
    }
  }

  /**
   * Generate safety recommendations based on analysis
   */
  generateSafetyRecommendations(adaptations) {
    const recommendations = [];

    if (adaptations.safetyScore < 50) {
      recommendations.push({
        type: 'warning',
        message: 'This recipe requires significant modifications for your health profile'
      });
    }

    if (adaptations.warnings.some(w => w.severity === 'critical')) {
      recommendations.push({
        type: 'critical',
        message: 'This recipe contains allergens that must be substituted'
      });
    }

    if (adaptations.substitutions.length > 5) {
      recommendations.push({
        type: 'info',
        message: 'Consider finding recipes specifically designed for your dietary needs'
      });
    }

    if (adaptations.isCompliant) {
      recommendations.push({
        type: 'success',
        message: 'This recipe is safe for your health profile'
      });
    }

    return recommendations;
  }

  /**
   * Get personalized ingredient alternatives
   */
  getIngredientAlternatives(ingredient, healthProfile) {
    const alternatives = [];

    // Check each condition for specific substitutions
    for (const condition of healthProfile.healthConditions || []) {
      const rules = HEALTH_SUBSTITUTIONS[condition];
      if (rules && rules.substitutions[ingredient.toLowerCase()]) {
        alternatives.push({
          substitute: rules.substitutions[ingredient.toLowerCase()],
          reason: condition,
          priority: 'high'
        });
      }
    }

    // Check allergies
    for (const allergy of healthProfile.allergies || []) {
      if (ingredient.toLowerCase().includes(allergy.toLowerCase())) {
        const allergyRules = ALLERGY_SUBSTITUTIONS[allergy.toLowerCase()];
        if (allergyRules) {
          allergyRules.substitutes.forEach(sub => {
            alternatives.push({
              substitute: sub,
              reason: `${allergy} allergy`,
              priority: 'critical'
            });
          });
        }
      }
    }

    // Check dietary preferences
    for (const preference of healthProfile.dietaryPreferences || []) {
      const prefRules = DIETARY_ADAPTATIONS[preference.toLowerCase()];
      if (prefRules && prefRules.substitutions[ingredient.toLowerCase()]) {
        alternatives.push({
          substitute: prefRules.substitutions[ingredient.toLowerCase()],
          reason: preference,
          priority: 'medium'
        });
      }
    }

    // Sort by priority
    return alternatives.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Validate if a recipe is safe for a health profile
   */
  validateRecipeSafety(recipe, healthProfile) {
    const validation = {
      isSafe: true,
      risks: [],
      score: 100
    };

    // Check against all conditions
    for (const condition of healthProfile.healthConditions || []) {
      const rules = HEALTH_SUBSTITUTIONS[condition];
      if (rules) {
        for (const ingredient of recipe.ingredients || []) {
          for (const avoidItem of rules.avoid) {
            if (ingredient.toLowerCase().includes(avoidItem.toLowerCase())) {
              validation.isSafe = false;
              validation.risks.push({
                ingredient,
                risk: avoidItem,
                condition,
                severity: 'high'
              });
              validation.score -= 20;
            }
          }
        }
      }
    }

    // Check allergies (most critical)
    for (const allergy of healthProfile.allergies || []) {
      for (const ingredient of recipe.ingredients || []) {
        if (ingredient.toLowerCase().includes(allergy.toLowerCase())) {
          validation.isSafe = false;
          validation.risks.push({
            ingredient,
            risk: allergy,
            condition: 'Allergy',
            severity: 'critical'
          });
          validation.score -= 40;
        }
      }
    }

    validation.score = Math.max(0, validation.score);
    return validation;
  }
}

export default new HealthAdaptationService();