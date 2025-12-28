import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userImage = formData.get("userImage") as File;
    const productImage = formData.get("productImage") as File | null;
    const prompt = formData.get("prompt") as string;
    const filter = formData.get("filter") as string;

    if (!userImage || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const mode = formData.get("mode") as string || "creative";

    const negativePrompt = formData.get("negativePrompt") as string || "";

    // Convert User Image to Base64
    const userImageBuffer = await userImage.arrayBuffer();
    const userImageBase64 = Buffer.from(userImageBuffer).toString("base64");

    // Convert Product Image to Base64 if exists
    let productImageBase64 = null;
    if (productImage) {
      const productImageBuffer = await productImage.arrayBuffer();
      productImageBase64 = Buffer.from(productImageBuffer).toString("base64");
    }

    let productInstruction = "";
    if (productImageBase64) {
      if (mode === "try-on") {
        productInstruction = "The second image provided is a CLOTHING ITEM. You must dress the USER (first image) in this EXACT clothing item. Replace the user's current outfit with this new one, fitting it perfectly to their body pose. Maintain the fabric texture and details of the clothing item.";
      } else if (mode === "trending-music") {
        productInstruction = "The second image provided is a REFERENCE UI (Spotify Playlist). You must recreate a similar high-resolution, READABLE music interface in the background. The text (song names, artists) MUST be distinct and legible. Do NOT blur the text. The interface should look like a sharp desktop screen or projection behind the subject.";
      } else {
        productInstruction = "The second image provided is a PRODUCT. Integrate this product naturally into the scene.";
      }
    }

    const finalPrompt = `
    Task: ${mode === "trending-music" ? "Generate a viral, cinematic social media image (Vertical 9:16)." : "Generate a high-quality, photorealistic photoshoot image."}
    Style Filter: ${filter} ${filter !== "none" ? "(Apply this aesthetic strongly)" : ""}
    User Request/Prompt: ${prompt}
    
    CRITICAL INSTRUCTIONS:
    1. The first image provided is the USER. You MUST preserve their facial features, identity, and likeness exactly. Do not change their face.
    2. ${productInstruction}
    3. ${mode === "trending-music" ? "The output must be a 9:16 aspect ratio vertical image. Focus on high-contrast, editorial lighting." : "The output must be a 1:1 aspect ratio image."}
    4. ${mode === "trending-music" ? "ENSURE TEXT ON THE UI BACKGROUND IS SHARP AND READABLE. NO MOTION BLUR ON THE SCREEN." : "Make it look like a professional photoshoot. High end, sexy, aesthetic."}
    5. ${negativePrompt ? `NEGATIVE PROMPT (Do NOT include): ${negativePrompt}` : ""}
    `;

    const contentParts: any[] = [{ text: finalPrompt }];

    contentParts.push({ 
      inlineData: { 
        mimeType: userImage.type || "image/jpeg", 
        data: userImageBase64 
      } 
    });

    if (productImageBase64) {
      contentParts.push({ 
        inlineData: { 
          mimeType: productImage?.type || "image/jpeg", 
          data: productImageBase64 
        } 
      });
    }

    const aspectRatio = mode === "trending-music" ? "9:16" : "1:1";

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview", 
      contents: contentParts,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { 
          aspectRatio: aspectRatio,
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

    const generatedImage = `data:image/png;base64,${imagePart.inlineData.data}`;

    return NextResponse.json({ result: generatedImage });

  } catch (error: any) {
    console.error("Photoshoot Generation Error:", error);
    
    let errorMessage = "Failed to generate photoshoot";
    let status = 500;

    if (error?.status === 503) {
      errorMessage = "The AI service is currently overloaded. Please try again in a few moments.";
      status = 503;
    } else if (error?.status === 429) {
      errorMessage = "Too many requests. Please wait a moment before trying again.";
      status = 429;
    } else if (error?.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Please try again later.";
      status = 429;
    } else {
      errorMessage = error?.message || error?.toString();
    }

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
