import { DataTypes } from 'sequelize';
import { sequelize } from '../db/database.js';

const FamilyMember = sequelize.define('FamilyMember', {
  memberId: {
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
    allowNull: false
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dietaryProfile: {
    type: DataTypes.JSON,
    defaultValue: {
      conditions: [],
      restrictions: [],
      goals: []
    },
    validate: {
      isValidProfile(value) {
        if (!value.conditions || !Array.isArray(value.conditions)) {
          throw new Error('Conditions must be an array');
        }
        if (!value.restrictions || !Array.isArray(value.restrictions)) {
          throw new Error('Restrictions must be an array');
        }
      }
    }
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

export default FamilyMember;