import { DataTypes } from 'sequelize';
import { sequelize } from '../db/database.js';

const MealPlan = sequelize.define('MealPlan', {
  planId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'userId'
    }
  },
  ownerMemberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'FamilyMember',
      key: 'memberId'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  meals: {
    type: DataTypes.JSON,
    defaultValue: [],
    validate: {
      isValidMeals(value) {
        if (!Array.isArray(value)) {
          throw new Error('Meals must be an array');
        }
        const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
        for (const meal of value) {
          if (!validMealTypes.includes(meal.mealType)) {
            throw new Error('Invalid meal type');
          }
          if (!meal.date || !meal.recipeId) {
            throw new Error('Each meal must have date and recipeId');
          }
        }
      }
    }
  },
  sharedWith: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'completed', 'archived'),
    defaultValue: 'draft'
  },
  completionRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  }
});

MealPlan.prototype.calculateCompletionRate = function() {
  if (!this.meals || this.meals.length === 0) return 0;
  const completed = this.meals.filter(meal => meal.isCompleted).length;
  return (completed / this.meals.length) * 100;
};

MealPlan.prototype.updateCompletionRate = async function() {
  this.completionRate = this.calculateCompletionRate();
  await this.save();
};

export default MealPlan;