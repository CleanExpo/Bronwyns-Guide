import { DataTypes } from 'sequelize';
import { sequelize } from '../db/database.js';

const ShoppingList = sequelize.define('ShoppingList', {
  listId: {
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
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sourceMealPlanId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'MealPlan',
      key: 'planId'
    }
  },
  generatedDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  shoppingDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  items: {
    type: DataTypes.JSON,
    defaultValue: [],
    validate: {
      isValidItems(value) {
        if (!Array.isArray(value)) {
          throw new Error('Items must be an array');
        }
        for (const item of value) {
          if (!item.ingredientName || !item.quantity) {
            throw new Error('Each item must have ingredientName and quantity');
          }
        }
      }
    }
  },
  totalEstimatedCost: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0
    }
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
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

ShoppingList.prototype.calculateCompletionRate = function() {
  if (!this.items || this.items.length === 0) return 0;
  const purchased = this.items.filter(item => item.isPurchased).length;
  return (purchased / this.items.length) * 100;
};

ShoppingList.prototype.updateCompletionRate = async function() {
  this.completionRate = this.calculateCompletionRate();
  if (this.completionRate === 100) {
    this.status = 'completed';
  }
  await this.save();
};

ShoppingList.prototype.calculateTotalCost = function() {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce((total, item) => {
    return total + (item.estimatedCost || 0);
  }, 0);
};

export default ShoppingList;