
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DiagramData, QuizQuestion } from "../types";

export interface FilePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

/**
 * Ensures the API Key is selected for high-quality image generation models.
 */
export const ensureApiKey = async (): Promise<boolean> => {
  if (typeof window.aistudio === 'undefined') return true; // fallback for non-managed envs
  const hasKey = await window.aistudio.hasSelectedApiKey();
  if (!hasKey) {
    await window.aistudio.openSelectKey();
    // Assume success as per guidelines to avoid race condition
    return true;
  }
  return true;
};

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const extractMedicalConcepts = async (
  notes: string, 
  pdfPart?: FilePart
): Promise<{ concepts: string[], deckTitle: string }> => {
  const ai = getAIClient();
  const parts: any[] = [{ text: `Analyze these medical notes/documents and extract exactly 3-5 high-yield anatomical or physiological concepts that would benefit from visual diagrams. Also provide a short, catchy title for this study deck.\n\nNotes: ${notes}` }];
  
  if (pdfPart) {
    parts.push(pdfPart);
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          concepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          deckTitle: { type: Type.STRING }
        },
        required: ["concepts", "deckTitle"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { concepts: [], deckTitle: "Untitled Deck" };
  }
};

export const generateMedicalDiagram = async (concept: string): Promise<string> => {
  const ai = getAIClient();
  const prompt = `A highly detailed, professional medical anatomy diagram of ${concept}. Clean white background, 4K resolution, accurate anatomical labels with leader lines, medical textbook style (like Netter or Gray's Anatomy). Focus on clarity for medical students.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data returned from Gemini");
};

export const generateQuizForConcept = async (
  concept: string, 
  context: string,
  pdfPart?: FilePart
): Promise<QuizQuestion[]> => {
  const ai = getAIClient();
  const parts: any[] = [{ text: `Generate 3 high-yield multiple choice questions for a medical student about ${concept} based on this context: ${context}. Include options, correct answer index (0-3), and a brief explanation.` }];
  
  if (pdfPart) {
    parts.push(pdfPart);
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};
