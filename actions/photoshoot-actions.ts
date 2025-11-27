"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function generatePhotoshoot(
  userImageBase64: string,
  productImageBase64: string | null,
  prompt: string,
  filter: string
) {
  try {
    const finalPrompt = `
    Task: Generate a high-quality, photorealistic photoshoot image.
    Style Filter: ${filter} (Apply this aesthetic strongly).
    
    User Request: ${prompt}
    
    CRITICAL INSTRUCTIONS:
    1. The first image provided is the USER. You MUST preserve their facial features, identity, and likeness exactly. Do not change their face.
    2. ${productImageBase64 ? "The second image provided is a PRODUCT. Integrate this product naturally into the scene." : ""}
    3. The output must be a 1:1 aspect ratio image.
    4. Make it look like a professional photoshoot. High end, sexy, aesthetic.
    5. Ensure the lighting and composition match the requested "${filter}" style.
    `;

    const contentParts: any[] = [{ text: finalPrompt }];

    // Process User Image (remove data URL prefix if present)
    const userImageData = userImageBase64.split(",")[1] || userImageBase64;
    contentParts.push({ 
      inlineData: { 
        mimeType: "image/jpeg", 
        data: userImageData 
      } 
    });

    // Process Product Image if exists
    if (productImageBase64) {
      const productImageData = productImageBase64.split(",")[1] || productImageBase64;
      contentParts.push({ 
        inlineData: { 
          mimeType: "image/jpeg", 
          data: productImageData 
        } 
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview", 
      contents: contentParts,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { 
          aspectRatio: "1:1",
          imageSize: "2K"
        }
      } as any
    });

    // Find the image part in the response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.startsWith("image/")
    );

    if (!imagePart?.inlineData?.data) {
      console.error("Response structure:", JSON.stringify(response, null, 2));
      throw new Error("No image data found in response");
    }

    return `data:image/png;base64,${imagePart.inlineData.data}`;
  } catch (error) {
    console.error("Photoshoot Generation Error:", error);
    throw error;
  }
}
