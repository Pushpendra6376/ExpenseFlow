const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use a stable model (1.5 Flash is fast and cheap)
// Agar aapke paas 2.0 ka access hai toh wo use karein, warna 1.5-flash best hai
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash" 
});

exports.predictCategory = async (description) => {
    try {
        if (!description) return "Other";

        const prompt = `
            Analyze this expense description: "${description}"
            
            Map it to EXACTLY ONE of these categories:
            Food, Petrol, Credit Card, Shopping, Travel, Grocery, Entertainment, Health, Education, Bills, Salary, Investment
            
            If it's unclear, return "Other".
            Do not provide any explanation, just the category name.
        `;

        const result = await model.generateContent(prompt);
        const category = result.response.text().trim();

        // Safely clean text (kabhi kabhi AI '\n' add kar deta hai)
        return category.replace(/\n/g, '').replace(/\*/g, '').trim();

    } catch (err) {
        console.error("AI CATEGORY ERROR:", err.message);
        return "Other"; // Fallback agar AI fail ho jaye
    }
};