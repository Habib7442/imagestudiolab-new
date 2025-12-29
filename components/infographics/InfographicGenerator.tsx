"use strict";
import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Wand2, Lightbulb, Type, Palette, ShoppingBag, ImageIcon, Plus, X, Download, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { INFOGRAPHIC_TEMPLATES, PRODUCT_TEMPLATES, InfographicTemplate } from "@/constants/infographics";
import { generateSocialCaptions, generateInfographicContent } from "@/actions/ai-actions";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CaptionsGenerator } from "./CaptionsGenerator"; 

interface InfographicGeneratorProps {
  mode: 'topic' | 'product';
}

export default function InfographicGenerator({ mode }: InfographicGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [userContent, setUserContent] = useState("");
  const [productImages, setProductImages] = useState<File[]>([]);
  const [brandName, setBrandName] = useState("");
  const [targetAudience, setTargetAudience] = useState("Unisex");
  
  const [selectedTemplate, setSelectedTemplate] = useState<InfographicTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();
  const router = useRouter();

  // Initialize Template
  useEffect(() => {
    setSelectedTemplate(mode === 'product' ? PRODUCT_TEMPLATES[0] : INFOGRAPHIC_TEMPLATES[0]);
  }, [mode]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
  }, []);

  // Restore State on Mount (if returning from login)
  useEffect(() => {
    const savedState = sessionStorage.getItem('pendingInfographic');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.mode === mode) {
           setTopic(parsed.topic || "");
           setBrandName(parsed.brandName || "");
           setTargetAudience(parsed.targetAudience || "Unisex");
           setUserContent(parsed.userContent || "");
           setGeneratedImage(parsed.generatedImage || null);
           sessionStorage.removeItem('pendingInfographic');
        }
      } catch (e) { console.error("Failed to restore state", e); }
    }
  }, [mode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setProductImages(prev => [...prev, ...newFiles].slice(0, 3));
    }
  };

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRefine = async () => {
    if (!generatedImage || !refinePrompt.trim()) return;
    
    setIsRefining(true);
    setError(null);

    try {
      const imageRes = await fetch(generatedImage);
      const imageBlob = await imageRes.blob();
      const file = new File([imageBlob], "refine_base.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("userImage", file); 
      formData.append("prompt", refinePrompt);
      formData.append("mode", "infographic_refine");

      const response = await fetch("/api/generate-photoshoot", {
          method: "POST",
          body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to refine image");
      
      setGeneratedImage(data.result);
      setRefinePrompt("");
    } catch (error: any) {
       console.error(error);
       setError(error.message || "Failed to refine image");
    } finally {
       setIsRefining(false);
    }
  };

  const handleDownload = () => {
    if (!user) {
      // Save State
      try {
        const stateToSave = { mode, topic, brandName, targetAudience, userContent, generatedImage };
        sessionStorage.setItem('pendingInfographic', JSON.stringify(stateToSave));
      } catch (e) { console.warn("Failed to save state", e); }

      if (confirm("You must be signed in to download high-quality results. Sign in now?")) {
          router.push('/login');
      }
      return;
    }
    
    if (generatedImage) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `infographic-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleGenerate = async () => {
    if (mode === "topic" && !topic.trim()) {
      setError("Please describe a topic for your infographic!");
      return;
    }
    if (mode === "product" && productImages.length === 0) {
      setError("Please upload at least one product image!");
      return;
    }
    if (!selectedTemplate) {
      setError("Please select a template design!");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const formData = new FormData();

      if (mode === "topic") {
        let finalPrompt = selectedTemplate.prompt.replaceAll("[TOPIC]", topic);
        let contentBlock = "";
        if (userContent.trim()) {
           contentBlock = "**Detailed Content Instructions (Strictly follow these):**\n" + userContent;
        } else {
           contentBlock = "**Detailed Content Instructions:**\nAuto-generate relevant, accurate, and high-value educational content based on the topic.";
        }
        finalPrompt = finalPrompt.replace("[USER_CONTENT_BLOCK]", contentBlock);
        
        formData.append("prompt", finalPrompt);
        formData.append("mode", "infographic");
      } else {
        // Product Mode Logic
        let finalPrompt = selectedTemplate.prompt
          .replaceAll("[TOPIC]", `${brandName} Product Showcase`)
          .replace("educational Instagram infographic", "commercial product showcase infographic");
          
        let contentBlock = `
          **PRODUCT SHOWCASE MODE**
          Brand: ${brandName || "Generic"}
          Target Audience: ${targetAudience}
          Products provided as images.
          
          **Instructions:**
          1. Arrange the provided products in a stunning composition based on the template style (${selectedTemplate.name}).
          2. Use the "User Content" below for specific selling points if provided.
          3. Ensure the product images are integrated seamlessly.
          
          ${userContent ? `**Specific Selling Points:**\n${userContent}` : ""}
        `;
        
        finalPrompt = finalPrompt.replace("[USER_CONTENT_BLOCK]", contentBlock);
        
        formData.append("prompt", finalPrompt);
        formData.append("mode", "infographic_product");
        
        productImages.forEach((file) => {
          formData.append("productImages", file);
        });
      }

      const response = await fetch("/api/generate-photoshoot", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate infographic");
      }

      setGeneratedImage(data.result);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to generate infographic. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Left Panel: Inputs */}
      <div className="lg:col-span-5 space-y-8">
        
        {/* Mode Specific Inputs */}
        {mode === 'topic' ? (
             <div className="space-y-4">
               <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-wider">
                 <Lightbulb className="w-4 h-4 text-yellow-400" />
                 What's your topic? <span className="text-red-500">*</span>
               </label>
               <div className="relative">
                 <Textarea
                   value={topic}
                   onChange={(e) => setTopic(e.target.value)}
                   placeholder="e.g. 'Camera Parts', 'How to make Coffee', 'Benefits of Yoga'..."
                   className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all min-h-[80px] resize-none"
                 />
               </div>
             </div>
        ) : (
            <>
            <div className="space-y-4">
               <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-wider">
                 <ShoppingBag className="w-4 h-4 text-blue-400" />
                 Brand & Product Name <span className="text-red-500">*</span>
               </label>
               <div className="relative">
                 <input
                   type="text"
                   value={brandName}
                   onChange={(e) => setBrandName(e.target.value)}
                   placeholder="e.g. Nike Air Max, Apple Watch Ultra..."
                   className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                 />
               </div>
             </div>

             <div className="space-y-4">
               <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-wider">
                 <Users className="w-4 h-4 text-pink-400" />
                 Target Audience
               </label>
               <div className="grid grid-cols-4 gap-2">
                 {['Men', 'Women', 'Kids', 'Unisex'].map((audience) => (
                   <button
                     key={audience}
                     onClick={() => setTargetAudience(audience)}
                     className={cn(
                       "py-3 rounded-xl border font-medium text-sm transition-all",
                       targetAudience === audience
                         ? "bg-pink-500/20 border-pink-500 text-pink-400 font-bold"
                         : "bg-black/50 border-white/10 text-neutral-400 hover:bg-white/5"
                     )}
                   >
                     {audience}
                   </button>
                 ))}
               </div>
             </div>

             <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4 text-green-400" />
                    Upload Products (Max 3) <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {productImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/20 group">
                        <img src={URL.createObjectURL(img)} alt="Product" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {productImages.length < 3 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all">
                        <Plus className="w-6 h-6 text-neutral-500 mb-2" />
                        <span className="text-[10px] text-neutral-500 font-bold uppercase">Add Image</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
             </div>
             </>
        )}

        {/* Template Selection */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-wider">
            <Palette className="w-4 h-4 text-purple-400" />
            Choose Structure
          </label>
          
          <div className="grid grid-cols-1 gap-3">
            {(mode === 'product' ? PRODUCT_TEMPLATES : INFOGRAPHIC_TEMPLATES).map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={cn(
                  "group relative p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 hover:bg-white/5",
                  selectedTemplate?.id === template.id 
                    ? (mode === 'product' ? "border-blue-500 bg-blue-500/5" : "border-purple-500 bg-purple-500/5")
                    : "border-white/5 hover:border-white/10"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br shadow-inner shrink-0",
                  template.gradient
                )}>
                  {template.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{template.name}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{template.description}</p>
                </div>
                {selectedTemplate?.id === template.id && (
                  <div className="absolute top-4 right-4">
                    <Sparkles className={cn("w-4 h-4", mode === 'product' ? "text-blue-400" : "text-purple-400")} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* User Content / Auto Generate */}
        <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-wider">
                  <Type className="w-4 h-4 text-blue-400" />
                  Specific Content (Optional)
                </label>
                {(mode === 'topic' || (mode === 'product' && brandName)) && (
                   <button
                   onClick={async () => {
                     const query = mode === 'topic' ? topic : (brandName + " Products");
                     if (!query.trim()) {
                       setError("Please enter a topic/brand first!");
                       return;
                     }
                     const btn = document.getElementById("auto-content-btn");
                     if (btn) {
                         const originalText = btn.innerHTML;
                         btn.innerHTML = 'Generating...';
                         btn.style.opacity = '0.7';
                         try {
                            const content = await generateInfographicContent(query);
                            setUserContent(content);
                         } catch (e) {
                            console.error(e);
                         } finally {
                            btn.innerHTML = originalText;
                            btn.style.opacity = '1';
                         }
                     }
                   }}
                   id="auto-content-btn"
                   className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 transition-all flex items-center gap-1"
                 >
                   <Sparkles className="w-3 h-3" />
                   Auto-Generate
                 </button>
                )}
              </div>
              <div className="relative">
                <Textarea
                  value={userContent}
                  onChange={(e) => setUserContent(e.target.value)}
                  placeholder={mode === 'product' ? "e.g. Highlight 'Durability', 'Comfort', 'Summer Sale'..." : "e.g. List specific steps, facts, or comparison points..."}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[150px] resize-none"
                />
              </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || (mode === 'topic' && !topic.trim()) || (mode === 'product' && productImages.length === 0) || !selectedTemplate}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg",
             (isGenerating || (mode === 'topic' && !topic.trim()) || (mode === 'product' && productImages.length === 0) || !selectedTemplate)
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              : (mode === 'product' ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]") + " text-white hover:scale-[1.02]"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {mode === 'product' ? "Designing Showcase..." : "Visualizing Concept..."}
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              {mode === 'product' ? "Generate Showcase" : "Generate Infographic"}
            </>
          )}
        </button>

        {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
        )}

      </div>

      {/* Right Panel: Preview */}
      <div className="lg:col-span-7 space-y-6">
        <div className="sticky top-8">
              <div className="aspect-[3/4] w-full max-w-md mx-auto rounded-3xl bg-[#111] border border-white/10 overflow-hidden relative flex items-center justify-center shadow-2xl">
                
                  {generatedImage ? (
                     <div className="relative w-full h-full group">
                        <img 
                          src={generatedImage} 
                          alt="Generated Infographic" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={handleDownload}
                            className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
                          >
                            <Download className="w-5 h-5" />
                            Download
                          </button>
                        </div>
                     </div>
                  ) : (
                    <div className="text-center p-8">
                       <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                         <Sparkles className="w-8 h-8 text-neutral-500" />
                       </div>
                       <p className="text-neutral-500 font-medium">
                         {mode === 'product' ? "Upload products & generate showcase" : "Enter a topic to visualize"}
                       </p>
                    </div>
                  )}
              </div>

               {/* Refine Section */}
               {generatedImage && !isGenerating && (
                 <div className="mt-6 bg-[#111] p-4 rounded-2xl border border-white/10 space-y-3">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                       <Wand2 className="w-3 h-3 text-purple-400" />
                       Refine / Edit Result
                    </label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={refinePrompt} 
                         onChange={(e) => setRefinePrompt(e.target.value)}
                         placeholder="e.g. Make the text bigger, darken background..."
                         className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-neutral-600"
                         onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                       />
                       <button 
                         onClick={handleRefine}
                         disabled={isRefining || !refinePrompt.trim()}
                         className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                       >
                         {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refine"}
                       </button>
                    </div>
                 </div>
               )}

               {/* Captions - Only if generated */}
               {generatedImage && !isGenerating && (
                 <div className="mt-12 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-2 mb-6">
                        <Type className="w-4 h-4 text-neutral-500" />
                        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Viral Captions</h3>
                    </div>
                    <CaptionsGenerator topic={mode === 'topic' ? topic : brandName} userContent={userContent} />
                 </div>
               )}
        </div>
      </div>
    </div>
  );
}


