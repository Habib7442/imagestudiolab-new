"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, Image as ImageIcon, Camera, Wand2, Loader2, Download, X, ShoppingBag, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";
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

const PREDEFINED_PROMPTS = [
  "Professional LinkedIn Headshot",
  "Bold Red Lips Makeup",
  "Cyberpunk Neon Portrait",
  "Vintage 90s Polaroid",
  "Ethereal Fairy Tale",
  "High-Fashion Magazine",
  "Cinematic Movie Scene",
  "Soft Glam Makeup",
  "Urban Streetwear",
  "Golden Hour Glow"
];

const FILTERS = [
  { id: "none", name: "Standard", color: "bg-gray-500" },
  { id: "noir", name: "Noir", color: "bg-black" },
  { id: "blur", name: "Blur", color: "bg-blue-400" },
  { id: "aesthetic", name: "Aesthetic", color: "bg-pink-400" },
  { id: "filmy", name: "Filmy", color: "bg-orange-400" }
];

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

export default function PhotoshootInterface() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();
  }, [supabase.auth]);

  // Restore state if exists
  useEffect(() => {
    const savedState = localStorage.getItem('photoshootState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.userImage) setUserImage(parsed.userImage);
        if (parsed.productImage) setProductImage(parsed.productImage);
        if (parsed.prompt) setPrompt(parsed.prompt);
        if (parsed.selectedFilter) setSelectedFilter(parsed.selectedFilter);
        if (parsed.generatedImage) setGeneratedImage(parsed.generatedImage);
        // Clear after restoring
        localStorage.removeItem('photoshootState');
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!userImage) {
      setError("Please upload your photo first!");
      return;
    }
    if (!prompt) {
      setError("Please enter or select a prompt!");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("userImage", dataURLtoBlob(userImage));
      if (productImage) {
        formData.append("productImage", dataURLtoBlob(productImage));
      }
      formData.append("prompt", prompt);
      formData.append("filter", selectedFilter);

      const response = await fetch("/api/generate-photoshoot", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate photoshoot");
      }

      setGeneratedImage(data.result);
      setEditPrompt(""); 
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to generate photoshoot. Please try again.");
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
      setEditPrompt(""); 
    } catch (err: any) {
      console.error("Edit failed", err);
      setError(err.message || "Failed to edit image. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDownload = () => {
    if (!isLoggedIn) {
      setShowLoginAlert(true);
      return;
    }

    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `photoshoot-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLoginRedirect = () => {
    // Save state before redirecting
    const stateToSave = {
      userImage,
      productImage,
      prompt,
      selectedFilter,
      generatedImage
    };
    localStorage.setItem('photoshootState', JSON.stringify(stateToSave));
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pt-24 md:pt-32 font-sans selection:bg-fuchsia-500 selection:text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400">
            <Camera className="w-6 h-6 mr-2" />
            <span className="font-bold tracking-wider uppercase text-sm">AI Photoshoot Studio</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-fuchsia-200 to-fuchsia-400 bg-clip-text text-transparent">
            Reimagine Yourself
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Upload your photo, choose a vibe, and let AI create a professional photoshoot while keeping your face perfectly preserved.
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
            
            {/* Image Uploads */}
            <div className="grid grid-cols-2 gap-4">
              {/* User Image */}
              <div 
                onClick={() => userInputRef.current?.click()}
                className={cn(
                  "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
                  userImage ? "border-fuchsia-500/50 bg-fuchsia-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <input ref={userInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setUserImage)} />
                {userImage ? (
                  <>
                    <img src={userImage} alt="User" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs font-bold uppercase tracking-wider">Change Photo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6 text-neutral-400" />
                    </div>
                    <span className="text-sm font-medium text-neutral-400">Your Photo</span>
                    <span className="text-xs text-neutral-600 mt-1">(Required)</span>
                  </>
                )}
              </div>

              {/* Product Image */}
              <div 
                onClick={() => productInputRef.current?.click()}
                className={cn(
                  "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
                  productImage ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <input ref={productInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setProductImage)} />
                {productImage ? (
                  <>
                    <img src={productImage} alt="Product" className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setProductImage(null); }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-red-500/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6 text-neutral-400" />
                    </div>
                    <span className="text-sm font-medium text-neutral-400">Product</span>
                    <span className="text-xs text-neutral-600 mt-1">(Optional)</span>
                  </>
                )}
              </div>
            </div>

            {/* Prompt Selection */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Choose a Style</label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                      prompt === p 
                        ? "bg-fuchsia-500 text-white border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.3)]" 
                        : "bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Or describe your own vision..."
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/70 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all min-h-[100px] resize-none pr-10"
                />
                <Wand2 className="absolute right-4 top-4 w-4 h-4 text-neutral-500" />
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Apply Filter</label>
              <div className="grid grid-cols-5 gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-xl transition-all border",
                      selectedFilter === f.id 
                        ? "bg-white/10 border-white/20" 
                        : "border-transparent hover:bg-white/5"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full shadow-lg", f.color)} />
                    <span className="text-[10px] font-medium text-neutral-400 uppercase">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !userImage || !prompt}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg",
                isGenerating || !userImage || !prompt
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:scale-[1.02]"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Photoshoot
                </>
              )}
            </button>

          </div>

          {/* Right Panel: Preview */}
          <div className="lg:col-span-7">
            <div className="sticky top-8">
              <div className="aspect-square w-full rounded-3xl bg-[#111] border border-white/10 overflow-hidden relative flex items-center justify-center">
                
                <AnimatePresence mode="wait">
                  {generatedImage ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full group"
                    >
                      <img src={generatedImage} alt="Generated Photoshoot" className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                        <button 
                          onClick={handleDownload}
                          className="px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                          <Download className="w-4 h-4" />
                          Download HD
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center p-8"
                    >
                      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Camera className="w-10 h-10 text-neutral-600" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-300 mb-2">Ready to Shoot</h3>
                      <p className="text-neutral-500 max-w-sm mx-auto">
                        Your AI-generated masterpiece will appear here in high resolution.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin mb-4" />
                    <p className="text-fuchsia-400 font-medium animate-pulse">Developing your photos...</p>
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin mb-4" />
                    <p className="text-fuchsia-400 font-medium animate-pulse">Editing your photo...</p>
                  </div>
                )}
              </div>
              
              {/* Follow-up Edit Section */}
              {generatedImage && !isGenerating && (
                <div className="mt-6">
                  <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">
                      Refine Your Photoshoot
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      Make adjustments like "remove background", "change lighting", "add more contrast", etc.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleEdit()}
                        placeholder="e.g., remove background, change lighting..."
                        className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/70 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 transition-all min-h-[80px] resize-none"
                        disabled={isEditing}
                      />
                      <button
                        onClick={handleEdit}
                        disabled={isEditing || !editPrompt.trim()}
                        className={cn(
                          "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
                          isEditing || !editPrompt.trim()
                            ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(217,70,239,0.4)]"
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
              Please sign in to download your AI-generated photoshoot. Your masterpiece is ready!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLoginRedirect}
              className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:from-fuchsia-700 hover:to-purple-700"
            >
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
