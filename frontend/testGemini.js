/**
 * Test script for Gemini API models
 * Run with: node testGemini.js
 */

import { geminiService } from "./services/geminiService.js";

async function testGeminiModels() {
  console.log("Testing Gemini API integration...\n");

  try {
    // Test 1: List available models
    console.log("1. Listing available models:");
    const models = await geminiService.listAvailableModels();
    console.log(`Found ${models.length} models\n`);

    // Test 2: Test text generation with recipe request
    console.log("2. Testing recipe generation:");
    const mockPantryItems = [
      { name: "Chicken breast", category: "meat", days_left: 3 },
      { name: "Broccoli", category: "vegetable", days_left: 2 },
      { name: "Rice", category: "grain", days_left: 30 },
    ];

    const recipes = await geminiService.getRecipes(mockPantryItems);
    console.log("Recipe result:", {
      recipeCount: recipes.recipes?.length || 0,
      message: recipes.message,
    });

    console.log("\n✅ Gemini API test completed successfully!");
  } catch (error) {
    console.error("❌ Gemini API test failed:", error);
    console.log("\nTroubleshooting:");
    console.log("1. Check if EXPO_PUBLIC_GEMINI_API_KEY is set in .env");
    console.log("2. Verify your Gemini API key is valid");
    console.log("3. Check if you have sufficient API quota");
    console.log("4. Ensure the model names are correct for your API version");
  }
}

// Run the test
testGeminiModels();
