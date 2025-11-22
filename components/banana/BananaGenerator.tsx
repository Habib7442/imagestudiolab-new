"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Upload, Trash2 } from "lucide-react";
import { generateImageFromPrompt } from "@/actions/ai-actions";
import { uploadBananaImage, submitBananaPost } from "@/actions/banana-actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function BananaGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const savedImage = localStorage.getItem('banana_generated_image');
    const savedPrompt = localStorage.getItem('banana_prompt');
    const savedRatio = localStorage.getItem('banana_aspect_ratio');
    if (savedImage) setGeneratedImage(savedImage);
    if (savedPrompt) setPrompt(savedPrompt);
    if (savedRatio) setAspectRatio(savedRatio);
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const imageBase64 = await generateImageFromPrompt(prompt, aspectRatio);
      setGeneratedImage(imageBase64);
      localStorage.setItem('banana_generated_image', imageBase64);
      localStorage.setItem('banana_prompt', prompt);
      localStorage.setItem('banana_aspect_ratio', aspectRatio);
    } catch (error) {
      console.error("Generation failed", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setGeneratedImage(null);
    setPrompt("");
    localStorage.removeItem('banana_generated_image');
    localStorage.removeItem('banana_prompt');
    localStorage.removeItem('banana_aspect_ratio');
  };

  const handlePost = async () => {
    if (!generatedImage || !prompt) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("Please log in to post to the wall!");
      router.push("/login?returnTo=/nano-banana-wall");
      return;
    }

    setIsPosting(true);
    try {
      // 1. Upload to Storage
      const publicUrl = await uploadBananaImage(generatedImage);
      
      // 2. Save to DB
      await submitBananaPost(prompt, publicUrl);
      
      alert("Posted successfully!");
      handleClear();
    } catch (error) {
      console.error("Posting failed", error);
      alert("Failed to post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const ratios = [
    { label: "Square (1:1)", value: "1:1" },
    { label: "Landscape (16:9)", value: "16:9" },
    { label: "Portrait (9:16)", value: "9:16" },
    { label: "Standard (4:3)", value: "4:3" },
  ];

  const getAspectClass = (ratio: string) => {
    switch(ratio) {
      case "16:9": return "aspect-video";
      case "9:16": return "aspect-[9/16]";
      case "4:3": return "aspect-[4/3]";
      case "3:4": return "aspect-[3/4]";
      default: return "aspect-square";
    }
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Sparkles className="text-yellow-400" />
        Create Your Masterpiece
      </h2>
      
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your banana-themed (or any) creation..."
          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-yellow-400 outline-none min-h-[100px] resize-none"
        />

        <div className="flex flex-wrap gap-2">
          {ratios.map(r => (
            <button
              key={r.value}
              onClick={() => setAspectRatio(r.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                aspectRatio === r.value 
                  ? "bg-yellow-400 text-black border-yellow-400" 
                  : "bg-black/50 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Art"
            )}
          </Button>
        </div>

        {generatedImage && (
          <div className="mt-6 animate-in fade-in zoom-in duration-300">
            <div className={cn("relative w-full max-w-md mx-auto rounded-lg overflow-hidden border border-white/10", getAspectClass(aspectRatio))}>
              <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex justify-center gap-3 mt-4">
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={isPosting}
                className="border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button
                onClick={handlePost}
                disabled={isPosting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Post to Wall
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
