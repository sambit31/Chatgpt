import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function generateResponse(messages) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages,
    });

    return response.text;
  } catch (err) {
    console.error("AI Error:", err);
    throw err;
  }
}


export async function generateVector(text) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        dimensions: 1024
      }
    });

    return response.embeddings[0].values; // 3072 dims
  } catch (err) {
    console.error("Embedding Error:", err);
    return null;
  }
}
