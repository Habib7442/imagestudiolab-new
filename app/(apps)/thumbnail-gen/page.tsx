"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Wand2, Image as ImageIcon, Loader2, X, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/shared/Navbar";
import { cn, resizeImage } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const dataURLtoBlob = (dataurl: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

export default function ThumbnailGenPage() {
  const [image, setImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Form State
  const [videoTitle, setVideoTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [colors, setColors] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
    
    // Restore state if exists
    const savedState = localStorage.getItem('thumbnailGenState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.image) setImage(parsed.image);
        if (parsed.generatedImage) setGeneratedImage(parsed.generatedImage);
        if (parsed.videoTitle) setVideoTitle(parsed.videoTitle);
        if (parsed.niche) setNiche(parsed.niche);
        if (parsed.colors) setColors(parsed.colors);
        if (parsed.customPrompt) setCustomPrompt(parsed.customPrompt);
        if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
        // Clear after restoring
        localStorage.removeItem('thumbnailGenState');
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isRef = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File is too large. Please upload images under 5MB.");
        return;
      }
      try {
        const resized = await resizeImage(file);
        if (isRef) {
          setReferenceImage(resized);
        } else {
          setImage(resized);
          setGeneratedImage(null);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to process image", err);
        setError("Failed to process image. Please try again.");
      }
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    
    setIsGenerating(true);
    setError(null);
    
    // Construct Prompt
    let finalPrompt = `Create a viral YouTube thumbnail for a video about "${videoTitle || 'this subject'}". `;
    if (niche) finalPrompt += `Niche: ${niche}. `;
    if (colors) finalPrompt += `Color Scheme: ${colors}. `;
    finalPrompt += `Style: High quality, 8k, hyper-realistic, expressive, click-worthy. `;
    if (customPrompt) {
      finalPrompt += `Additional details: ${customPrompt}`;
    }

    try {
      const formData = new FormData();
      formData.append("image", dataURLtoBlob(image));
      formData.append("prompt", finalPrompt);
      formData.append("aspectRatio", aspectRatio);
      if (referenceImage) {
        formData.append("referenceImage", dataURLtoBlob(referenceImage));
      }

      const response = await fetch("/api/generate-thumbnail", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate thumbnail");
      }

      setGeneratedImage(data.result);
      setEditPrompt(""); 
    } catch (err: any) {
      console.error("Generation failed", err);
      setError(err.message || "Failed to generate thumbnail. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!generatedImage || !editPrompt.trim()) return;
    
    setIsEditing(true);
    setError(null);
    
    try {
      const { generateImageEdit } = await import("@/actions/ai-actions");
      const result = await generateImageEdit(generatedImage, editPrompt);
      setGeneratedImage(result);
      setEditPrompt(""); // Clear edit prompt after successful edit
    } catch (err: any) {
      console.error("Edit failed", err);
      setError(err.message || "Failed to edit image. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownload = async () => {
    if (!isLoggedIn) {
      setShowLoginAlert(true);
      return;
    }

    const link = document.createElement("a");
    link.download = `thumbnail-${Date.now()}.png`;
    link.href = generatedImage || image || "";
    link.click();
  };

  const handleLoginRedirect = () => {
    // Save state before redirecting
    const stateToSave = {
      image,
      generatedImage,
      videoTitle,
      niche,
      colors,
      customPrompt,
      aspectRatio
    };
    localStorage.setItem('thumbnailGenState', JSON.stringify(stateToSave));
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pt-24 md:pt-32 font-sans selection:bg-[#FF0000] selection:text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000]">
            <Sparkles className="w-6 h-6 mr-2" />
            <span className="font-bold tracking-wider uppercase text-sm">AI Thumbnail Studio</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent">
            Viral Thumbnails
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Upload your image, describe your video, and let AI create a click-worthy thumbnail in seconds.
          </p>
        </motion.div>

        {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* 1. Main Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">1. Subject Image (Required)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
                  image ? "border-[#FF0000]/50 bg-[#FF0000]/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, false)}
                  className="hidden"
                />
                {image ? (
                  <>
                    <img src={image} alt="Source" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs font-bold uppercase tracking-wider">Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-neutral-400" />
                    </div>
                    <span className="text-sm font-medium text-neutral-400">Upload Subject</span>
                    <span className="text-xs text-neutral-600 mt-1">(Max 5MB)</span>
                  </>
                )}
              </div>
            </div>

            {/* 2. Video Details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">2. Video Topic</label>
                <input 
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g., I Spent 24 Hours in a Haunted House"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000] outline-none transition-all placeholder:text-neutral-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Niche</label>
                  <input 
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Gaming"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000] outline-none transition-all placeholder:text-neutral-600 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Colors</label>
                  <input 
                    type="text"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder="e.g. Red & Black"
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000] outline-none transition-all placeholder:text-neutral-600 text-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. Reference Image (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex justify-between">
                <span>3. Style Reference (Optional)</span>
                {referenceImage && (
                  <button onClick={(e) => { e.stopPropagation(); setReferenceImage(null); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
                )}
              </label>
              <div 
                onClick={() => refInputRef.current?.click()}
                className={cn(
                  "h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
                  referenceImage ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <input 
                  ref={refInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
                {referenceImage ? (
                  <>
                    <img src={referenceImage} alt="Ref" className="h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs font-bold uppercase tracking-wider">Change</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-neutral-400" />
                    </div>
                    <span className="text-sm font-medium text-neutral-400">Upload Reference</span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Advanced / Custom Prompt */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">4. Advanced AI Prompt (Optional)</label>
              <Textarea 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add specific details..."
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#FF0000] focus:ring-1 focus:ring-[#FF0000] transition-all min-h-[80px] resize-none"
              />
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {["16:9", "4:3", "1:1", "9:16"].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={cn(
                      "py-3 text-xs font-medium rounded-xl border transition-all",
                      aspectRatio === ratio 
                        ? "bg-[#FF0000]/20 border-[#FF0000] text-[#FF0000]" 
                        : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !image}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg",
                isGenerating || !image
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white hover:shadow-[0_0_30px_rgba(255,0,0,0.4)] hover:scale-[1.02]"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Thumbnail
                </>
              )}
            </button>

          </div>

          {/* Right Panel: Preview */}
          <div className="lg:col-span-7">
            <div className="sticky top-32">
              <div className="w-full rounded-3xl bg-[#111] border border-white/10 overflow-hidden relative flex items-center justify-center min-h-[400px]">
                
                <AnimatePresence mode="wait">
                  {generatedImage || image ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full group flex items-center justify-center bg-[#0A0A0A]"
                    >
                      <img 
                        src={generatedImage || image || ""} 
                        alt="Preview" 
                        className="w-full h-auto max-h-[70vh] object-contain" 
                      />
                      
                      {generatedImage && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                          <button 
                            onClick={handleDownload}
                            className="px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                          >
                            <Download className="w-4 h-4" />
                            Download HD
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center p-8"
                    >
                      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <ImageIcon className="w-10 h-10 text-neutral-600" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-300 mb-2">Ready to Create</h3>
                      <p className="text-neutral-500 max-w-sm mx-auto">
                        Upload an image and describe your video to generate a viral thumbnail.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-12 h-12 text-[#FF0000] animate-spin mb-4" />
                    <p className="text-[#FF0000] font-medium animate-pulse">Designing Viral Thumbnail...</p>
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-12 h-12 text-[#FF0000] animate-spin mb-4" />
                    <p className="text-[#FF0000] font-medium animate-pulse">Editing Thumbnail...</p>
                  </div>
                )}
              </div>
              
              {/* Follow-up Edit Section */}
              {generatedImage && !isGenerating && (
                <div className="mt-6">
                  <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">
                      Refine Your Thumbnail
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      Make adjustments like "remove background", "change colors to blue", "add more contrast", etc.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleEdit()}
                        placeholder="e.g., remove background, change colors..."
                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/70 focus:outline-none focus:border-[#FF0000]/50 focus:ring-1 focus:ring-[#FF0000]/50 transition-all min-h-[80px] resize-none"
                        disabled={isEditing}
                      />
                      <button
                        onClick={handleEdit}
                        disabled={isEditing || !editPrompt.trim()}
                        className={cn(
                          "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
                          isEditing || !editPrompt.trim()
                            ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]"
                        )}
                      >
                        {isEditing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Editing...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            Edit
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Login Alert Dialog */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent className="bg-[#111] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">Sign in to Download</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Please sign in to download your viral thumbnail. Your work has been saved and will be restored after login!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLoginRedirect}
              className="bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white hover:from-[#CC0000] hover:to-[#990000]"
            >
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
