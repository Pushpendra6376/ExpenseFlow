const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🛠️ CHANGE HERE: "gemini-1.5-flash" ko hata kar "gemini-pro" kar do
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        const response = await result.response;
        const category = response.text().trim();

        // Safely clean text
        return category.replace(/\n/g, '').replace(/\*/g, '').trim();

    } catch (err) {
        console.error("AI CATEGORY ERROR:", err.message);
        return "Other"; // Fallback
    }
};