"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Download, Wand2, Image as ImageIcon, Loader2, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/shared/Navbar";
import { cn, resizeImage } from "@/lib/utils";
import { generateThumbnail } from "@/actions/ai-actions";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
        alert("File is too large. Please upload images under 5MB.");
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
      } catch (err) {
        console.error("Failed to process image", err);
      }
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    
    setIsGenerating(true);
    
    // Construct Prompt
    let finalPrompt = `Create a viral YouTube thumbnail for a video about "${videoTitle || 'this subject'}". `;
    if (niche) finalPrompt += `Niche: ${niche}. `;
    if (colors) finalPrompt += `Color Scheme: ${colors}. `;
    finalPrompt += `Style: High quality, 8k, hyper-realistic, expressive, click-worthy. `;
    if (customPrompt) {
      finalPrompt += `Additional details: ${customPrompt}`;
    }

    try {
      const result = await generateThumbnail(image, finalPrompt, aspectRatio, referenceImage || undefined);
      setGeneratedImage(result);
    } catch (err) {
      console.error("Generation failed", err);
      alert("Failed to generate thumbnail. Please try again.");
    } finally {
      setIsGenerating(false);
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
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#FF0000] selection:text-white">
      <Navbar />
      
      <main className="flex flex-col lg:flex-row h-screen w-full pt-16 lg:pt-20">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-1/3 bg-[#111] border-r border-white/10 p-6 h-[calc(100vh-80px)] overflow-hidden">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 flex-none">
            <span className="text-[#FF0000]">▶️</span> Thumbnail Studio
          </h2>
          <div className="space-y-6 flex-1 h-full overflow-y-auto pb-10 custom-scrollbar pr-2">
            {/* 1. Main Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">1. Subject Image (Required)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-[#FF0000] transition-colors bg-white/5 cursor-pointer relative group"
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, false)}
                  className="hidden"
                />
                {image ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded">
                    <img src={image} alt="Source" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6">
                    <Upload className="mx-auto mb-2 text-neutral-500 group-hover:text-[#FF0000]" />
                    <p className="text-xs text-neutral-400">Upload subject (Max 5MB)</p>
                  </div>
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
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm focus:border-[#FF0000] outline-none transition-colors placeholder:text-neutral-600"
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
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm focus:border-[#FF0000] outline-none placeholder:text-neutral-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Colors</label>
                  <input 
                    type="text"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    placeholder="e.g. Red & Black"
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm focus:border-[#FF0000] outline-none placeholder:text-neutral-600"
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
                className="border border-dashed border-white/20 rounded-lg p-3 text-center hover:border-[#FF0000] transition-colors bg-white/5 cursor-pointer relative group"
              >
                <input 
                  ref={refInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
                {referenceImage ? (
                  <div className="relative h-20 w-full overflow-hidden rounded flex items-center justify-center bg-black">
                    <img src={referenceImage} alt="Ref" className="h-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold">Change</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <ImageIcon className="h-4 w-4 text-neutral-500" />
                    <p className="text-xs text-neutral-400">Upload style reference</p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Advanced / Custom Prompt */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">4. Advanced AI Prompt (Optional)</label>
              <textarea 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm leading-relaxed resize-none focus:border-[#FF0000] outline-none placeholder:text-neutral-600"
                placeholder="Add specific details..."
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
                      "py-2 text-[10px] rounded border transition-colors",
                      aspectRatio === ratio 
                        ? "bg-[#FF0000]/20 border-[#FF0000] text-[#FF0000]" 
                        : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                    )}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={!image || isGenerating}
              className="w-full bg-gradient-to-r from-[#FF0000] to-[#CC0000] hover:from-[#CC0000] hover:to-[#990000] text-white font-bold py-6 shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)] transition-all mt-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" /> Generate Thumbnail
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Controls Sheet */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="h-14 w-14 rounded-full bg-[#FF0000] hover:bg-[#CC0000] shadow-lg border border-white/20">
                <Settings2 className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] bg-[#111] border-t border-white/10 rounded-t-xl px-6 pt-6">
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="text-white flex items-center gap-2">
                  <span className="text-[#FF0000]">▶️</span> Thumbnail Studio
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-6 h-full overflow-y-auto pb-20 custom-scrollbar pr-2">
                {/* Same content as desktop sidebar */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">1. Subject Image (Required)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-[#FF0000] transition-colors bg-white/5 cursor-pointer relative group"
                  >
                    {image ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded">
                        <img src={image} alt="Source" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-bold">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6">
                        <Upload className="mx-auto mb-2 text-neutral-500 group-hover:text-[#FF0000]" />
                        <p className="text-xs text-neutral-400">Upload subject (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">2. Video Topic</label>
                    <input 
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g., I Spent 24 Hours in a Haunted House"
                      className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm focus:border-[#FF0000] outline-none transition-colors placeholder:text-neutral-600"
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
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm focus:border-[#FF0000] outline-none placeholder:text-neutral-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Colors</label>
                      <input 
                        type="text"
                        value={colors}
                        onChange={(e) => setColors(e.target.value)}
                        placeholder="e.g. Red & Black"
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-sm focus:border-[#FF0000] outline-none placeholder:text-neutral-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex justify-between">
                    <span>3. Style Reference (Optional)</span>
                    {referenceImage && (
                      <button onClick={(e) => { e.stopPropagation(); setReferenceImage(null); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
                    )}
                  </label>
                  <div 
                    onClick={() => refInputRef.current?.click()}
                    className="border border-dashed border-white/20 rounded-lg p-3 text-center hover:border-[#FF0000] transition-colors bg-white/5 cursor-pointer relative group"
                  >
                    {referenceImage ? (
                      <div className="relative h-20 w-full overflow-hidden rounded flex items-center justify-center bg-black">
                        <img src={referenceImage} alt="Ref" className="h-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-bold">Change</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <ImageIcon className="h-4 w-4 text-neutral-500" />
                        <p className="text-xs text-neutral-400">Upload style reference</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">4. Advanced AI Prompt (Optional)</label>
                  <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm leading-relaxed resize-none focus:border-[#FF0000] outline-none placeholder:text-neutral-600"
                    placeholder="Add specific details..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["16:9", "4:3", "1:1", "9:16"].map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={cn(
                          "py-2 text-[10px] rounded border transition-colors",
                          aspectRatio === ratio 
                            ? "bg-[#FF0000]/20 border-[#FF0000] text-[#FF0000]" 
                            : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                        )}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={!image || isGenerating}
                  className="w-full bg-gradient-to-r from-[#FF0000] to-[#CC0000] hover:from-[#CC0000] hover:to-[#990000] text-white font-bold py-6 shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)] transition-all mt-4"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" /> Generate Thumbnail
                    </>
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] p-4 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#FF0000]/5 via-transparent to-transparent" />
            
            {generatedImage || image ? (
              <div 
                className="relative shadow-2xl w-full max-w-4xl transition-all duration-500 group"
                style={{
                  aspectRatio: aspectRatio.replace(":", "/"),
                }}
              >
                <img 
                  src={generatedImage || image || ""} 
                  alt="Preview" 
                  className="w-full h-full object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                />
                {generatedImage && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8 rounded-lg">
                    <Button 
                      onClick={handleDownload}
                      className="bg-white text-black hover:bg-neutral-200 font-bold"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download HD
                    </Button>
                  </div>
                )}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white rounded-lg z-20">
                    <Loader2 className="h-12 w-12 lg:h-16 lg:w-16 animate-spin text-[#FF0000] mb-4 lg:mb-6" />
                    <p className="text-lg lg:text-xl font-bold animate-pulse">Designing Viral Thumbnail...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-neutral-500">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 border border-white/10">
                  <ImageIcon className="h-8 w-8 lg:h-10 lg:w-10 opacity-20" />
                </div>
                <p className="text-base lg:text-lg font-medium">Upload a subject image to start</p>
                <p className="text-xs lg:text-sm opacity-50 mt-2">Use the controls to customize</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
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
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
