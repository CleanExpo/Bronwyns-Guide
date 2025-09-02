import User from './User.js';
import FamilyMember from './FamilyMember.js';
import Recipe from './Recipe.js';
import MealPlan from './MealPlan.js';
import ShoppingList from './ShoppingList.js';
import AIInteraction from './AIInteraction.js';

User.hasMany(FamilyMember, { foreignKey: 'user_id', as: 'familyMembers' });
FamilyMember.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Recipe, { foreignKey: 'user_id', as: 'recipes' });
Recipe.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(MealPlan, { foreignKey: 'user_id', as: 'mealPlans' });
MealPlan.belongsTo(User, { foreignKey: 'user_id' });

FamilyMember.hasMany(MealPlan, { foreignKey: 'owner_member_id', as: 'memberMealPlans' });
MealPlan.belongsTo(FamilyMember, { foreignKey: 'owner_member_id' });

MealPlan.hasMany(ShoppingList, { foreignKey: 'source_meal_plan_id', as: 'shoppingLists' });
ShoppingList.belongsTo(MealPlan, { foreignKey: 'source_meal_plan_id' });

User.hasMany(ShoppingList, { foreignKey: 'user_id', as: 'userShoppingLists' });
ShoppingList.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(AIInteraction, { foreignKey: 'user_id', as: 'aiInteractions' });
AIInteraction.belongsTo(User, { foreignKey: 'user_id' });

export {
  User,
  FamilyMember,
  Recipe,
  MealPlan,
  ShoppingList,
  AIInteraction
};