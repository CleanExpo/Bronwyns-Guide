// OpenRouter API Service for Food Recognition
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

interface FoodAnalysisResult {
  dishName: string
  ingredients: string[]
  nutritionalInfo: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sugar?: number
    sodium?: number
  }
  allergens: string[]
  dietaryInfo: string[]
  recipe?: {
    prep_time: string
    cook_time: string
    servings: number
    difficulty: string
    instructions: string[]
  }
  healthConsiderations: {
    suitable: string[]
    avoid: string[]
    modifications: string[]
  }
}

export async function analyzeFoodImage(imageBase64: string, userProfile?: any): Promise<FoodAnalysisResult> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured')
  }

  // Get user's health profile from localStorage
  const savedProfile = localStorage.getItem('userHealthProfile')
  const profile = savedProfile ? JSON.parse(savedProfile) : userProfile

  const prompt = `Analyze this food image and provide detailed information about the dish.
${profile ? `
IMPORTANT USER HEALTH INFORMATION:
- Health Conditions: ${profile.healthConditions?.join(', ') || 'None specified'}
- Allergies: ${profile.allergies?.join(', ') || 'None specified'}
- Dietary Preferences: ${profile.dietaryPreferences?.join(', ') || 'None specified'}
- Foods to Avoid: ${profile.avoidFoods || 'None specified'}

Please analyze if this dish is safe for the user based on their health profile.
` : ''}

Please provide:
1. Name of the dish
2. List of ingredients you can identify
3. Estimated nutritional information per serving
4. Common allergens present
5. Dietary information (vegan, gluten-free, etc.)
6. If possible, provide a basic recipe
7. Health considerations specific to the user's conditions

Format the response as JSON.`

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Bronwyns Personal Chief'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to analyze image')
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse the JSON response
    try {
      // Extract JSON from the response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : content
      return JSON.parse(jsonStr)
    } catch {
      // If JSON parsing fails, return a structured response from the text
      return parseTextResponse(content, profile)
    }
  } catch (error) {
    console.error('OpenRouter API error:', error)
    throw error
  }
}

function parseTextResponse(text: string, profile: any): FoodAnalysisResult {
  // Basic parsing of text response if JSON fails
  const lines = text.split('\n')
  
  return {
    dishName: extractValue(text, 'dish name', 'name') || 'Unidentified Dish',
    ingredients: extractList(text, 'ingredients'),
    nutritionalInfo: {
      calories: extractNumber(text, 'calories'),
      protein: extractNumber(text, 'protein'),
      carbs: extractNumber(text, 'carbs', 'carbohydrates'),
      fat: extractNumber(text, 'fat'),
      fiber: extractNumber(text, 'fiber'),
      sugar: extractNumber(text, 'sugar'),
      sodium: extractNumber(text, 'sodium')
    },
    allergens: extractList(text, 'allergens'),
    dietaryInfo: extractList(text, 'dietary'),
    healthConsiderations: {
      suitable: profile ? determineSuitability(text, profile) : [],
      avoid: profile ? determineAvoidance(text, profile) : [],
      modifications: extractList(text, 'modifications', 'modify')
    }
  }
}

function extractValue(text: string, ...keywords: string[]): string {
  const lowerText = text.toLowerCase()
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\\s]+([^\\n,]+)`, 'i')
    const match = text.match(regex)
    if (match) return match[1].trim()
  }
  return ''
}

function extractList(text: string, ...keywords: string[]): string[] {
  const lowerText = text.toLowerCase()
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\\s]+([^\\n]+)`, 'i')
    const match = text.match(regex)
    if (match) {
      return match[1].split(',').map(s => s.trim()).filter(Boolean)
    }
  }
  return []
}

function extractNumber(text: string, ...keywords: string[]): number | undefined {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\\s]+(\\d+)`, 'i')
    const match = text.match(regex)
    if (match) return parseInt(match[1])
  }
  return undefined
}

function determineSuitability(text: string, profile: any): string[] {
  const suitable = []
  const lowerText = text.toLowerCase()
  
  // Check for conditions
  if (profile.healthConditions?.includes("Diabetes") && lowerText.includes('low sugar')) {
    suitable.push('Low sugar - suitable for diabetes')
  }
  if (profile.healthConditions?.includes("Celiac Disease") && lowerText.includes('gluten-free')) {
    suitable.push('Gluten-free - safe for celiac')
  }
  
  return suitable
}

function determineAvoidance(text: string, profile: any): string[] {
  const avoid = []
  const lowerText = text.toLowerCase()
  
  // Check allergens
  for (const allergen of profile.allergies || []) {
    if (lowerText.includes(allergen.toLowerCase())) {
      avoid.push(`Contains ${allergen} - ALLERGEN WARNING`)
    }
  }
  
  return avoid
}

// Alternative function for text-based recipe analysis
export async function analyzeRecipeText(recipeText: string, userProfile?: any): Promise<FoodAnalysisResult> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured')
  }

  const savedProfile = localStorage.getItem('userHealthProfile')
  const profile = savedProfile ? JSON.parse(savedProfile) : userProfile

  const prompt = `Analyze this recipe text and provide detailed information.
${profile ? `
USER HEALTH PROFILE:
- Conditions: ${profile.healthConditions?.join(', ') || 'None'}
- Allergies: ${profile.allergies?.join(', ') || 'None'}
- Diet: ${profile.dietaryPreferences?.join(', ') || 'None'}
` : ''}

Recipe Text:
${recipeText}

Provide analysis including ingredients, nutrition, allergens, and suitability for the user's health profile. Format as JSON.`

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Bronwyns Personal Chief'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error('Failed to analyze recipe')
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : content
      return JSON.parse(jsonStr)
    } catch {
      return parseTextResponse(content, profile)
    }
  } catch (error) {
    console.error('Recipe analysis error:', error)
    throw error
  }
}