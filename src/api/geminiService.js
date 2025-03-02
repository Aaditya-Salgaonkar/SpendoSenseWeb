import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const askGemini = async (userPrompt) => {
  try {
    const systemPrompt = `
      You are an AI assistant for the website 'SpendoSense'.
      - Answer only based on the website's content.
      - If the question is about finance, spending, or data analysis, provide analysis and practical improvement tips.
      - Do not leak user IDs.
      - Suggest alternative investment avenues where relevant.
      - If asked about SpendoSense, finance, expenses, assets, or productivity, answer appropriately.
      - If unsure, reply: "I'm sorry, but I can only answer questions related to SpendoSense."
      - Use proper grammar and answer general questions within SpendoSense’s domain without explicitly mentioning it.
    `;

    const fullPrompt = `${systemPrompt}\n\nUser Query: ${userPrompt}`;
    
    const result = await model.generateContent(fullPrompt);
    return result.response.text(); // Directly return the text response
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, but I couldn't process your request at the moment.";
  }
};
