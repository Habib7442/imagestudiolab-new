import { GoogleGenAI } from "@google/genai";

// Ensure this is only used on the server
export const createGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  return new GoogleGenAI({ apiKey });
};

export const GEMINI_MODEL_NAME = "gemini-2.5-flash-image";
