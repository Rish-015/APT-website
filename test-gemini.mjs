import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

async function listModels() {
    const envFile = fs.readFileSync(".env", "utf8");
    const apiKeyMatch = envFile.match(/GEMINI_API_KEY="([^"]+)"/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;

    if (!apiKey) {
        console.error("No API key found in .env");
        return;
    }
    
    console.log("API Key loaded (ending in):", apiKey.slice(-5));
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.5-flash-latest", "gemini-1.0-pro"];
    
    console.log("Testing models...");
    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test greeting. Respond with 'Hello'.");
            const text = result.response.text();
            console.log(`✅ Model '${modelName}' is WORKING. Response: ${text.trim()}`);
        } catch (e) {
            console.log(`❌ Model '${modelName}' FAILED: ${e.message}`);
        }
    }
}

listModels();
