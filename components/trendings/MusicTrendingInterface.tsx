"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, Image as ImageIcon, Camera, Wand2, Loader2, Download, X, Music, AlertCircle, PlayCircle, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { MUSIC_TREND_TEMPLATES, MUSIC_TREND_NEGATIVE_PROMPT, TrendingTemplate } from "@/constants/trendings";
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
import VoiceControl, { VoiceControlRef } from "@/components/photoshoot/VoiceControl";

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

export default function MusicTrendingInterface() {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [playlistImage, setPlaylistImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TrendingTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userInputRef = useRef<HTMLInputElement>(null);
  const playlistInputRef = useRef<HTMLInputElement>(null);
  const editVoiceRef = useRef<VoiceControlRef>(null);
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

  // Restore state logic dropped for simplicity in this new component, 
  // but could be added if needed.

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
    if (!playlistImage) {
      setError("Please upload your Spotify playlist screenshot!");
      return;
    }
    if (!selectedTemplate) {
      setError("Please select a template!");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("userImage", dataURLtoBlob(userImage));
      formData.append("productImage", dataURLtoBlob(playlistImage)); // Reusing product image field for playlist
      
      // Combine template prompt with negative prompt instructions if backend doesn't handle it
      // Actually backend handles mode, so we just send the raw template prompt to be safe
      formData.append("prompt", selectedTemplate.prompt); 
      formData.append("negativePrompt", MUSIC_TREND_NEGATIVE_PROMPT);
      formData.append("mode", "trending-music"); 

      const response = await fetch("/api/generate-photoshoot", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setGeneratedImage(data.result);
      setEditPrompt(""); 
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to generate image. Please try again.");
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
      link.download = `music-trend-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pt-24 md:pt-32 font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Music className="w-6 h-6 mr-2" />
            <span className="font-bold tracking-wider uppercase text-sm">Viral Music Trends</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
            Your Playlist, Reimagined
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto mb-8">
            Create ultra-cinematic, viral visuals featuring you and your favorite music. Perfect for Reels, Stories, and sharing your vibe.
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
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Image Uploads */}
            <div className="grid grid-cols-2 gap-4">
              {/* User Image */}
              <div 
                onClick={() => userInputRef.current?.click()}
                className={cn(
                  "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
                  userImage ? "border-orange-500/50 bg-orange-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
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

              {/* Playlist Screenshot */}
              <div 
                onClick={() => playlistInputRef.current?.click()}
                className={cn(
                  "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group",
                  playlistImage ? "border-green-500/50 bg-green-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}
              >
                <input ref={playlistInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setPlaylistImage)} />
                {playlistImage ? (
                  <>
                    <img src={playlistImage} alt="Playlist" className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPlaylistImage(null); }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-red-500/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 text-neutral-400" />
                    </div>
                    <span className="text-sm font-medium text-neutral-400">Playlist Screen</span>
                    <span className="text-xs text-neutral-600 mt-1">(Required)</span>
                  </>
                )}
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Choose a Template</label>
              
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {MUSIC_TREND_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      "group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all text-left",
                      selectedTemplate?.id === template.id 
                        ? "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] scale-[1.02]" 
                        : "border-transparent border-white/5 hover:border-white/20"
                    )}
                  >
                    <img src={template.image} alt={template.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-xs font-bold text-white leading-tight">{template.name}</p>
                    </div>
                    
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 right-2 bg-orange-500 w-5 h-5 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating || !userImage || !playlistImage || !selectedTemplate}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg mt-4",
                isGenerating || !userImage || !playlistImage || !selectedTemplate
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:scale-[1.02]"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Viral Vibe...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Magic
                </>
              )}
            </button>

          </div>

          {/* Right Panel: Preview */}
          <div className="lg:col-span-7">
            <div className="sticky top-8">
              <div className="aspect-[9/16] w-full max-w-sm mx-auto rounded-3xl bg-[#111] border border-white/10 overflow-hidden relative flex items-center justify-center">
                
                <AnimatePresence mode="wait">
                  {generatedImage ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full group"
                    >
                      <img src={generatedImage} alt="Generated Trend" className="w-full h-full object-cover" />
                      
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
                      className="text-center p-8 px-12"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Music className="w-8 h-8 text-neutral-600" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-300 mb-2">Ready to Go Viral?</h3>
                      <p className="text-neutral-500 text-sm">
                        Upload your photo and playlist to create a stunning visual.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                    <p className="text-orange-400 font-medium animate-pulse">Mixing your tracks...</p>
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                    <p className="text-orange-400 font-medium animate-pulse">Refining the vibe...</p>
                  </div>
                )}
              </div>
              
              {/* Follow-up Edit Section */}
              {generatedImage && !isGenerating && (
                <div className="mt-6 max-w-sm mx-auto">
                  <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3">
                      Refine Your Vibe
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4">
                      Make adjustments like "increase brightness", "change lighting to blue", etc.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Textarea
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleEdit()}
                          placeholder="e.g., make it darker..."
                          className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/70 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all min-h-[80px] resize-none pr-12"
                          disabled={isEditing}
                        />
                        <div className="absolute right-3 top-3">
                            <VoiceControl 
                                ref={editVoiceRef}
                                onTranscriptionComplete={(text) => setEditPrompt(text)}
                                hasUserImage={!!userImage}
                            />
                        </div>
                      </div>
                      <button
                        onClick={handleEdit}
                        disabled={isEditing || !editPrompt.trim()}
                        className={cn(
                          "px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all",
                          isEditing || !editPrompt.trim()
                            ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                        )}
                      >
                        {isEditing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Refining...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            Refine
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
              Please sign in to save your viral creation!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLoginRedirect}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
            >
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
