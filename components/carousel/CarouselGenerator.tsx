"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Youtube, FileText, Image as ImageIcon, Type, Download, RefreshCw, Edit2, Save, Sparkles, Wand2, Palette, ChevronLeft, ChevronRight } from "lucide-react";
import FlipBook from "./FlipBook";
import { Slide } from "./Slide";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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

interface SlideData {
  id: number | string;
  type?: string;
  title: string;
  content: string;
  image_prompt: string;
  image_url?: string;
}

export function CarouselGenerator() {
  const [activeTab, setActiveTab] = useState("topic");
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  
  // Styling State
  const [headingColor, setHeadingColor] = useState("#ffffff");
  const [contentColor, setContentColor] = useState("#e5e7eb");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4">("1:1");

  // Inputs
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [slideCount, setSlideCount] = useState(6);
  const [file, setFile] = useState<File | null>(null);

  // Edit State
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [editCustomImage, setEditCustomImage] = useState<File | null>(null);
  const [useCustomImage, setUseCustomImage] = useState(false);

  const flipBookRef = useRef<any>(null);
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
    const savedState = localStorage.getItem('carouselState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.slides) setSlides(parsed.slides);
        if (parsed.youtubeUrl) setYoutubeUrl(parsed.youtubeUrl);
        if (parsed.topic) setTopic(parsed.topic);
        if (parsed.activeTab) setActiveTab(parsed.activeTab);
        if (parsed.headingColor) setHeadingColor(parsed.headingColor);
        if (parsed.contentColor) setContentColor(parsed.contentColor);
        if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
        if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
        // Clear after restoring
        localStorage.removeItem('carouselState');
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setSlides([]);
    
    const formData = new FormData();
    formData.append("type", activeTab);
    formData.append("aspectRatio", aspectRatio);

    if (activeTab === "youtube") formData.append("url", youtubeUrl);
    else if (activeTab === "topic") {
      formData.append("topic", topic);
      formData.append("content", content);
      formData.append("slideCount", slideCount.toString());
    }
    else if ((activeTab === "pdf" || activeTab === "image") && file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/generate-carousel", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setSlides(data.slides);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to generate carousel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSlide = async () => {
    if (!slides[currentSlideIndex]) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("mode", "update");
    formData.append("slideIndex", currentSlideIndex.toString());
    formData.append("currentSlide", JSON.stringify(slides[currentSlideIndex]));
    formData.append("prompt", `Update title to "${editTitle}", content to "${editContent}", and image based on "${editPrompt}"`);
    formData.append("aspectRatio", aspectRatio);
    
    // Add custom image if user chose to upload one
    if (useCustomImage && editCustomImage) {
      formData.append("customImage", editCustomImage);
      formData.append("useCustomImage", "true");
    }

    try {
      const res = await fetch("/api/generate-carousel", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newSlides = [...slides];
      newSlides[currentSlideIndex] = data.slide;
      setSlides(newSlides);
      setIsEditing(false);
      setUseCustomImage(false);
      setEditCustomImage(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update slide.");
    } finally {
      setLoading(false);
    }
  };

  const onFlip = useCallback((e: any) => {
    setCurrentSlideIndex(e.data);
    setIsEditing(false);
  }, []);

  const startEditing = () => {
    const slide = slides[currentSlideIndex];
    if (slide) {
      setEditTitle(slide.title);
      setEditContent(slide.content);
      setEditPrompt(slide.image_prompt);
      setIsEditing(true);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setIsEditing(false);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setIsEditing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!isLoggedIn) {
      setShowLoginAlert(true);
      return;
    }

    const zip = new JSZip();
    const width = 1080;
    const height = aspectRatio === "1:1" ? 1080 : 1440;

    // Helper to load image
    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    };

    // Process each slide
    await Promise.all(slides.map(async (slide, index) => {
      if (!slide.image_url) return;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Draw Image
      try {
        const img = await loadImage(slide.image_url);
        // Draw image covering the canvas (object-cover equivalent)
        const scale = Math.max(width / img.width, height / img.height);
        const x = (width / 2) - (img.width / 2) * scale;
        const y = (height / 2) - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } catch (e) {
        console.error("Failed to load image for slide", index, e);
        // Fill black if image fails
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw Gradient Overlay (match CSS: from-black/90 via-black/40 to-transparent)
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.9)");
      gradient.addColorStop(0.6, "rgba(0, 0, 0, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 3. Draw Text
      const padding = 60;
      const contentBottom = height - 120; // Margin from bottom
      
      // Content
      ctx.font = `36px ${fontFamily}, sans-serif`; // Approx 1.5x PDF size
      ctx.fillStyle = contentColor;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";

      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        const lines = [];

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        return lines;
      };

      const contentLines = wrapText(slide.content, padding, 0, width - (padding * 2), 48);
      let currentY = contentBottom;
      
      // Draw content lines from bottom up? No, usually top down. 
      // Let's calculate total height to position correctly.
      // Actually, let's draw content, then title above it.
      
      // Draw Content
      contentLines.reverse().forEach((line, i) => {
        ctx.fillText(line, padding, currentY - (i * 48));
      });
      
      const contentHeight = contentLines.length * 48;
      const titleBottom = currentY - contentHeight - 40; // Gap between content and title

      // Title
      ctx.font = `bold 64px ${fontFamily}, sans-serif`; // Approx 2.5x PDF size
      ctx.fillStyle = headingColor;
      
      const titleLines = wrapText(slide.title, padding, 0, width - (padding * 2), 80);
      
      titleLines.reverse().forEach((line, i) => {
        ctx.fillText(line, padding, titleBottom - (i * 80));
      });

      // Watermark
      ctx.font = "24px Inter, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.textAlign = "center";
      ctx.fillText("Generated by ImageStudioLab.com", width / 2, height - 30);

      // 4. Add to Zip
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        zip.file(`slide-${index + 1}.png`, blob);
      }
    }));

    // Generate zip and save
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "carousel-images.zip");
  };


  const handleLoginRedirect = () => {
    // Save state before redirecting
    const stateToSave = {
      slides,
      youtubeUrl,
      topic,
      activeTab,
      headingColor,
      contentColor,
      fontFamily,
      aspectRatio
    };
    localStorage.setItem('carouselState', JSON.stringify(stateToSave));
    router.push('/login');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Panel: Inputs & Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-black/50 mb-6 p-1 rounded-xl border border-white/5">
              <TabsTrigger value="topic" className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white rounded-lg"><Type className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="pdf" className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white rounded-lg"><FileText className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white rounded-lg"><ImageIcon className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="design" className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white rounded-lg"><Palette className="w-4 h-4" /></TabsTrigger>
            </TabsList>

            <div className="space-y-4 min-h-[200px]">
              <TabsContent value="pdf" className="mt-0 space-y-3">
                <Label className="text-neutral-400 uppercase text-xs font-bold tracking-wider">Upload PDF</Label>
                <div className="mt-2 border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 transition-all cursor-pointer relative group">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-neutral-400 group-hover:text-fuchsia-400" />
                  </div>
                  <p className="text-sm text-neutral-400 font-medium">{file ? file.name : "Drop PDF here"}</p>
                </div>
              </TabsContent>

              <TabsContent value="image" className="mt-0 space-y-3">
                <Label className="text-neutral-400 uppercase text-xs font-bold tracking-wider">Upload Image</Label>
                <div className="mt-2 border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 transition-all cursor-pointer relative group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6 text-neutral-400 group-hover:text-fuchsia-400" />
                  </div>
                  <p className="text-sm text-neutral-400 font-medium">{file ? file.name : "Drop Image here"}</p>
                </div>
              </TabsContent>

              <TabsContent value="topic" className="mt-0 space-y-4">
                <div className="space-y-3">
                  <Label className="text-neutral-400 uppercase text-xs font-bold tracking-wider">Topic / Prompt</Label>
                  <Textarea 
                    placeholder="E.g., 5 Tips for Better Sleep, The History of AI..." 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-black border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20 min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-neutral-400 uppercase text-xs font-bold tracking-wider">Content (Optional)</Label>
                  <Textarea 
                    placeholder="Paste your own content here if you have it..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-black border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20 min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-neutral-400 uppercase text-xs font-bold tracking-wider">Number of Slides</Label>
                  <select 
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20 outline-none"
                  >
                    <option value={6}>6 Slides</option>
                    <option value={8}>8 Slides</option>
                    <option value={10}>10 Slides</option>
                  </select>
                </div>
              </TabsContent>

              <TabsContent value="design" className="mt-0 space-y-4">
                <div className="space-y-3">
                  <Label className="text-neutral-400 uppercase text-xs font-bold tracking-wider">Heading Color</Label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={headingColor}
                      onChange={(e) => setHeadingColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <Input 
                      value={headingColor}
                      onChange={(e) => setHeadingColor(e.target.value)}
                      className="bg-black border-white/10 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-neutral-400 uppercase text-xs font-bold tracking-wider">Content Color</Label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={contentColor}
                      onChange={(e) => setContentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                    />
                    <Input 
                      value={contentColor}
                      onChange={(e) => setContentColor(e.target.value)}
                      className="bg-black border-white/10 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-neutral-400 uppercase text-xs font-bold tracking-wider">Font Family</Label>
                  <select 
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20 outline-none"
                  >
                    <option value="Inter">Modern (Inter)</option>
                    <option value="Times New Roman">Classic (Times)</option>
                    <option value="Courier New">Mono (Courier)</option>
                    <option value="Arial">Clean (Arial)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-neutral-400 uppercase text-xs font-bold tracking-wider">Aspect Ratio</Label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as "1:1" | "3:4")}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20 outline-none"
                  >
                    <option value="3:4">Portrait (3:4)</option>
                    <option value="1:1">Square (1:1)</option>
                  </select>
                </div>
              </TabsContent>
            </div>

            {activeTab !== "design" && (
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className={cn(
                  "w-full mt-6 py-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg",
                  loading
                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:scale-[1.02]"
                )}
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating Magic...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate Carousel</>
                )}
              </Button>
            )}
          </Tabs>
        </div>

        {/* Edit Panel (Visible when slides exist) */}
        {slides.length > 0 && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handlePrevSlide} disabled={currentSlideIndex === 0} className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-xs text-fuchsia-400">{currentSlideIndex + 1}</span>
                  Edit Slide
                </h3>
                <Button variant="ghost" size="sm" onClick={handleNextSlide} disabled={currentSlideIndex === slides.length - 1} className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={startEditing} className="border-white/10 hover:bg-white/5 hover:text-white">
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="hover:bg-white/5 hover:text-white">Cancel</Button>
                  <Button size="sm" onClick={handleUpdateSlide} disabled={loading} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-neutral-400 uppercase font-bold">Title</Label>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-black border-white/10 mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-neutral-400 uppercase font-bold">Content</Label>
                  <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="bg-black border-white/10 mt-1" />
                </div>
                
                {/* Image Options Toggle */}
                <div className="space-y-3">
                  <Label className="text-xs text-neutral-400 uppercase font-bold">Image Source</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={!useCustomImage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseCustomImage(false)}
                      className={!useCustomImage ? "bg-fuchsia-600 hover:bg-fuchsia-700" : "border-white/10 hover:bg-white/5"}
                    >
                      AI Generate
                    </Button>
                    <Button
                      type="button"
                      variant={useCustomImage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseCustomImage(true)}
                      className={useCustomImage ? "bg-fuchsia-600 hover:bg-fuchsia-700" : "border-white/10 hover:bg-white/5"}
                    >
                      Upload Custom
                    </Button>
                  </div>
                </div>

                {!useCustomImage ? (
                  <div>
                    <Label className="text-xs text-neutral-400 uppercase font-bold">Image Prompt</Label>
                    <Textarea value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} className="bg-black border-white/10 mt-1 h-20" />
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs text-neutral-400 uppercase font-bold">Upload Image</Label>
                    <div className="mt-2 border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 transition-all cursor-pointer relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setEditCustomImage(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-5 h-5 text-neutral-400 group-hover:text-fuchsia-400" />
                      </div>
                      <p className="text-xs text-neutral-400 font-medium">{editCustomImage ? editCustomImage.name : "Drop image here"}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-sm text-neutral-400 bg-black/30 p-4 rounded-xl border border-white/5">
                <p><strong className="text-neutral-200 block mb-1">Title:</strong> {slides[currentSlideIndex].title}</p>
                <p><strong className="text-neutral-200 block mb-1">Content:</strong> {slides[currentSlideIndex].content}</p>
                <p className="truncate"><strong className="text-neutral-200 block mb-1">Prompt:</strong> {slides[currentSlideIndex].image_prompt}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/10">
              <Button onClick={handleDownloadZip} className="w-full bg-white text-black hover:bg-neutral-200 font-bold">
                <Download className="w-4 h-4 mr-2" /> Download Carousel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Preview */}
      <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[700px] bg-[#0a0a0a] rounded-3xl border border-white/10 relative overflow-hidden group">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-900/10 via-black to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
        
        {slides.length > 0 ? (
          <div className="relative z-10 w-full flex flex-col items-center justify-center py-10">
             <FlipBook 
                width={400} 
                height={533} 
                ref={flipBookRef}
                onFlip={onFlip}
             >
                {slides.map((slide, index) => (
                  <div key={slide.id || index} className="demoPage shadow-2xl">
                    <Slide 
                      slide={slide} 
                      index={index} 
                      total={slides.length} 
                      headingColor={headingColor}
                      contentColor={contentColor}
                      fontFamily={fontFamily}
                    />
                  </div>
                ))}
             </FlipBook>
             
             <div className="text-center mt-8 text-neutral-500 text-sm font-medium animate-pulse">
                Click corners or drag to flip pages
             </div>
          </div>
        ) : (
          <div className="text-center text-neutral-500 relative z-10">
            {loading ? (
               <div className="flex flex-col items-center gap-6">
                 <div className="relative">
                    <div className="w-20 h-20 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-fuchsia-500 animate-pulse" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-xl font-bold text-white animate-pulse">Generating your masterpiece...</p>
                    <p className="text-sm text-neutral-400 max-w-xs mx-auto">Creating high-resolution visuals and engaging copy for your carousel.</p>
                 </div>
               </div>
            ) : (
              <div className="flex flex-col items-center gap-6 group-hover:scale-105 transition-transform duration-500">
                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                  <ImageIcon className="w-10 h-10 text-neutral-600 group-hover:text-fuchsia-500 transition-colors" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Ready to Create</h3>
                    <p className="max-w-sm mx-auto">Select a source from the left panel and click Generate to start your creative journey.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login Alert Dialog */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent className="bg-[#111] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">Sign in to Download</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Please sign in to download your AI-generated carousel. Your masterpiece is ready!
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
