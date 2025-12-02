import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { YoutubeTranscript } from 'youtube-transcript';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY, apiVersion: "v1alpha" });

// Helper to clean text from code blocks if Gemini returns markdown
function cleanJson(text: string) {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

async function generateSlideImage(prompt: string, aspectRatio: string = "3:4") {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: ["IMAGE"],
                imageConfig: { aspectRatio: aspectRatio as any }
            } as any
        });

        if (!response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
            console.error("Failed to generate image for prompt:", prompt);
            return null; // Return null instead of crashing
        }

        return `data:image/png;base64,${response.candidates[0].content.parts[0].inlineData.data}`;
    } catch (error) {
        console.error("Image Generation Error:", error);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const type = formData.get('type') as string; // 'youtube' | 'pdf' | 'image' | 'topic'
        const mode = formData.get('mode') as string; // 'create' | 'update'
        
        
        // --- UPDATE MODE ---
        if (mode === 'update') {
            const slideIndex = formData.get('slideIndex');
            const currentSlideJson = formData.get('currentSlide');
            const userPrompt = formData.get('prompt') as string;
            const aspectRatio = (formData.get('aspectRatio') as string) || "3:4";
            const useCustomImage = formData.get('useCustomImage') === 'true';
            const customImage = formData.get('customImage') as File | null;
            
            if (!currentSlideJson || !userPrompt) {
                return NextResponse.json({ error: "Missing data for update" }, { status: 400 });
            }

            const currentSlide = JSON.parse(currentSlideJson as string);

            // 1. Update Content/Prompt via LLM
            const updatePrompt = `
                You are an expert editor. Update the following slide content based on the user's request.
                
                Current Slide:
                Title: ${currentSlide.title}
                Content: ${currentSlide.content}
                Image Prompt: ${currentSlide.image_prompt}

                User Request: ${userPrompt}

                Return ONLY a JSON object with the updated fields (title, content, image_prompt).
                Do not change the structure.
            `;

            const textResponse = await ai.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: [{ parts: [{ text: updatePrompt }] }]
            });

            const updatedData = JSON.parse(cleanJson(textResponse.candidates?.[0]?.content?.parts?.[0]?.text || "{}"));
            
            // 2. Handle Image - either use custom upload or regenerate with AI
            let newImageUrl = currentSlide.image_url;
            
            if (useCustomImage && customImage) {
                // Convert custom image to base64
                const arrayBuffer = await customImage.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                newImageUrl = `data:${customImage.type};base64,${base64}`;
            } else {
                // Regenerate Image with AI
                newImageUrl = await generateSlideImage(updatedData.image_prompt || currentSlide.image_prompt, aspectRatio);
            }

            return NextResponse.json({
                slide: {
                    ...currentSlide,
                    ...updatedData,
                    image_url: newImageUrl || currentSlide.image_url // Fallback to old image if gen fails
                }
            });
        }

        // --- CREATE MODE ---
        let contextText = "";
        let contextImageParts: any[] = [];
        const aspectRatio = (formData.get('aspectRatio') as string) || "3:4";

        const slideCount = parseInt(formData.get('slideCount') as string) || 6;

        // 1. Extract Context based on Type
        console.log("Received request type:", type);

        if (type === 'youtube') {
            const url = formData.get('url') as string;
            if (!url) return NextResponse.json({ error: "YouTube URL is missing" }, { status: 400 });
            
            try {
                console.log("Fetching transcript for:", url);
                const transcriptItems = await YoutubeTranscript.fetchTranscript(url);
                if (!transcriptItems || transcriptItems.length === 0) {
                     throw new Error("No transcript found");
                }
                contextText = transcriptItems.map(item => item.text).join(' ').slice(0, 20000);
                console.log("Transcript length:", contextText.length);
            } catch (e) {
                console.error("YouTube Error:", e);
                return NextResponse.json({ error: "Failed to fetch YouTube transcript. Ensure the video has captions/subtitles available." }, { status: 400 });
            }
        } else if (type === 'pdf') {
            const file = formData.get('file') as File;
            if (!file) return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                // Send PDF directly to Gemini with recommended media resolution for PDFs
                contextImageParts.push({ 
                    inlineData: { 
                        mimeType: file.type, 
                        data: base64 
                    },
                    mediaResolution: {
                        level: "media_resolution_medium" // Recommended for PDFs
                    }
                });
                contextText = "Analyze this PDF document and create a carousel based on its content.";
                console.log("PDF uploaded, size:", arrayBuffer.byteLength);
            } catch (e) {
                console.error("PDF Error:", e);
                return NextResponse.json({ error: "Failed to process PDF file" }, { status: 400 });
            }
        } else if (type === 'image') {
            const file = formData.get('file') as File;
            if (!file) return NextResponse.json({ error: "No image file uploaded" }, { status: 400 });
            
            if (file) {
                const arrayBuffer = await file.arrayBuffer();
                const base64 = Buffer.from(arrayBuffer).toString('base64');
                contextImageParts.push({ inlineData: { mimeType: file.type, data: base64 } });
                contextText = "Analyze this image and create a carousel based on its content.";
            }
        } else if (type === 'topic') {
            const topic = (formData.get('topic') as string) || "";
            const content = (formData.get('content') as string) || "";
            
            if (!topic.trim()) return NextResponse.json({ error: "Topic is empty" }, { status: 400 });
            
            contextText = `Topic: ${topic}\n\nAdditional Content/Context:\n${content}`;
        }

        if (!contextText && contextImageParts.length === 0) {
            console.error("No content extracted. Type:", type);
            return NextResponse.json({ error: `No content could be extracted from the ${type} source.` }, { status: 400 });
        }

        // 2. Generate Slide Structure (Text)
        const systemPrompt = `
            You are an expert social media content creator. Create a ${slideCount}-slide carousel based on the provided context.
            
            Structure:
            - Slide 1: Hook/Cover (Catchy title, intriguing visual description)
            - Slide 2-${slideCount - 1}: Key Points/Educational Content (One main idea per slide, concise text)
            - Slide ${slideCount}: Call to Action/Summary

            Output Format: JSON Array of objects.
            [
                {
                    "title": "String (Short & Punchy)",
                    "content": "String (Max 30 words)",
                    "image_prompt": "String (Detailed visual description for AI image generator, style: modern, minimal, high quality)"
                }
            ]
            
            Context:
            ${contextText.slice(0, 5000)}... (truncated)
        `;

        const generationConfig = {
            responseMimeType: "application/json",
        }

        const textResponse = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [
                { role: "user", parts: [...contextImageParts, { text: systemPrompt }] }
            ],
            config: generationConfig as any
        });

        const slidesJson = JSON.parse(cleanJson(textResponse.candidates?.[0]?.content?.parts?.[0]?.text || "[]"));

        if (!Array.isArray(slidesJson) || slidesJson.length === 0) {
            throw new Error("Failed to generate valid slides structure");
        }

        // 3. Generate Images for each slide (Parallel)
        // We limit to slideCount slides max to save resources/time
        const limitedSlides = slidesJson.slice(0, slideCount);
        
        const slidesWithImages = await Promise.all(limitedSlides.map(async (slide, index) => {
            // Enhance prompt for consistency - use the actual aspect ratio
            const enhancedPrompt = `${slide.image_prompt}. Style: Modern, Minimalist, High Quality, 4k. Aspect Ratio ${aspectRatio}.`;
            const imageUrl = await generateSlideImage(enhancedPrompt, aspectRatio);
            return {
                ...slide,
                id: index,
                image_url: imageUrl
            };
        }));

        return NextResponse.json({ slides: slidesWithImages });

    } catch (error) {
        console.error("Carousel Generation Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
