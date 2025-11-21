"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Download, Type, Calendar, MapPin, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/shared/Navbar";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";

export default function RetroPressPage() {
  const [image, setImage] = useState<string | null>(null);
  const [headline, setHeadline] = useState("LOCAL HERO SAVES CAT");
  const [subheadline, setSubheadline] = useState("The town rejoices as the feline is returned safely.");
  const [date, setDate] = useState("October 24, 1924");
  const [location, setLocation] = useState("NEW YORK CITY");
  const [article, setArticle] = useState("In a stunning turn of events, the local hero has once again proven their worth to the community. Witnesses say the rescue was nothing short of miraculous, defying gravity and logic alike. The mayor has declared a city-wide holiday in honor of this momentous occasion.");
  const [paperTexture, setPaperTexture] = useState<"aged" | "crumpled" | "stained">("aged");
  const [filter, setFilter] = useState<"grayscale" | "sepia" | "contrast">("grayscale");

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      
      const link = document.createElement("a");
      link.download = `retro-press-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#FFCB3A] selection:text-black">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 lg:py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left: Controls */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-[#FFCB3A]">⚡</span> Editor Controls
            </h2>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-400">Main Photo</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center group-hover:border-[#FFCB3A] transition-colors bg-white/5">
                  <Upload className="mx-auto mb-2 text-neutral-500 group-hover:text-[#FFCB3A]" />
                  <p className="text-xs text-neutral-400">Click to upload photo</p>
                </div>
              </div>
            </div>

            {/* Text Inputs */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Headline</label>
                <input 
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm font-bold tracking-wide focus:border-[#FFCB3A] outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Date</label>
                  <input 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs focus:border-[#FFCB3A] outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500 uppercase tracking-wider">Location</label>
                  <input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs focus:border-[#FFCB3A] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-500 uppercase tracking-wider">Article Snippet</label>
                <textarea 
                  value={article}
                  onChange={(e) => setArticle(e.target.value)}
                  rows={4}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs leading-relaxed resize-none focus:border-[#FFCB3A] outline-none"
                />
              </div>
            </div>

            {/* Style Controls */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <label className="text-xs text-neutral-500 uppercase tracking-wider">Paper Texture</label>
              <div className="flex gap-2">
                {(["aged", "crumpled", "stained"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setPaperTexture(t)}
                    className={cn(
                      "flex-1 py-2 text-xs rounded border transition-colors capitalize",
                      paperTexture === t 
                        ? "bg-[#FFCB3A]/20 border-[#FFCB3A] text-[#FFCB3A]" 
                        : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleDownload}
              className="w-full bg-[#FFCB3A] text-black hover:bg-[#E5B634] font-bold"
            >
              <Download className="mr-2 h-4 w-4" /> Download Press
            </Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex-1 flex items-start justify-center bg-[#111] rounded-xl border border-white/10 p-4 lg:p-8 overflow-hidden min-h-[600px]">
          
          {/* Newspaper Canvas */}
          <div 
            ref={canvasRef}
            className="relative bg-[#F0E6D2] text-black w-full max-w-[600px] aspect-[3/4] shadow-2xl overflow-hidden"
            style={{
              backgroundImage: paperTexture === 'aged' 
                ? "url('https://img.freepik.com/free-photo/old-paper-texture_1194-6258.jpg')" // Placeholder
                : paperTexture === 'crumpled'
                ? "url('https://img.freepik.com/free-photo/crumpled-paper-texture_1194-6226.jpg')"
                : "none",
              backgroundBlendMode: "multiply",
              backgroundSize: "cover"
            }}
          >
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-50 pointer-events-none mix-blend-multiply" />
            
            {/* Content Container */}
            <div className="relative z-10 p-8 h-full flex flex-col">
              
              {/* Header */}
              <div className="border-b-4 border-black pb-4 mb-4 text-center">
                <div className="flex justify-between items-center border-b border-black pb-1 mb-2 text-[10px] font-serif tracking-widest uppercase">
                  <span>{location}</span>
                  <span>{date}</span>
                  <span>Price: 5¢</span>
                </div>
                <h1 className="font-serif text-6xl font-black tracking-tighter uppercase leading-none scale-y-110">
                  THE DAILY PRESS
                </h1>
              </div>

              {/* Main Headline */}
              <div className="text-center mb-6">
                <h2 className="font-serif text-5xl font-bold uppercase leading-tight break-words">
                  {headline}
                </h2>
                <p className="font-serif text-lg italic mt-2 text-neutral-700">
                  {subheadline}
                </p>
              </div>

              {/* Main Image */}
              <div className="relative aspect-video bg-neutral-200 mb-6 overflow-hidden border-2 border-black grayscale contrast-125 sepia-[.3]">
                {image ? (
                  <img 
                    src={image} 
                    alt="News" 
                    className="w-full h-full object-cover"
                    style={{
                      filter: filter === 'grayscale' ? 'grayscale(100%) contrast(1.2)' : filter === 'sepia' ? 'sepia(100%) contrast(1.1)' : 'contrast(1.5) grayscale(100%)'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-300">
                    <span className="text-neutral-500 font-serif italic">Photo Placeholder</span>
                  </div>
                )}
              </div>

              {/* Columns */}
              <div className="flex-1 columns-2 gap-6 font-serif text-xs text-justify leading-relaxed">
                <p className="first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-[-6px]">
                  {article}
                </p>
                <p className="mt-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="mt-4">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
