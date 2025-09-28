/**
 * Simple test for new Gemini API structure
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY_HERE";

async function testNewGeminiAPI() {
  try {
    console.log("Testing new Gemini API structure...");
    console.log("API Key configured:", API_KEY !== "YOUR_API_KEY_HERE");

    const ai = new GoogleGenAI({
      apiKey: API_KEY,
    });

    // Test basic text generation
    console.log("\n1. Testing basic text generation:");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
    });

    console.log("Response:", response.text);

    // Test model listing
    console.log("\n2. Testing model listing:");
    const modelsList = await ai.models.list();
    console.log("Available models:", modelsList.models?.length || 0);

    if (modelsList.models) {
      modelsList.models.forEach((model) => {
        console.log(`- ${model.name}`);
      });
    }

    console.log("\n✅ New API structure working!");
  } catch (error) {
    console.error("❌ API test failed:", error);
  }
}

testNewGeminiAPI();
