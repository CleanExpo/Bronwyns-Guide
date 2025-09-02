import { DataTypes } from 'sequelize';
import { sequelize } from '../db/database.js';

const AIInteraction = sequelize.define('AIInteraction', {
  interactionId: {
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
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  type: {
    type: DataTypes.ENUM(
      'recipe-analysis',
      'modification-suggestion',
      'safety-check',
      'meal-planning',
      'shopping-list'
    ),
    allowNull: false
  },
  input: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  output: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  feedback: {
    type: DataTypes.JSON,
    defaultValue: null
  },
  modelVersion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  processingTime: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  tokenCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cost: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  isSuccessful: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

AIInteraction.prototype.addFeedback = async function(rating, helpful, comments) {
  this.feedback = {
    rating,
    helpful,
    comments,
    timestamp: new Date().toISOString()
  };
  await this.save();
};

export default AIInteraction;