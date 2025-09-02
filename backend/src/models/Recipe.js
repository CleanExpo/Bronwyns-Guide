import { DataTypes } from 'sequelize';
import { sequelize } from '../db/database.js';

const Recipe = sequelize.define('Recipe', {
  recipeId: {
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
  originalSource: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidSource(value) {
        const validTypes = ['image', 'url', 'manual', 'text'];
        if (!validTypes.includes(value.type)) {
          throw new Error('Invalid source type');
        }
      }
    }
  },
  dateSaved: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  aiAnalysis: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  processedRecipe: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidRecipe(value) {
        if (!value.title || !value.ingredients || !value.instructions) {
          throw new Error('Recipe must have title, ingredients, and instructions');
        }
        if (!Array.isArray(value.ingredients) || !Array.isArray(value.instructions)) {
          throw new Error('Ingredients and instructions must be arrays');
        }
      }
    }
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastViewed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  }
});

Recipe.prototype.incrementViewCount = async function() {
  this.viewCount += 1;
  this.lastViewed = new Date();
  await this.save();
};

export default Recipe;