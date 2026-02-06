import { inngest } from "./client";
import { 
  extractConcepts, 
  generateDiagram, 
  generateQuiz, 
  generateInfographicContent, 
  generateInfographicImage 
} from "../gemini";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin for background tasks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SECRET_KEY || ""
);

async function setLoadingStepInDB(id: string, step: string) {
  await supabaseAdmin
    .from("generations")
    .update({ error_message: `AI Status: ${step}` })
    .eq("id", id);
}

async function uploadBase64Image(base64Data: string, fileName: string) {
  if (!base64Data || !base64Data.startsWith('data:image')) return "";
  
  try {
    const [mimePart, base64] = base64Data.split(',');
    const mime = mimePart.match(/:(.*?);/)?.[1] || 'image/png';
    const binary = Buffer.from(base64, 'base64');
    
    const { data, error } = await supabaseAdmin
      .storage
      .from("deck-assets")
      .upload(`vibe_${fileName}_${Date.now()}.png`, binary, {
        contentType: mime,
        upsert: true
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from("deck-assets")
      .getPublicUrl(data.path);
      
    return publicUrl;
  } catch (err) {
    console.error("Storage upload failed:", err);
    return "";
  }
}

export const generateStudyDeck = inngest.createFunction(
  { id: "generate-study-deck" },
  { event: "app/deck.generate" },
  async ({ event, step }) => {
    const { generationId, notes, targetLevel, userId, fileUrl, fileType } = event.data;

    // Shared helper to get file data without storing it in Inngest history
    const getFileData = async () => {
      if (!fileUrl) return undefined;
      const { data, error } = await supabaseAdmin.storage.from("study-notes").download(fileUrl);
      if (error || !data) return undefined;
      const buffer = await data.arrayBuffer();
      return {
        inlineData: { data: Buffer.from(buffer).toString('base64'), mimeType: fileType }
      };
    };

    // 1. Initial Update
    await step.run("update-status-processing", async () => {
      await supabaseAdmin
        .from("generations")
        .update({ status: "processing" })
        .eq("id", generationId);
    });

    try {
      // 2. Extract Concepts
      setLoadingStepInDB(generationId, "Analyzing core concepts...");
      const extraction = await step.run("extract-concepts", async () => {
        const fileContent = await getFileData();
        const result = await extractConcepts(notes, targetLevel, fileContent as any);
        
        await supabaseAdmin
          .from("generations")
          .update({ 
            title: result.deckTitle,
            concepts: result.concepts,
            status: "processing" 
          })
          .eq("id", generationId);
        return result;
      });

      const { concepts, deckTitle } = extraction;
      const diagram_urls: string[] = [];
      const updatedConcepts = [...concepts.slice(0, 6)];

      // 3. Generate Illustrations (Granular Steps)
      for (let i = 0; i < updatedConcepts.length; i++) {
        const item = updatedConcepts[i];
        const stepId = `illustration-${i}-${item.concept.substring(0, 10)}`;
        
        const imageUrl = await step.run(stepId, async () => {
          try {
            const base64 = await generateDiagram(item.concept, targetLevel, !!userId);
            if (!base64) return "";
            
            const url = await uploadBase64Image(base64, `concept_${i}_${generationId}`);
            if (url) {
              // Immediate DB update for this specific concept
              const currentConcepts = [...updatedConcepts];
              currentConcepts[i] = { ...item, image_url: url } as any;
              
              const currentUrls = [...diagram_urls, url];
              
              await supabaseAdmin
                .from("generations")
                .update({ 
                  concepts: currentConcepts,
                  diagram_urls: currentUrls,
                  diagram_url: currentUrls[0] || ""
                })
                .eq("id", generationId);
                
              return url;
            }
          } catch (err) {
            console.error(`Failed illustration for ${item.concept}`, err);
          }
          return "";
        });

        if (imageUrl) {
          diagram_urls.push(imageUrl);
          updatedConcepts[i] = { ...item, image_url: imageUrl } as any;
        }
      }

      // 4. Generate Quiz
      const quiz_data = await step.run("generate-quiz", async () => {
        const fileContent = await getFileData();
        const result = await generateQuiz(deckTitle || concepts[0].concept, notes, targetLevel, fileContent as any);
        await supabaseAdmin
          .from("generations")
          .update({ quiz_data: result })
          .eq("id", generationId);
        return result;
      });

      // 5. Generate Infographic
      const infographic = await step.run("generate-infographic-content", async () => {
        const fileContent = await getFileData();
        return await generateInfographicContent(deckTitle || concepts[0].concept, notes, targetLevel, fileContent as any);
      });

      const infographic_image_url = await step.run("generate-infographic-image", async () => {
        const base64 = await generateInfographicImage(infographic.imagePrompt, targetLevel);
        if (base64) {
          const url = await uploadBase64Image(base64, `info_${generationId}`);
          // Final partial update
          await supabaseAdmin
            .from("generations")
            .update({ infographic_image_url: url })
            .eq("id", generationId);
          return url;
        }
        return "";
      });

      // 6. Final Update
      await step.run("finalize-deck", async () => {
        const { error } = await supabaseAdmin
          .from("generations")
          .update({
            infographic_data: infographic.text,
            infographic_image_url: infographic_image_url,
            status: "completed"
          })
          .eq("id", generationId);

        if (error) throw error;
      });

      // 7. Cleanup Storage
      if (fileUrl) {
        await step.run("cleanup-storage", async () => {
           await supabaseAdmin.storage.from("study-notes").remove([fileUrl]);
        });
      }

      return { success: true };

    } catch (error: any) {
      console.error("INNEST GENERATION ERROR:", error);
      
      await step.run("handle-failure", async () => {
        // 1. Mark as failed
        await supabaseAdmin
          .from("generations")
          .update({ 
            status: "failed",
            error_message: error?.message || "Generation failed in background processing."
          })
          .eq("id", generationId);

        // 2. Refund Credit
        if (userId) {
          const { data: userData } = await supabaseAdmin
            .from("users")
            .select("credits")
            .eq("id", userId)
            .single();
            
          if (userData) {
            await supabaseAdmin
              .from("users")
              .update({ credits: userData.credits + 1 })
              .eq("id", userId);
          }
        }
      });

      throw error;
    }
  }
);
