import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Supabase PostgreSQL connection
const getSupabaseSequelize = () => {
  // Parse Supabase connection string
  // Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  
  if (process.env.SUPABASE_DB_URL) {
    return new Sequelize(process.env.SUPABASE_DB_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  }
  
  // Fallback to SQLite for local development
  return new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DATABASE_PATH || './data/bronwyns-guide.db',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
};

export const sequelize = getSupabaseSequelize();