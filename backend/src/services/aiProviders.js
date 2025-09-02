import OpenAI from 'openai';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * AI Provider Configuration
 * Supports multiple AI providers for best results
 */

// OpenAI Configuration (GPT-4, GPT-4 Vision)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// OpenRouter Configuration (Access to GPT-4, GPT-5, Claude, etc.)
// Support both OPENROUTER_API_KEY and OPENROUTER_GPT_KEY for flexibility
const openRouterApiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_GPT_KEY;

const openRouterConfig = {
  apiKey: openRouterApiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultModel: 'openai/gpt-4-turbo-preview', // Can use gpt-5 when available
  headers: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'https://bronwyns-guide.vercel.app',
    'X-Title': 'Bronwyns Guide - Dietary Management'
  }
};

// Create OpenRouter client using OpenAI SDK
const openRouter = openRouterApiKey ? new OpenAI({
  apiKey: openRouterApiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'https://bronwyns-guide.vercel.app',
    'X-Title': 'Bronwyns Guide'
  }
}) : null;

/**
 * Model Selection Strategy
 * Choose the best model based on task and availability
 */
const ModelSelector = {
  // Vision models for image analysis
  vision: {
    primary: 'openai/gpt-4-vision-preview',
    fallback: 'anthropic/claude-3-opus',
    openrouter: 'openai/gpt-4-vision-preview'
  },
  
  // Text generation models
  text: {
    primary: 'gpt-4-turbo-preview',
    advanced: 'openai/gpt-4-turbo-preview', // Will be gpt-5 when available
    fallback: 'gpt-3.5-turbo',
    openrouter: {
      best: 'openai/gpt-4-turbo-preview',
      fast: 'anthropic/claude-3-haiku',
      creative: 'anthropic/claude-3-opus'
    }
  },
  
  // Specialized models
  specialized: {
    recipes: 'openai/gpt-4-turbo-preview',
    nutrition: 'openai/gpt-4-turbo-preview',
    medical: 'anthropic/claude-3-opus' // Better for health-related content
  }
};

/**
 * Unified AI Interface
 * Automatically selects best provider and model
 */
class AIProvider {
  constructor() {
    this.providers = {
      openai: openai,
      openrouter: openRouter
    };
    
    // Determine which providers are available
    this.hasOpenAI = !!process.env.OPENAI_API_KEY;
    this.hasOpenRouter = !!(process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_GPT_KEY);
    
    console.log('AI Providers initialized:', {
      openai: this.hasOpenAI,
      openrouter: this.hasOpenRouter
    });
  }

  /**
   * Get the best available provider for a task
   */
  getBestProvider(taskType = 'text') {
    // Prefer OpenRouter for advanced models if available
    if (this.hasOpenRouter && taskType === 'advanced') {
      return 'openrouter';
    }
    
    // Use OpenAI for vision tasks if available
    if (this.hasOpenAI && taskType === 'vision') {
      return 'openai';
    }
    
    // Default priority: OpenRouter > OpenAI
    if (this.hasOpenRouter) return 'openrouter';
    if (this.hasOpenAI) return 'openai';
    
    throw new Error('No AI provider configured. Please set OPENAI_API_KEY or OPENROUTER_API_KEY');
  }

  /**
   * Generate text completion using best available model
   */
  async generateText(prompt, options = {}) {
    const {
      model,
      temperature = 0.7,
      maxTokens = 1000,
      taskType = 'text',
      systemPrompt = null
    } = options;

    const provider = this.getBestProvider(taskType);
    
    try {
      if (provider === 'openrouter') {
        // Use OpenRouter for advanced models
        const response = await openRouter.chat.completions.create({
          model: model || ModelSelector.text.openrouter.best,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature,
          max_tokens: maxTokens
        });
        
        return {
          text: response.choices[0].message.content,
          model: response.model,
          provider: 'openrouter'
        };
      } else if (provider === 'openai') {
        // Use standard OpenAI
        const response = await openai.chat.completions.create({
          model: model || ModelSelector.text.primary,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt }
          ],
          temperature,
          max_tokens: maxTokens
        });
        
        return {
          text: response.choices[0].message.content,
          model: response.model,
          provider: 'openai'
        };
      }
    } catch (error) {
      console.error(`Error with ${provider}:`, error);
      
      // Try fallback provider
      if (provider === 'openrouter' && this.hasOpenAI) {
        console.log('Falling back to OpenAI...');
        return this.generateTextWithOpenAI(prompt, options);
      }
      
      throw error;
    }
  }

  /**
   * Analyze image using best available vision model
   */
  async analyzeImage(imageBase64, prompt, options = {}) {
    const { model, maxTokens = 1000 } = options;
    
    // Prefer OpenRouter if available for potentially better models
    if (this.hasOpenRouter) {
      try {
        const response = await openRouter.chat.completions.create({
          model: model || ModelSelector.vision.openrouter,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: maxTokens
        });
        
        return {
          text: response.choices[0].message.content,
          model: response.model,
          provider: 'openrouter'
        };
      } catch (error) {
        console.error('OpenRouter vision error:', error);
        if (this.hasOpenAI) {
          console.log('Falling back to OpenAI vision...');
        }
      }
    }
    
    // Fallback to OpenAI
    if (this.hasOpenAI) {
      const response = await openai.chat.completions.create({
        model: model || ModelSelector.vision.primary,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: maxTokens
      });
      
      return {
        text: response.choices[0].message.content,
        model: response.model,
        provider: 'openai'
      };
    }
    
    throw new Error('No vision-capable AI provider available');
  }

  /**
   * Generate recipe suggestions with health considerations
   */
  async generateRecipeSuggestions(ingredients, healthConditions = [], options = {}) {
    const systemPrompt = `You are a dietary expert specializing in recipes for people with health conditions.
    Consider these health conditions: ${healthConditions.join(', ') || 'None specified'}
    Focus on safe, nutritious recipes that avoid triggers and promote healing.
    Specifically consider Crohn's disease and FND dietary requirements.`;

    const userPrompt = `Create 5 recipe suggestions using these ingredients: ${ingredients.join(', ')}
    
    For each recipe provide:
    - Title and description
    - Full ingredient list with quantities
    - Step-by-step instructions
    - Nutritional highlights
    - Why it's suitable for the health conditions
    - Preparation and cooking time
    - Difficulty level
    
    Format as JSON array.`;

    // Use advanced model for health-critical content
    const result = await this.generateText(userPrompt, {
      systemPrompt,
      taskType: 'advanced',
      model: this.hasOpenRouter ? ModelSelector.specialized.medical : ModelSelector.specialized.recipes,
      temperature: 0.5, // Lower temperature for consistency
      maxTokens: 2000
    });

    try {
      return JSON.parse(result.text);
    } catch (e) {
      console.error('Failed to parse recipe JSON:', e);
      return result.text;
    }
  }

  /**
   * Analyze nutritional content with health considerations
   */
  async analyzeNutritionForHealth(foodDescription, healthConditions = []) {
    const prompt = `Analyze the nutritional value and health impact of: ${foodDescription}
    
    Consider these health conditions: ${healthConditions.join(', ')}
    
    Provide:
    1. Estimated nutritional content (calories, macros, key vitamins/minerals)
    2. Health benefits for the conditions
    3. Potential risks or triggers
    4. Suitability score (1-10) for each condition
    5. Recommended portion size
    6. Better alternatives if not suitable
    
    Format as detailed JSON.`;

    const result = await this.generateText(prompt, {
      taskType: 'advanced',
      model: this.hasOpenRouter ? ModelSelector.specialized.medical : ModelSelector.specialized.nutrition,
      temperature: 0.3,
      maxTokens: 1500
    });

    try {
      return JSON.parse(result.text);
    } catch (e) {
      return result.text;
    }
  }

  /**
   * Get available models from OpenRouter
   */
  async getAvailableModels() {
    if (!this.hasOpenRouter) {
      return { error: 'OpenRouter not configured' };
    }

    try {
      const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_GPT_KEY;
      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      return response.data.data.map(model => ({
        id: model.id,
        name: model.name,
        context: model.context_length,
        pricing: model.pricing,
        capabilities: {
          vision: model.architecture?.modality === 'multimodal',
          function_calling: model.supported_features?.includes('function_calling')
        }
      }));
    } catch (error) {
      console.error('Error fetching OpenRouter models:', error);
      return { error: 'Failed to fetch models' };
    }
  }
}

// Export singleton instance
const aiProvider = new AIProvider();

export default aiProvider;
export { ModelSelector, AIProvider };