import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;
    const aspectRatio = formData.get("aspectRatio") as string || "16:9";
    const referenceImage = formData.get("referenceImage") as File | null;

    if (!image || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert Image to Base64
    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    const parts: any[] = [
      { text: prompt },
      {
        inlineData: {
          mimeType: image.type || "image/jpeg",
          data: imageBase64,
        },
      },
    ];

    if (referenceImage) {
      const referenceBuffer = await referenceImage.arrayBuffer();
      const referenceBase64 = Buffer.from(referenceBuffer).toString("base64");
      
      parts.push({
        inlineData: {
          mimeType: referenceImage.type || "image/jpeg",
          data: referenceBase64,
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
        responseModalities: ["TEXT", "IMAGE"],
        // @ts-ignore - Types might not be updated yet
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      } as any
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const generatedImage = `data:image/png;base64,${part.inlineData.data}`;
          return NextResponse.json({ result: generatedImage });
        }
      }
    }
    
    throw new Error("No image data in response");

  } catch (error: any) {
    console.error("Thumbnail Generation Error:", error);
    
    let errorMessage = "Failed to generate thumbnail";
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
