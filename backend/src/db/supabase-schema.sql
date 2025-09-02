-- Bronwyn's Guide Database Schema for Supabase/PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
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

-- Family Members table
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

-- Recipes table
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

-- Meal Plans table
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

-- Shopping Lists table
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

-- AI Interactions table
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

-- Indexes for better performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_family_member_user ON "FamilyMember"(user_id);
CREATE INDEX idx_recipe_user ON "Recipe"(user_id);
CREATE INDEX idx_recipe_favorite ON "Recipe"(user_id, is_favorite);
CREATE INDEX idx_meal_plan_user ON "MealPlan"(user_id);
CREATE INDEX idx_meal_plan_member ON "MealPlan"(owner_member_id);
CREATE INDEX idx_shopping_list_user ON "ShoppingList"(user_id);
CREATE INDEX idx_ai_interaction_user ON "AIInteraction"(user_id);
CREATE INDEX idx_ai_interaction_type ON "AIInteraction"(type);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_member_updated_at BEFORE UPDATE ON "FamilyMember" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipe_updated_at BEFORE UPDATE ON "Recipe" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plan_updated_at BEFORE UPDATE ON "MealPlan" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_list_updated_at BEFORE UPDATE ON "ShoppingList" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_interaction_updated_at BEFORE UPDATE ON "AIInteraction" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Commented out for initial setup
-- Uncomment and modify these after setting up Supabase Auth

-- ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "FamilyMember" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Recipe" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "MealPlan" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "ShoppingList" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "AIInteraction" ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (uncomment and modify after auth setup):
-- CREATE POLICY "Users can view own data" ON "User" FOR ALL USING (user_id = current_user_id());
-- CREATE POLICY "Users can view own family members" ON "FamilyMember" FOR ALL USING (user_id = current_user_id());
-- CREATE POLICY "Users can view own recipes" ON "Recipe" FOR ALL USING (user_id = current_user_id());
-- CREATE POLICY "Users can view own meal plans" ON "MealPlan" FOR ALL USING (user_id = current_user_id());
-- CREATE POLICY "Users can view own shopping lists" ON "ShoppingList" FOR ALL USING (user_id = current_user_id());
-- CREATE POLICY "Users can view own AI interactions" ON "AIInteraction" FOR ALL USING (user_id = current_user_id());