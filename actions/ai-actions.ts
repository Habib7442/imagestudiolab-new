"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiVersion: "v1alpha" });

export async function generatePolaroidMetadata(imageBase64: string) {
  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.split(",")[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          parts: [
            {
              text: `Analyze this image and provide a JSON response with the following fields:
              1. "caption": A short, aesthetic, instagram-style caption (max 10 words). It should be witty, cute, or deep depending on the image mood.
              2. "mood": One of ["vintage", "warm", "cool", "dramatic", "dreamy", "noir", "neon"].
              3. "theme": Randomly select one of ["classic", "dark", "y2k", "cyberpunk", "luxury", "minimal"].
              
              Return ONLY the JSON string.`,
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
              mediaResolution: {
                level: "media_resolution_high",
              },
            } as any, // Type assertion needed for v1alpha feature
          ],
        },
      ],
    });

    let text = typeof (response as any).text === 'function' ? (response as any).text() : response.text;
    console.log("AI Raw Response:", text?.substring(0, 100) + "...");

    // Clean up markdown code blocks if present
    let jsonString = text?.replace(/```json\n?|```/g, "").trim();
    
    // Try to find the first '{' and last '}' to extract JSON
    const start = jsonString?.indexOf('{');
    const end = jsonString?.lastIndexOf('}');
    
    if (start !== undefined && start !== -1 && end !== undefined && end !== -1) {
      jsonString = jsonString.substring(start, end + 1);
    }
    
    if (!jsonString) {
      throw new Error("No response from AI");
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Generation Error:", error);
    const themes = ["classic", "dark", "y2k", "cyberpunk", "luxury", "minimal"];
    return {
      caption: "Memories captured ✨",
      mood: "vintage",
      theme: themes[Math.floor(Math.random() * themes.length)],
    };
  }
}

export async function generateImageEdit(imageBase64: string, prompt: string) {
  try {
    // Remove header if present
    const base64Data = imageBase64.split(",")[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    // Handle image response
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data in response");
  } catch (error: any) {
    console.error("AI Image Generation Error:", error);
    
    // Provide user-friendly error messages
    if (error?.status === 503) {
      throw new Error("The AI service is currently overloaded. Please try again in a few moments.");
    } else if (error?.status === 429) {
      throw new Error("Too many requests. Please wait a moment before trying again.");
    } else if (error?.message?.includes("quota")) {
      throw new Error("API quota exceeded. Please try again later.");
    }
    
    // Always throw a simple Error with a string message for proper serialization
    const errorMessage = error?.message || error?.toString() || "Failed to edit image";
    throw new Error(errorMessage);
  }
}



export async function generateImageFromPrompt(prompt: string, aspectRatio: string = "1:1") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      config: {
        responseModalities: ["IMAGE"],
        // @ts-ignore
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      } as any
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data in response");
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    throw error;
  }
}

export async function generateSocialCaptions(topic: string, details: string) {
  try {
    const prompt = `
      You are a viral social media manager.
      Generate 3 distinct captions for an infographic about "${topic}".
      
      Context/Details provided: "${details || "General educational content about " + topic}"

      1. **LinkedIn**: Professional, educational, insightful. Use bullet points if needed. 3-5 hashtags.
      2. **Instagram**: Engaging, short, punchy. Use emojis. 5-10 relevant hashtags.
      3. **Twitter (X)**: Short, controversial or hook-based. Under 280 chars. 2-3 hashtags.

      Return ONLY a valid JSON object with keys: "linkedin", "instagram", "twitter".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    let text = typeof (response as any).text === 'function' ? (response as any).text() : response.text;
    
    // Clean up markdown
    let jsonString = text?.replace(/```json\n?|```/g, "").trim();
    const start = jsonString?.indexOf('{');
    const end = jsonString?.lastIndexOf('}');
    if (start !== undefined && start !== -1 && end !== undefined && end !== -1) {
      jsonString = jsonString.substring(start, end + 1);
    }

    if (!jsonString) throw new Error("No text response");

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Caption Gen Error:", error);
    return {
      linkedin: `Here is a breakdown of ${topic}. #education #learning #growth`,
      instagram: `Master ${topic} with this guide! 🚀✨ #${topic.replace(/\s/g, '')} #learning`,
      twitter: `Everything you need to know about ${topic}. 👇 #${topic.replace(/\s/g, '')}`
    };
  }
}

export async function generateInfographicContent(topic: string) {
  try {
    const prompt = `
      You are an expert educational content strategist.
      Create a detailed, high-value visual outline for an infographic about: "${topic}".
      
      Structure the content strictly as follows:
      1. **Headline**: Catchy title.
      2. **Key Points**: 3-5 distinct, actionable steps or facts.
      3. **Visual Cues**: Brief description of what image/icon represents each point.
      4. **Summary**: A one-sentence takeaway.
      
      Keep it concise (fit for a single graphical page).
      Format as plain text with clear headings.
      Do not use markdown bolding too excessively, just clean text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = typeof (response as any).text === 'function' ? (response as any).text() : response.text;
    return text || "Failed to generate content.";
  } catch (error) {
    console.error("Content Gen Error:", error);
    return "Error generating content. Please try again or type manually.";
  }
}
