import { GoogleGenAI } from "@google/genai";
import { FilePart, TopicConcept, QuizQuestion, TargetLevel } from "./types";

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "", 
  apiVersion: "v1alpha" 
} as any);

const parseJSONSafely = (text: string) => {
  // 1. Initial attempt
  try {
    return JSON.parse(text);
  } catch (e) {
    // 2. Clean markdown blocks
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      // 3. Last resort: Regex extraction for common fields if JSON is malformed
      console.warn("Standard JSON parse failed, attempting regex extraction...", text);
      const textMatch = cleaned.match(/"text"\s*:\s*"([\s\S]*?)"\s*(?:|\})/);
      const promptMatch = cleaned.match(/"imagePrompt"\s*:\s*"([\s\S]*?)"\s*(?:|\})/);
      
      if (textMatch && promptMatch) {
        return {
          text: textMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
          imagePrompt: promptMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
        };
      }

      console.error("Failed to parse JSON even after cleaning and regex fallback:", text);
      throw e2;
    }
  }
};

const getPersona = (level: TargetLevel) => {
  if (level.startsWith('class')) return `a specialized high school teacher for ${level.replace('_', ' ')}`;
  if (level.startsWith('eng')) return `a senior engineering professor specializing in ${level.split('_')[1].toUpperCase()}`;
  if (level.startsWith('med')) return `an elite medical specialist and board examiner for ${level.split('_')[1].toUpperCase()}`;
  return "an expert educator";
};

const getDiagramStyle = (level: TargetLevel) => {
  if (level.startsWith('med')) return "professional medical textbook style (Netter/Gray's), clean surgical background, detailed anatomical labels";
  if (level.startsWith('eng')) return "precise engineering blueprint style, technical schematic, CAD-like clarity, professional mechanical/electrical annotations";
  return "clear educational textbook illustration, vibrant colors, student-friendly labels, academic style";
};

export const extractConcepts = async (
  notes: string, 
  targetLevel: TargetLevel,
  filePart?: FilePart
): Promise<{ concepts: TopicConcept[], deckTitle: string }> => {
  const parts: any[] = [{
    text: `You are ${getPersona(targetLevel)}. Analyze the following notes and documents for a student at the ${targetLevel} level. 
    Extract 5-7 high-yield concepts that are critical for mastering this topic at this specific academic level.
    For each concept, provide a detailed description and a 'significance' field explaining why this is important for their specific curriculum/exams.
    Return ONLY a JSON object with 'concepts' (array of {concept, description, significance}) and 'deckTitle' (string).
    
    Notes:
    ${notes}`
  }];

  if (filePart) {
    parts.push(filePart);
  }

  try {
    const result = await (genAI as any).models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = result.response || result;
    const text = typeof response.text === 'function' ? response.text() : response.text;
    
    if (!text) {
      throw new Error("No response text from Gemini 3 Flash");
    }

    return parseJSONSafely(text);
  } catch (err: any) {
    console.error("DETAILED CONCEPT EXTRACTION ERROR:", err);
    throw err;
  }
};

export const generateDiagram = async (concept: string, targetLevel: TargetLevel, isPremium: boolean = false): Promise<string> => {
  const style = getDiagramStyle(targetLevel);
  const quality = isPremium ? "ultra-high definition 4K, studio lighting, hyper-realistic textures" : "clear academic resolution";

  const prompt = `Generate a professional educational illustration of: ${concept}. 
  Target Context: ${targetLevel}.
  Style: ${style}. ${quality}.
  Include precise labels and annotations relevant to ${targetLevel} studies. 
  Focus on high-fidelity representation of the technical subject matter.`;

  try {
    const result = await (genAI as any).models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [{
        parts: [{ text: prompt }]
      }]
    });

    const response = result.response || result;
    const candidates = response.candidates || (result.response && result.response.candidates);
    
    if (!candidates || candidates.length === 0) {
      return "";
    }

    const part = candidates[0].content?.parts?.find((p: any) => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (e) {
    console.error("Gemini 3 Pro Image generation failed:", e);
  }
  
  return ""; 
};

export const generateQuiz = async (concept: string, notes: string, targetLevel: TargetLevel, filePart?: FilePart): Promise<QuizQuestion[]> => {
  const parts: any[] = [{
    text: `You are ${getPersona(targetLevel)} and a professional examiner. 
    Generate 5-7 high-yield MCQs about ${concept} specialized for a ${targetLevel} curriculum.
    The questions should be application-based scenarios appropriate for this level. 
    Return ONLY a JSON array of objects with:
    - 'question': the problem or scenario
    - 'options': 5 plausible strings (standardized exam format)
    - 'correctAnswer': index 0-4
    - 'explanation': detailed logical reasoning using terms appropriate for ${targetLevel}
    - 'key_takeaway': a one-sentence high-yield tip for mastering this topic.

    Notes context: ${notes}`
  }];

  if (filePart) {
    parts.push(filePart);
  }

  try {
    const result = await (genAI as any).models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = result.response || result;
    const text = typeof response.text === 'function' ? response.text() : response.text;
    
    if (!text) {
      throw new Error("No quiz data response text from Gemini 3 Flash");
    }

    return parseJSONSafely(text);
  } catch (err) {
    console.error("DETAILED QUIZ GENERATION ERROR:", err);
    throw err;
  }
};

export const generateInfographicContent = async (topic: string, notes: string, targetLevel: TargetLevel, filePart?: FilePart): Promise<{ text: string, imagePrompt: string }> => {
    const parts: any[] = [{
      text: `Generate a detailed educational infographic for: ${topic} at the ${targetLevel} level.
      1. Provide a 'text' field with structured markdown (Overview, Core Principles, Key Applications, Professional Significance, Summary).
      2. Provide an 'imagePrompt' field: an ultra-descriptive prompt for an image generation model to create a professional infographic poster. 
         The visual style should be: ${getDiagramStyle(targetLevel)}.
      Return ONLY a JSON object with 'text' and 'imagePrompt'.
      
      CRITICAL: Your response must be VALID JSON. 
      - Do NOT use unescaped double quotes inside the 'text' or 'imagePrompt' strings. 
      - Use single quotes (') for any internal emphasis or names.
      - Ensure all newlines in markdown are correctly escaped as \\n.
      
      Notes context: ${notes}`
    }];
  
    if (filePart) {
      parts.push(filePart);
    }
  
    try {
      const result = await (genAI as any).models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      });
    
      const response = result.response || result;
      const text = typeof response.text === 'function' ? response.text() : response.text;
      
      if (!text) {
        throw new Error("No infographic content from Gemini 3 Flash");
      }
      
      return parseJSONSafely(text);
    } catch (err) {
      console.error("DETAILED INFOGRAPHIC CONTENT ERROR:", err);
      throw err;
    }
};

export const generateInfographicImage = async (prompt: string, targetLevel: TargetLevel): Promise<string> => {
    const fullPrompt = `${prompt}. Style: professional educational infographic, ${getDiagramStyle(targetLevel)}, high resolution, clean scientific colors, white background.`;

    try {
      const result = await (genAI as any).models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: [{
          parts: [{ text: fullPrompt }]
        }]
      });
  
      const response = result.response || result;
      const candidates = response.candidates || (result.response && result.response.candidates);
      
      if (!candidates || candidates.length === 0) return "";
  
      const part = candidates[0].content?.parts?.find((p: any) => p.inlineData);
      if (part?.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    } catch (e) {
      console.error("Infographic Image generation failed:", e);
    }
    
    return ""; 
};
