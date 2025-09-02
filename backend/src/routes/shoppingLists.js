import express from 'express';
import { body, validationResult } from 'express-validator';
import { ShoppingList, MealPlan, Recipe } from '../models/index.js';

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
    const shoppingLists = await ShoppingList.findAll({
      where: { userId: req.userId },
      include: [{
        model: MealPlan,
        as: 'MealPlan'
      }],
      order: [['generatedDate', 'DESC']]
    });

    res.json(shoppingLists);
  } catch (error) {
    next(error);
  }
});

router.post('/generate',
  [body('mealPlanId').notEmpty()],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { mealPlanId } = req.body;

      const mealPlan = await MealPlan.findOne({
        where: {
          planId: mealPlanId,
          userId: req.userId
        }
      });

      if (!mealPlan) {
        return res.status(404).json({ error: 'Meal plan not found' });
      }

      const ingredientMap = new Map();

      for (const meal of mealPlan.meals) {
        const recipe = await Recipe.findByPk(meal.recipeId);
        if (recipe && recipe.processedRecipe) {
          for (const ingredient of recipe.processedRecipe.ingredients) {
            const key = ingredient.name.toLowerCase();
            
            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key);
              existing.sourceRecipes.push(meal.recipeId);
              existing.quantity = combineQuantities(existing.quantity, ingredient.quantity);
            } else {
              ingredientMap.set(key, {
                ingredientName: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit || '',
                category: categorizeIngredient(ingredient.name),
                isPurchased: false,
                sourceRecipes: [meal.recipeId]
              });
            }
          }
        }
      }

      const items = Array.from(ingredientMap.values());
      items.sort((a, b) => a.category.localeCompare(b.category));

      const shoppingList = await ShoppingList.create({
        userId: req.userId,
        name: `Shopping List for ${mealPlan.name}`,
        sourceMealPlanId: mealPlanId,
        items,
        status: 'draft'
      });

      res.status(201).json({
        message: 'Shopping list generated successfully',
        shoppingList
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:listId', async (req, res, next) => {
  try {
    const shoppingList = await ShoppingList.findOne({
      where: {
        listId: req.params.listId,
        userId: req.userId
      },
      include: [{
        model: MealPlan,
        as: 'MealPlan'
      }]
    });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    res.json(shoppingList);
  } catch (error) {
    next(error);
  }
});

router.put('/:listId',
  [
    body('name').optional().trim(),
    body('items').optional().isArray(),
    body('status').optional().isIn(['draft', 'active', 'completed', 'archived']),
    body('shoppingDate').optional().isISO8601()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const shoppingList = await ShoppingList.findOne({
        where: {
          listId: req.params.listId,
          userId: req.userId
        }
      });

      if (!shoppingList) {
        return res.status(404).json({ error: 'Shopping list not found' });
      }

      const { name, items, status, shoppingDate } = req.body;

      if (name) shoppingList.name = name;
      if (items) shoppingList.items = items;
      if (status) shoppingList.status = status;
      if (shoppingDate) shoppingList.shoppingDate = shoppingDate;

      await shoppingList.updateCompletionRate();

      res.json({
        message: 'Shopping list updated successfully',
        shoppingList
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:listId/items/:itemIndex/toggle', async (req, res, next) => {
  try {
    const shoppingList = await ShoppingList.findOne({
      where: {
        listId: req.params.listId,
        userId: req.userId
      }
    });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    const itemIndex = parseInt(req.params.itemIndex);
    if (itemIndex < 0 || itemIndex >= shoppingList.items.length) {
      return res.status(400).json({ error: 'Invalid item index' });
    }

    const items = [...shoppingList.items];
    items[itemIndex].isPurchased = !items[itemIndex].isPurchased;
    shoppingList.items = items;

    await shoppingList.updateCompletionRate();

    res.json({
      message: 'Item toggled successfully',
      shoppingList
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:listId', async (req, res, next) => {
  try {
    const shoppingList = await ShoppingList.findOne({
      where: {
        listId: req.params.listId,
        userId: req.userId
      }
    });

    if (!shoppingList) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    await shoppingList.destroy();

    res.json({ message: 'Shopping list deleted successfully' });
  } catch (error) {
    next(error);
  }
});

function categorizeIngredient(ingredientName) {
  const categories = {
    'produce': ['tomato', 'lettuce', 'carrot', 'apple', 'banana', 'onion', 'garlic', 'potato'],
    'meat': ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna'],
    'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'eggs'],
    'grains': ['rice', 'pasta', 'bread', 'flour', 'oats', 'cereal'],
    'pantry': ['oil', 'salt', 'pepper', 'sugar', 'spices', 'vinegar']
  };

  const lowerName = ingredientName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

function combineQuantities(qty1, qty2) {
  const num1 = parseFloat(qty1) || 0;
  const num2 = parseFloat(qty2) || 0;
  return String(num1 + num2);
}

export default router;