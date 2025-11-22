"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY!,
  apiVersion: "v1alpha" 
});

export async function generateCaption(imageUrl: string, style: string) {
  try {
    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    // Convert data URL to base64
    const base64Data = imageUrl.split(",")[1];
    const mimeType = imageUrl.split(";")[0].split(":")[1];

    const prompt = `You are a creative caption writer for aesthetic polaroid photos. 
    
Style requested: ${style}

Generate a short, ${style.toLowerCase()} caption for this polaroid image. 
The caption should be:
- Maximum 10 words
- Match the ${style} vibe
- Be Instagram-worthy
- Evoke emotion
- Be authentic and not cliché

Return ONLY the caption text, nothing else.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType as any,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const caption = response.text?.trim() || "Beautiful moment captured ✨";
    return { success: true, caption };
  } catch (error) {
    console.error("Caption generation error:", error);
    return { success: false, error: "Failed to generate caption" };
  }
}

export async function analyzeImageForEdit(imageUrl: string, prompt: string) {
  try {
    if (!imageUrl || !prompt) {
      throw new Error("Image URL and prompt are required");
    }

    // Convert data URL to base64
    const base64Data = imageUrl.split(",")[1];
    const mimeType = imageUrl.split(";")[0].split(":")[1];

    const analysisPrompt = `Analyze this image and provide specific CSS filter values for: "${prompt}"
    
Return a JSON object with these fields:
- brightness: number (0.5 to 1.5, where 1 is normal)
- contrast: number (0.5 to 2, where 1 is normal)
- saturate: number (0 to 3, where 1 is normal)
- hueRotate: number (-180 to 180 degrees)
- description: string (what changes were made)

Be specific and practical. Return ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          parts: [
            { text: analysisPrompt },
            {
              inlineData: {
                mimeType: mimeType as any,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const responseText = response.text?.trim() || "{}";
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const editInstructions = JSON.parse(jsonMatch[0]);
    return { success: true, data: editInstructions };
  } catch (error) {
    console.error("AI edit error:", error);
    return { success: false, error: "Failed to generate edit instructions" };
  }
}
