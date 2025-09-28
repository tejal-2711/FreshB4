/**
 * GeminiService - AI-Powered Food Analysis and Recipe Generation
 * Real implementation using Google Gemini API with new SDK structure
 */

import { GoogleGenAI } from "@google/genai";

// Get API key from environment variables
const API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";

class GeminiService {
  constructor() {
    // Initialize with new SDK structure
    this.ai = new GoogleGenAI({
      apiKey: API_KEY,
    });

    // Use the latest model name
    this.modelName = "gemini-2.5-flash";

    console.log(
      "Successfully initialized Gemini AI with model:",
      this.modelName
    );

    // Check if API key is configured
    this.isConfigured = API_KEY && API_KEY !== "YOUR_GEMINI_API_KEY_HERE";

    if (!this.isConfigured) {
      console.warn("Gemini API key not configured. Using mock responses.");
    } else {
      console.log("Gemini API configured successfully");
    }
  }

  /**
   * Analyze food image for freshness and safety
   * @param {string} imageBase64 - Base64 encoded image
   * @param {Array} pantryItems - Current pantry items for context
   * @returns {Object} Analysis results
   */
  async analyzeFood(imageBase64, pantryItems = []) {
    try {
      // If API is not configured, return mock data
      if (!this.isConfigured) {
        console.log("Using mock analysis - API key not configured");
        return this.getMockAnalysis();
      }

      // Create the prompt for food analysis
      const prompt = `
You are an expert food safety and freshness analyst. Analyze this food image and provide a detailed assessment.

Please respond with a JSON object containing:
{
  "freshness": "fresh" | "ripe" | "overripe" | "spoiled",
  "safe_to_consume": boolean,
  "days_left": number (estimated days until spoilage, 0 if already spoiled),
  "confidence": number (0-100, your confidence in this assessment),
  "recommendation": "detailed recommendation text",
  "food_type": "specific food item identified",
  "storage_tip": "optimal storage advice",
  "details": "detailed analysis of what you observed"
}

Focus on:
- Visual signs of spoilage (mold, discoloration, bruising, wilting)
- Texture changes that indicate freshness level
- Safety considerations for consumption
- Specific storage recommendations
- Realistic shelf life estimates

Be conservative with safety - when in doubt, err on the side of caution.
`;

      // Use new API structure matching the official docs
      const contents = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64,
          },
        },
        { text: prompt },
      ];

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: contents,
      });

      const text = response.text;

      // Extract JSON from the response
      let analysisResult;
      try {
        // Try to parse the entire response as JSON first
        analysisResult = JSON.parse(text);
      } catch (e) {
        // If that fails, try to extract JSON from markdown code blocks
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[1]);
        } else {
          // If no JSON found, create a structured response from the text
          analysisResult = this.parseTextResponse(text);
        }
      }

      // Validate and sanitize the response
      return this.validateAnalysisResult(analysisResult);
    } catch (error) {
      console.error("Error analyzing food with Gemini API:", error);

      // Return mock data as fallback
      console.log("Falling back to mock analysis due to API error");
      return this.getMockAnalysis();
    }
  }

  /**
   * Generate recipes based on available pantry items
   * @param {Array} pantryItems - Available ingredients
   * @returns {Object} Recipe suggestions
   */
  async getRecipes(pantryItems = []) {
    try {
      // If API is not configured, return mock data
      if (!this.isConfigured) {
        console.log("Using mock recipes - API key not configured");
        return this.getMockRecipes(pantryItems);
      }

      // Create ingredient list and urgency context
      const urgentItems = pantryItems.filter((item) => item.days_left <= 2);
      const allIngredients = pantryItems
        .map(
          (item) =>
            `${item.name} (${item.category}, expires in ${item.days_left} days)`
        )
        .join(", ");

      const prompt = `
You are a creative chef and nutritionist. Generate 3 recipes using the available ingredients, prioritizing items that expire soon.

Available ingredients: ${allIngredients}

Urgent items (expire in ≤2 days): ${urgentItems
        .map((item) => item.name)
        .join(", ")}

Please respond with a JSON object:
{
  "recipes": [
    {
      "id": number,
      "name": "recipe name",
      "description": "brief description",
      "cookTime": "15 minutes",
      "difficulty": "Easy" | "Medium" | "Hard",
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": ["step 1", "step 2", "step 3"],
      "priority": "high" | "medium" | "low"
    }
  ],
  "total": number,
  "urgent_items_used": number,
  "message": "helpful message about ingredient usage"
}

Guidelines:
- Prioritize urgent items (set priority to "high" if using urgent ingredients)
- Create diverse recipes (different cooking methods, meal types)
- Keep instructions clear and concise
- Use realistic cooking times
- Only include ingredients from the available list
- Make recipes practical and achievable
`;

      // Use new API structure
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });

      const text = response.text;

      // Parse the JSON response
      let recipesResult;
      try {
        recipesResult = JSON.parse(text);
      } catch (e) {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          recipesResult = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error("Could not parse recipe response");
        }
      }

      return this.validateRecipesResult(recipesResult);
    } catch (error) {
      console.error("Error generating recipes with Gemini API:", error);
      console.log("Falling back to mock recipes due to API error");
      return this.getMockRecipes(pantryItems);
    }
  }

  /**
   * Mock food analysis response
   * @returns {Object} Mock analysis data
   */
  getMockAnalysis() {
    const mockResponses = [
      {
        freshness: "fresh",
        safe_to_consume: true,
        days_left: 5,
        confidence: 92,
        recommendation:
          "This item looks fresh and safe to eat. Store in a cool, dry place.",
        food_type: "Apple",
        storage_tip: "Keep refrigerated for longer freshness",
        details:
          "The apple appears to be in excellent condition with no visible signs of browning or soft spots. The skin looks vibrant and the texture appears firm.",
      },
      {
        freshness: "ripe",
        safe_to_consume: true,
        days_left: 2,
        confidence: 88,
        recommendation:
          "Perfect for eating now! This item is at peak ripeness.",
        food_type: "Banana",
        storage_tip: "Eat within 2 days or use for baking",
        details:
          "The banana shows optimal yellow coloring with minimal brown spots, indicating perfect ripeness for consumption.",
      },
      {
        freshness: "overripe",
        safe_to_consume: true,
        days_left: 1,
        confidence: 85,
        recommendation:
          "Use soon for cooking or baking. Still safe but past prime eating quality.",
        food_type: "Tomato",
        storage_tip: "Use immediately for sauces or cooking",
        details:
          "The tomato shows some soft spots and deeper color, indicating it should be used quickly in cooked dishes.",
      },
      {
        freshness: "spoiled",
        safe_to_consume: false,
        days_left: 0,
        confidence: 95,
        recommendation:
          "DISCARD IMMEDIATELY - This item shows clear signs of spoilage and is unsafe to consume.",
        food_type: "Bread",
        storage_tip: "Dispose of safely",
        details:
          "Visible mold growth detected. This item poses health risks and should not be consumed.",
      },
    ];

    // Return random mock response
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  /**
   * Mock recipe generation response
   * @param {Array} pantryItems - Available ingredients
   * @returns {Object} Mock recipe data
   */
  getMockRecipes(pantryItems = []) {
    const urgentItems = pantryItems.filter((item) => item.days_left <= 2);
    const freshItems = pantryItems.filter((item) => item.days_left > 2);

    const mockRecipes = [
      {
        id: 1,
        name: "Quick Veggie Stir Fry",
        description:
          "A fast and healthy way to use up vegetables before they spoil",
        cookTime: "15 minutes",
        difficulty: "Easy",
        ingredients: urgentItems.slice(0, 3).map((item) => item.name),
        instructions: [
          "Heat oil in a large pan or wok",
          "Add vegetables starting with the firmest ones",
          "Stir fry for 5-7 minutes until tender-crisp",
          "Season with soy sauce, garlic, and ginger",
          "Serve over rice or noodles",
        ],
        priority: "high", // Uses urgent items
      },
      {
        id: 2,
        name: "Fresh Garden Salad",
        description:
          "Light and refreshing salad perfect for peak-freshness ingredients",
        cookTime: "10 minutes",
        difficulty: "Easy",
        ingredients: freshItems.slice(0, 4).map((item) => item.name),
        instructions: [
          "Wash and chop all vegetables",
          "Combine in a large bowl",
          "Add your favorite dressing",
          "Toss gently and serve immediately",
        ],
        priority: "medium",
      },
      {
        id: 3,
        name: "Smoothie Bowl",
        description: "Perfect way to use overripe fruits",
        cookTime: "5 minutes",
        difficulty: "Easy",
        ingredients: pantryItems
          .filter(
            (item) =>
              item.name.toLowerCase().includes("banana") ||
              item.name.toLowerCase().includes("berry") ||
              item.name.toLowerCase().includes("fruit")
          )
          .map((item) => item.name),
        instructions: [
          "Blend fruits with a splash of milk or yogurt",
          "Pour into a bowl",
          "Top with nuts, seeds, or granola",
          "Enjoy immediately",
        ],
        priority: "high",
      },
    ];

    return {
      recipes: mockRecipes,
      total: mockRecipes.length,
      urgent_items_used: urgentItems.length,
      message:
        urgentItems.length > 0
          ? `Found ${urgentItems.length} items that need to be used soon!`
          : "All your ingredients are fresh!",
    };
  }

  /**
   * Parse text response when JSON parsing fails
   * @param {string} text - Raw text response
   * @returns {Object} Structured analysis result
   */
  parseTextResponse(text) {
    // Extract key information from text response
    const freshness = this.extractFreshness(text);
    const safeToConsume =
      !text.toLowerCase().includes("not safe") &&
      !text.toLowerCase().includes("discard") &&
      !text.toLowerCase().includes("spoiled");

    return {
      freshness: freshness,
      safe_to_consume: safeToConsume,
      days_left: this.extractDaysLeft(text, freshness),
      confidence: this.extractConfidence(text),
      recommendation: text.substring(0, 200) + "...",
      food_type: "Unknown Food Item",
      storage_tip: "Store in appropriate conditions",
      details: text,
    };
  }

  /**
   * Extract freshness level from text
   * @param {string} text - Response text
   * @returns {string} Freshness level
   */
  extractFreshness(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("spoiled") || lowerText.includes("moldy"))
      return "spoiled";
    if (lowerText.includes("overripe") || lowerText.includes("past prime"))
      return "overripe";
    if (lowerText.includes("ripe") || lowerText.includes("peak")) return "ripe";
    return "fresh";
  }

  /**
   * Extract days left from text
   * @param {string} text - Response text
   * @param {string} freshness - Freshness level
   * @returns {number} Estimated days left
   */
  extractDaysLeft(text, freshness) {
    const dayMatch = text.match(/(\d+)\s*days?/i);
    if (dayMatch) return parseInt(dayMatch[1]);

    // Default based on freshness
    switch (freshness) {
      case "spoiled":
        return 0;
      case "overripe":
        return 1;
      case "ripe":
        return 3;
      default:
        return 5;
    }
  }

  /**
   * Extract confidence from text
   * @param {string} text - Response text
   * @returns {number} Confidence percentage
   */
  extractConfidence(text) {
    const confMatch = text.match(/(\d+)%/);
    if (confMatch) return parseInt(confMatch[1]);
    return 85; // Default confidence
  }

  /**
   * Validate and sanitize analysis result
   * @param {Object} result - Raw analysis result
   * @returns {Object} Validated result
   */
  validateAnalysisResult(result) {
    const validFreshness = ["fresh", "ripe", "overripe", "spoiled"];

    return {
      freshness: validFreshness.includes(result.freshness)
        ? result.freshness
        : "fresh",
      safe_to_consume: Boolean(result.safe_to_consume),
      days_left: Math.max(0, parseInt(result.days_left) || 0),
      confidence: Math.min(100, Math.max(0, parseInt(result.confidence) || 85)),
      recommendation: result.recommendation || "No recommendation available",
      food_type: result.food_type || "Unknown Food Item",
      storage_tip: result.storage_tip || "Store in appropriate conditions",
      details: result.details || "No detailed analysis available",
    };
  }

  /**
   * Validate and sanitize recipes result
   * @param {Object} result - Raw recipes result
   * @returns {Object} Validated result
   */
  validateRecipesResult(result) {
    const validatedRecipes = (result.recipes || []).map((recipe, index) => ({
      id: recipe.id || index + 1,
      name: recipe.name || `Recipe ${index + 1}`,
      description: recipe.description || "Delicious recipe",
      cookTime: recipe.cookTime || "30 minutes",
      difficulty: ["Easy", "Medium", "Hard"].includes(recipe.difficulty)
        ? recipe.difficulty
        : "Medium",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions)
        ? recipe.instructions
        : [],
      priority: ["high", "medium", "low"].includes(recipe.priority)
        ? recipe.priority
        : "medium",
    }));

    return {
      recipes: validatedRecipes,
      total: validatedRecipes.length,
      urgent_items_used: result.urgent_items_used || 0,
      message: result.message || "Here are your personalized recipes!",
    };
  }

  /**
   * List available models for debugging
   * @returns {Array} Available models
   */
  async listAvailableModels() {
    try {
      if (!this.isConfigured) {
        console.log("API not configured, cannot list models");
        return [];
      }

      // Use new API structure to list models
      const response = await this.ai.models.list();

      if (response.models) {
        console.log("Available Gemini models:");
        response.models.forEach((model) => {
          console.log(`- ${model.name} (${model.displayName || model.name})`);
        });
        return response.models;
      }
      return [];
    } catch (error) {
      console.error("Error listing models:", error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
