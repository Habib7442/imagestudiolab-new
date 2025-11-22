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
  } catch (error) {
    console.error("AI Image Generation Error:", error);
    throw error;
  }
}

export async function generateThumbnail(
  imageBase64: string, 
  prompt: string, 
  aspectRatio: string = "16:9",
  referenceImageBase64?: string
) {
  try {
    const base64Data = imageBase64.split(",")[1] || imageBase64;
    
    const parts: any[] = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      },
    ];

    if (referenceImageBase64) {
      const referenceData = referenceImageBase64.split(",")[1] || referenceImageBase64;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: referenceData,
        },
      });
      parts[0].text += " Use the second image as a style reference.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [
        {
          parts: parts,
        },
      ],
      config: {
        responseModalities: ["IMAGE"],
        // @ts-ignore - Types might not be updated yet
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
    console.error("Thumbnail Generation Error:", error);
    throw error;
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
