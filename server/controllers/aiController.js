const { GoogleGenerativeAI } = require("@google/generative-ai");
const Recipe = require('../models/Recipe');

// Initialize Gemini
// NOTE: Make sure GEMINI_API_KEY is set in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

const searchRecipesAI = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.status(503).json({
                message: "AI Search Unavailable: GEMINI_API_KEY is missing in server configuration.",
                mockResponse: true
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        You are a smart recipe assistant. Analyze the following user search query and extract structured data to help find the best recipes.
        
        User Query: "${query}"

        Return ONLY a JSON object with these fields:
        - keywords (array of strings): Main ingredients or food terms (e.g., "paneer", "chicken").
        - cuisine (string): e.g., Italian, Mexican, North Indian, or null.
        - diet (string): e.g., Vegetarian, Vegan, Gluten Free, or null.
        - type (string): e.g., Breakfast, Dinner, Snack, or null.
        - maxTime (integer): Maximum cooking time in minutes guessed from query (default 60 if not specified).
        - minProtein (integer): Minimum protein in grams if "high protein" is mentioned (default 0).
        - mood (string): A fun, short 3-word description of the vibe of this meal (e.g., "Cozy Winter Night").

        JSON:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // extract JSON
        const jsonString = text.replace(/```json|```/g, "").trim();
        const aiParams = JSON.parse(jsonString);

        // --- SMART SEARCH LOGIC ---
        let mongoQuery = {};

        // 1. Time Constraint
        if (aiParams.maxTime) {
            mongoQuery.readyInMinutes = { $lte: aiParams.maxTime };
        }

        // 2. Ingredients (Soft match)
        // If keywords exist, try to match AT LEAST ONE in ingredients OR title
        if (aiParams.keywords && aiParams.keywords.length > 0) {
            const regexKeywords = aiParams.keywords.map(k => new RegExp(k, 'i'));
            mongoQuery.$or = [
                { 'ingredients.name': { $in: regexKeywords } },
                { title: { $in: regexKeywords } }, // Also check title for "Paneer" etc.
                { instructions: { $in: regexKeywords } }
            ];
        }

        const recipes = await Recipe.find(mongoQuery).limit(20);

        // 3. Keyword Boosting (Sort by Relevance)
        // If "North Indian" or "Paneer" is in aiParams, promote those recipes
        const scoredRecipes = recipes.map(r => {
            let score = 0;
            const fullText = (r.title + ' ' + JSON.stringify(r.ingredients)).toLowerCase();

            if (aiParams.cuisine && fullText.includes(aiParams.cuisine.toLowerCase())) score += 5;
            if (aiParams.diet && fullText.includes(aiParams.diet.toLowerCase())) score += 3;
            if (aiParams.keywords) {
                aiParams.keywords.forEach(k => {
                    if (fullText.includes(k.toLowerCase())) score += 2;
                });
            }
            return { r, score };
        });

        // Sort by score descending
        scoredRecipes.sort((a, b) => b.score - a.score);
        const finalResults = scoredRecipes.map(item => item.r);

        res.status(200).json({
            success: true,
            interpretation: aiParams,
            results: finalResults
        });

    } catch (error) {
        console.error("AI Search Error:", error);
        res.status(500).json({ message: "AI Analysis Failed", error: error.message });
    }
};

module.exports = { searchRecipesAI };
