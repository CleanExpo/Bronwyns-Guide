-- Bronwyn's Guide Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create Users table
CREATE TABLE IF NOT EXISTS "User" (
  user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create Family Members table
CREATE TABLE IF NOT EXISTS "FamilyMember" (
  member_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(255) NOT NULL,
  dietary_profile JSONB DEFAULT '{"conditions":[],"restrictions":[],"goals":[]}',
  avatar_url VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create Recipes table
CREATE TABLE IF NOT EXISTS "Recipe" (
  recipe_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  original_source JSONB NOT NULL,
  date_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ai_analysis JSONB DEFAULT '{}',
  processed_recipe JSONB NOT NULL,
  tags JSONB DEFAULT '[]',
  is_favorite BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  last_viewed TIMESTAMP,
  is_public BOOLEAN DEFAULT false,
  rating FLOAT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create Meal Plans table
CREATE TABLE IF NOT EXISTS "MealPlan" (
  plan_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  owner_member_id UUID REFERENCES "FamilyMember"(member_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  meals JSONB DEFAULT '[]',
  shared_with JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'draft',
  completion_rate FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create Shopping Lists table
CREATE TABLE IF NOT EXISTS "ShoppingList" (
  list_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  name VARCHAR(255),
  source_meal_plan_id UUID REFERENCES "MealPlan"(plan_id) ON DELETE SET NULL,
  generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  shopping_date DATE,
  items JSONB DEFAULT '[]',
  total_estimated_cost FLOAT,
  status VARCHAR(50) DEFAULT 'draft',
  completion_rate FLOAT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Create AI Interactions table
CREATE TABLE IF NOT EXISTS "AIInteraction" (
  interaction_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES "User"(user_id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  type VARCHAR(50) NOT NULL,
  input JSONB DEFAULT '{}',
  output JSONB DEFAULT '{}',
  feedback JSONB,
  model_version VARCHAR(255),
  processing_time INTEGER,
  token_count INTEGER,
  cost FLOAT,
  is_successful BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_family_member_user ON "FamilyMember"(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_user ON "Recipe"(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_favorite ON "Recipe"(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_meal_plan_user ON "MealPlan"(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_member ON "MealPlan"(owner_member_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user ON "ShoppingList"(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interaction_user ON "AIInteraction"(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_interaction_type ON "AIInteraction"(type);

-- Step 9: Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at 
  BEFORE UPDATE ON "User" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_member_updated_at ON "FamilyMember";
CREATE TRIGGER update_family_member_updated_at 
  BEFORE UPDATE ON "FamilyMember" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipe_updated_at ON "Recipe";
CREATE TRIGGER update_recipe_updated_at 
  BEFORE UPDATE ON "Recipe" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meal_plan_updated_at ON "MealPlan";
CREATE TRIGGER update_meal_plan_updated_at 
  BEFORE UPDATE ON "MealPlan" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shopping_list_updated_at ON "ShoppingList";
CREATE TRIGGER update_shopping_list_updated_at 
  BEFORE UPDATE ON "ShoppingList" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_interaction_updated_at ON "AIInteraction";
CREATE TRIGGER update_ai_interaction_updated_at 
  BEFORE UPDATE ON "AIInteraction" 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Schema created successfully!' as message;