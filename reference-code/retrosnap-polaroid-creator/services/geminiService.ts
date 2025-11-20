
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { MusicTrack } from "../types";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAiCaption = async (imageBase64: string): Promise<string> => {
  try {
    const ai = getAiClient();
    
    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            {
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/png' 
                }
            },
            {
                text: "Analyze this image and generate a short, nostalgic, handwritten-style caption for a polaroid photo. It should be sentimental, witty, or aesthetic. Maximum 8 words. Return ONLY the caption text."
            }
        ]
      }
    });

    return response.text?.trim() || "Memories...";
  } catch (error) {
    console.error("Error generating caption:", error);
    throw error;
  }
};

export const editImageWithAi = async (imageBase64: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  const base64Data = imageBase64.split(',')[1] || imageBase64;
  
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
          parts: [
              { inlineData: { data: base64Data, mimeType: 'image/png' } },
              { text: `Edit this image: ${prompt}. Maintain the original aspect ratio.` }
          ]
      },
      config: {
          responseModalities: [Modality.IMAGE]
      }
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part?.inlineData?.data) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image generated");
};

export const generateAiSticker = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Generate a die-cut scrapbook sticker of ${prompt}. White background, vector art style, cute and aesthetic.` }
        ]
      },
      config: {
          responseModalities: [Modality.IMAGE]
      }
  });

  const part = response.candidates?.[0]?.content?.parts?.[0];
  if (part?.inlineData?.data) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No sticker generated");
};

export const generateMusicMetadata = async (imageBase64: string): Promise<MusicTrack> => {
  const ai = getAiClient();
  const base64Data = imageBase64.split(',')[1] || imageBase64;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: 'image/png' } },
        { text: "Analyze the mood of this image and suggest a fictional song track that would play in the background. Provide a mood (happy, sad, chill, energetic), a tempo (60-160 bpm), a creative song title, and a fictional artist name." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          artist: { type: Type.STRING },
          mood: { type: Type.STRING, enum: ["happy", "sad", "chill", "energetic"] },
          tempo: { type: Type.INTEGER }
        },
        required: ["title", "artist", "mood", "tempo"]
      }
    }
  });

  const json = JSON.parse(response.text || "{}");
  
  return {
    title: json.title || "Untitled Memory",
    artist: json.artist || "Unknown Artist",
    mood: json.mood || "chill",
    tempo: json.tempo || 90,
    source: 'generated'
  };
};
