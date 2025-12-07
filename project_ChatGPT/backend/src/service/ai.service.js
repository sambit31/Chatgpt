import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({});

export async function generateResponse(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;  // IMPORTANT: return to socket server
  } catch (err) {
    console.error("AI Error:", err);
    return "AI is unavailable right now.";
  }
}