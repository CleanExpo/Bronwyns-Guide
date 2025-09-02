const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.NODE_ENV === 'production' 
  ? process.env.SUPABASE_SERVICE_KEY 
  : process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
}

// Database helper functions
const supabaseDb = {
  // Check if Supabase is configured
  isConfigured: () => {
    return supabase !== null;
  },

  // Get the Supabase client
  getClient: () => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
    }
    return supabase;
  },

  // Test database connection
  testConnection: async () => {
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('User')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      return { success: true, message: 'Supabase connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // User operations
  users: {
    create: async (userData) => {
      const { data, error } = await supabase
        .from('User')
        .insert([userData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    findByEmail: async (email) => {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    },

    findById: async (userId) => {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from('User')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Family Member operations
  familyMembers: {
    create: async (memberData) => {
      const { data, error } = await supabase
        .from('FamilyMember')
        .insert([memberData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    findByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('FamilyMember')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    update: async (memberId, updates) => {
      const { data, error } = await supabase
        .from('FamilyMember')
        .update(updates)
        .eq('member_id', memberId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    delete: async (memberId) => {
      const { error } = await supabase
        .from('FamilyMember')
        .delete()
        .eq('member_id', memberId);
      
      if (error) throw error;
      return true;
    }
  },

  // Recipe operations
  recipes: {
    create: async (recipeData) => {
      const { data, error } = await supabase
        .from('Recipe')
        .insert([recipeData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    findByUserId: async (userId, limit = 50) => {
      const { data, error } = await supabase
        .from('Recipe')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },

    findById: async (recipeId) => {
      const { data, error } = await supabase
        .from('Recipe')
        .select('*')
        .eq('recipe_id', recipeId)
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (recipeId, updates) => {
      const { data, error } = await supabase
        .from('Recipe')
        .update(updates)
        .eq('recipe_id', recipeId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    delete: async (recipeId) => {
      const { error } = await supabase
        .from('Recipe')
        .delete()
        .eq('recipe_id', recipeId);
      
      if (error) throw error;
      return true;
    }
  },

  // Meal Plan operations
  mealPlans: {
    create: async (planData) => {
      const { data, error } = await supabase
        .from('MealPlan')
        .insert([planData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    findByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('MealPlan')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    update: async (planId, updates) => {
      const { data, error } = await supabase
        .from('MealPlan')
        .update(updates)
        .eq('plan_id', planId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    delete: async (planId) => {
      const { error } = await supabase
        .from('MealPlan')
        .delete()
        .eq('plan_id', planId);
      
      if (error) throw error;
      return true;
    }
  },

  // Shopping List operations
  shoppingLists: {
    create: async (listData) => {
      const { data, error } = await supabase
        .from('ShoppingList')
        .insert([listData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    findByUserId: async (userId) => {
      const { data, error } = await supabase
        .from('ShoppingList')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    update: async (listId, updates) => {
      const { data, error } = await supabase
        .from('ShoppingList')
        .update(updates)
        .eq('list_id', listId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    delete: async (listId) => {
      const { error } = await supabase
        .from('ShoppingList')
        .delete()
        .eq('list_id', listId);
      
      if (error) throw error;
      return true;
    }
  },

  // AI Interaction operations
  aiInteractions: {
    create: async (interactionData) => {
      const { data, error } = await supabase
        .from('AIInteraction')
        .insert([interactionData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    findByUserId: async (userId, limit = 20) => {
      const { data, error } = await supabase
        .from('AIInteraction')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    }
  }
};

module.exports = { supabaseDb };