"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function getActiveChallenge() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('status', 'active')
    .single();
  
  if (error || !data || data.title === '3-Page Comic Story Challenge') {
      // Force return the new challenge details if DB has old one or is empty
      return {
          id: data?.id || 'default-talent-challenge',
          title: 'Share Your Talent: Create a Mini-Book',
          description: 'Share your expertise! Create a 6-8 page illustrated mini-book teaching something you know. From cooking to coding, fitness to finance.',
          prize_amount: '$10 USD',
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
      };
  }
  return data;
}

export async function registerForChallenge(challengeId: string, userImageUrl?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('challenge_registrations')
    .insert({
      challenge_id: challengeId,
      user_id: user.id,
      user_image_url: userImageUrl
    });
    
  if (error) {
      // Ignore duplicate registration error
      if (error.code === '23505') return; 
      throw error;
  }
  revalidatePath('/challenges');
}

export async function generateBookCover(title: string, customPrompt?: string, referenceImage?: string) {
    try {
        console.log(`Generating cover for "${title}". Ref image present: ${!!referenceImage}`);

        let finalPrompt = customPrompt 
            ? `Create a professional Book Cover based on this description: ${customPrompt}. Title: ${title}.`
            : `Create a professional Book Cover. Title/Topic: ${title}.`;

        finalPrompt += `\nRequirements: High quality, professional finish, Aspect Ratio 3:4 (Portrait).`;

        if (referenceImage) {
            finalPrompt += `\n\nCRITICAL INSTRUCTION: A reference image is attached. You MUST use this image as the primary visual source. If it contains a person, feature them on the cover. If it's a style, mimic it closely. Incorporate the reference image into the design seamlessly.`;
        }

        const contentParts: any[] = [{ text: finalPrompt }];
        
        if (referenceImage) {
            const data = referenceImage.split(",")[1] || referenceImage;
            contentParts.push({ inlineData: { mimeType: "image/jpeg", data: data } });
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-pro-image-preview",
            contents: contentParts,
            config: {
                responseModalities: ["IMAGE"],
                imageConfig: { aspectRatio: "3:4" }
            } as any
        });
        
        if (!response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
            throw new Error("Failed to generate cover");
        }
        
        return `data:image/png;base64,${response.candidates[0].content.parts[0].inlineData.data}`;
    } catch (error) {
        console.error("Cover Generation Error:", error);
        throw error;
    }
}

export async function generateMiniBookPages(
    topic: string,
    category: string,
    pageCount: number = 6
) {
    try {
        const generatePage = async (pageNum: number) => {
            const pagePrompt = `Create Page ${pageNum} of a ${pageCount}-page illustrated mini-book.
            Topic: ${topic}
            Category: ${category}
            
            Requirements:
            - Educational/Instructional content visualization.
            - Clear illustrations explaining the concept.
            - Text/Labels where appropriate (English).
            - Consistent style across pages.
            - Aspect Ratio 3:4.
            `;

            const response = await ai.models.generateContent({
                model: "gemini-3-pro-image-preview",
                contents: [{ parts: [{ text: pagePrompt }] }],
                config: {
                    responseModalities: ["IMAGE"],
                    imageConfig: { aspectRatio: "3:4" }
                } as any
            });
            
            if (!response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
                throw new Error(`Failed to generate page ${pageNum}`);
            }
            
            return `data:image/png;base64,${response.candidates[0].content.parts[0].inlineData.data}`;
        };

        const promises = Array.from({ length: pageCount }, (_, i) => generatePage(i + 1));
        const pages = await Promise.all(promises);
        return pages;

    } catch (error) {
        console.error("Book Generation Error:", error);
        throw error;
    }
}

export async function submitChallengeEntry(
    challengeId: string, 
    title: string, 
    prompt: string, 
    category: string,
    coverImage: string,
    bookPages: string[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const uploadImage = async (base64: string, prefix: string) => {
      if (base64.startsWith('http')) return base64;

      const base64Data = base64.split(',')[1] || base64;
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `challenge/${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      
      // Use the dedicated challenge-uploads bucket
      const { error } = await supabase.storage.from('challenge-uploads').upload(fileName, buffer, { contentType: 'image/png' });
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('challenge-uploads').getPublicUrl(fileName);
      return publicUrl;
  };

  const coverUrl = await uploadImage(coverImage, 'cover');
  const pageUrls = await Promise.all(bookPages.map((page, i) => uploadImage(page, `page-${i+1}`)));

  // Get username
  const username = user.user_metadata.full_name || user.email?.split('@')[0] || "Anonymous Creator";

  const { error } = await supabase.from('challenge_entries').insert({
    challenge_id: challengeId,
    user_id: user.id,
    username,
    title,
    prompt,
    category,
    hero_image_url: coverUrl,
    comic_pages: pageUrls, // Reusing comic_pages column for book pages
  });

  if (error) throw error;
  revalidatePath(`/challenges`);
}

export async function getChallengeEntries(challengeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('challenge_entries')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('upvotes_count', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function toggleChallengeUpvote(entryId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.rpc('toggle_challenge_upvote', { entry_id_input: entryId });
    if (error) throw error;
    revalidatePath('/challenges');
}

export async function getUserChallengeUpvotes() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from('challenge_upvotes')
        .select('entry_id')
        .eq('user_id', user.id);
    
    return data?.map(v => v.entry_id) || [];
}
