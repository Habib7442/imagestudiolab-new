"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import html2canvas from "html2canvas";
import {
  Upload,
  Download,
  Sparkles,
  Wand2,
  Type,
  Palette,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Check,
  RotateCw,
  Maximize2,
  Settings2,
  Share2,
  Undo2,
  Layers,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FILTERS, THEMES, AI_EDIT_PROMPTS, CAPTION_STYLES, BACKGROUND_COLORS, EXPORT_SIZES } from "@/constants/polaroid-presets";
import { cn } from "@/lib/utils";
import { analyzeImageForEdit, generateCaption } from "@/app/(apps)/polaroid/actions";

interface Polaroid {
  id: string;
  imageUrl: string;
  caption: string;
  filter: keyof typeof FILTERS;
  theme: keyof typeof THEMES;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  customFilter?: string;
}

type Tab = "upload" | "filter" | "theme" | "edit" | "text" | "settings";

export default function PolaroidEditor() {
  const [polaroids, setPolaroids] = useState<Polaroid[]>([]);
  const [selectedPolaroid, setSelectedPolaroid] = useState<string | null>(null);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isGeneratingEdit, setIsGeneratingEdit] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [captionStyle, setCaptionStyle] = useState<string>(CAPTION_STYLES[0]);
  const [mode, setMode] = useState<"single" | "storyboard">("single");
  const [backgroundColor, setBackgroundColor] = useState("#E8DCC4");
  const [exportSize, setExportSize] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);

  // Image upload handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newPolaroid: Polaroid = {
          id: Date.now().toString() + Math.random(),
          imageUrl: reader.result as string,
          caption: "",
          filter: "none",
          theme: "classic",
          position: { x: 0, y: 0 }, // Center initially
          rotation: (Math.random() - 0.5) * 10,
          scale: 1,
        };
        
        if (mode === "single") {
          setPolaroids([newPolaroid]);
        } else {
          setPolaroids((prev) => [...prev, newPolaroid]);
        }
        setSelectedPolaroid(newPolaroid.id);
        // Open filters tab automatically on upload
        setActiveTab("filter");
      };
      reader.readAsDataURL(file);
    });
  }, [mode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: true,
  });

  // AI Handlers
  const handleGenerateCaption = async () => {
    if (!selectedPolaroid) return;
    const polaroid = polaroids.find((p) => p.id === selectedPolaroid);
    if (!polaroid) return;

    setIsGeneratingCaption(true);
    try {
      const result = await generateCaption(polaroid.imageUrl, captionStyle);
      if (result.success && result.caption) {
        setPolaroids((prev) =>
          prev.map((p) =>
            p.id === selectedPolaroid ? { ...p, caption: result.caption! } : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to generate caption:", error);
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleAIEdit = async (prompt: string) => {
    if (!selectedPolaroid) return;
    const polaroid = polaroids.find((p) => p.id === selectedPolaroid);
    if (!polaroid) return;

    setIsGeneratingEdit(true);
    setAiPrompt(prompt);
    
    try {
      const result = await analyzeImageForEdit(polaroid.imageUrl, prompt);
      if (result.success && result.data) {
        const { brightness, contrast, saturate, hueRotate } = result.data;
        const customFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) hue-rotate(${hueRotate}deg)`;
        
        setPolaroids((prev) =>
          prev.map((p) =>
            p.id === selectedPolaroid
              ? { ...p, customFilter, filter: "none" }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Failed to apply AI edit:", error);
    } finally {
      setIsGeneratingEdit(false);
      setAiPrompt("");
    }
  };

  // Download Logic
  const downloadArtboard = async () => {
    if (!artboardRef.current) return;
    const sizeConfig = mode === "single" ? EXPORT_SIZES.single[exportSize] : EXPORT_SIZES.storyboard[exportSize];

    try {
      // Temporarily remove transform/scale for capture if needed, or handle scaling via html2canvas
      const canvas = await html2canvas(artboardRef.current, {
        backgroundColor: backgroundColor,
        scale: 2, // High res export
        useCORS: true,
        allowTaint: true,
        width: sizeConfig.width,
        height: sizeConfig.height,
        onclone: (clonedDoc) => {
            // Ensure the cloned artboard has the correct dimensions and no scaling transform
            const clonedArtboard = clonedDoc.getElementById('artboard-container');
            if (clonedArtboard) {
                clonedArtboard.style.transform = 'none';
                clonedArtboard.style.width = `${sizeConfig.width}px`;
                clonedArtboard.style.height = `${sizeConfig.height}px`;
            }
        }
      });

      const link = document.createElement("a");
      link.download = `polaroidx-${mode}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  const selectedPolaroidData = polaroids.find((p) => p.id === selectedPolaroid);
  const currentSize = mode === "single" ? EXPORT_SIZES.single[exportSize] : EXPORT_SIZES.storyboard[exportSize];

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden">
      {/* Header */}
      <header className="flex-none h-16 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl">📸</div>
          <h1 className="text-xl font-bold hidden sm:block">
            Polaroid<span className="text-[var(--color-brand-red)]">X</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-black/50 rounded-full p-1 border border-white/10">
            <button
                onClick={() => setMode("single")}
                className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    mode === "single" ? "bg-[var(--color-brand-red)] text-white" : "text-neutral-400 hover:text-white"
                )}
            >
                Single
            </button>
            <button
                onClick={() => setMode("storyboard")}
                className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-all",
                    mode === "storyboard" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white"
                )}
            >
                Story
            </button>
        </div>

        <Button 
            onClick={downloadArtboard}
            className="bg-[var(--color-brand-red)] hover:bg-red-600 text-xs h-8 px-3"
            disabled={polaroids.length === 0}
        >
            <Download size={14} className="mr-1" />
            Export
        </Button>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#050505] p-4 sm:p-8">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />

        {/* Artboard Container */}
        <div 
            id="artboard-container"
            ref={artboardRef}
            className="relative shadow-2xl transition-all duration-300 ease-in-out"
            style={{
                width: currentSize.width,
                height: currentSize.height,
                backgroundColor: backgroundColor,
                transform: `scale(${Math.min(
                    (window.innerWidth - 40) / currentSize.width, 
                    (window.innerHeight - 200) / currentSize.height
                )})`, // Responsive scaling
                transformOrigin: "center center",
            }}
        >
            {polaroids.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400/50">
                    <ImageIcon size={64} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium">Tap Upload to Start</p>
                </div>
            ) : (
                polaroids.map((polaroid) => (
                    <PolaroidCard
                        key={polaroid.id}
                        polaroid={polaroid}
                        isSelected={selectedPolaroid === polaroid.id}
                        onClick={() => setSelectedPolaroid(polaroid.id)}
                        onUpdate={(updates: Partial<Polaroid>) => 
                            setPolaroids(prev => prev.map(p => p.id === polaroid.id ? { ...p, ...updates } : p))
                        }
                        containerWidth={currentSize.width}
                        containerHeight={currentSize.height}
                    />
                ))
            )}
        </div>
      </main>

      {/* Bottom Navigation & Controls */}
      <div className="flex-none z-50">
        {/* Active Control Panel (Slide Up) */}
        <AnimatePresence>
            {activeTab && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute bottom-16 left-0 right-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl shadow-2xl max-h-[50vh] overflow-hidden flex flex-col"
                >
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h3 className="text-sm font-bold capitalize flex items-center gap-2">
                            {activeTab === "upload" && <Upload size={16} />}
                            {activeTab === "filter" && <Palette size={16} />}
                            {activeTab === "theme" && <Layers size={16} />}
                            {activeTab === "edit" && <Settings2 size={16} />}
                            {activeTab === "text" && <Type size={16} />}
                            {activeTab === "settings" && <Share2 size={16} />}
                            {activeTab}
                        </h3>
                        <button onClick={() => setActiveTab(null)} className="p-1 hover:bg-white/10 rounded-full">
                            <X size={16} />
                        </button>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                        {activeTab === "upload" && (
                            <div {...getRootProps()} className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[var(--color-brand-red)] transition-colors cursor-pointer">
                                <input {...getInputProps()} />
                                <Upload size={32} className="mx-auto mb-2 text-neutral-400" />
                                <p className="text-sm text-neutral-300">Tap to upload images</p>
                            </div>
                        )}

                        {activeTab === "filter" && selectedPolaroidData && (
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(FILTERS).map(([key, { name, filter }]) => (
                                    <button
                                        key={key}
                                        onClick={() => setPolaroids(prev => prev.map(p => p.id === selectedPolaroid ? { ...p, filter: key as any, customFilter: undefined } : p))}
                                        className={cn(
                                            "p-2 rounded-lg text-xs border transition-all",
                                            selectedPolaroidData.filter === key && !selectedPolaroidData.customFilter
                                                ? "border-[var(--color-brand-red)] bg-[var(--color-brand-red)]/10"
                                                : "border-white/10 bg-white/5"
                                        )}
                                    >
                                        <div className="aspect-square rounded-md mb-2 overflow-hidden bg-neutral-800">
                                            <img src={selectedPolaroidData.imageUrl} className="w-full h-full object-cover" style={{ filter }} />
                                        </div>
                                        {name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeTab === "theme" && selectedPolaroidData && (
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(THEMES).map(([key, { name, frameColor }]) => (
                                    <button
                                        key={key}
                                        onClick={() => setPolaroids(prev => prev.map(p => p.id === selectedPolaroid ? { ...p, theme: key as any } : p))}
                                        className={cn(
                                            "p-3 rounded-lg text-xs font-medium border transition-all flex items-center gap-3",
                                            selectedPolaroidData.theme === key
                                                ? "border-[var(--color-brand-red)] bg-[var(--color-brand-red)]/10"
                                                : "border-white/10 bg-white/5"
                                        )}
                                    >
                                        <div className="w-6 h-6 rounded border border-white/20 shadow-sm" style={{ backgroundColor: frameColor }} />
                                        {name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeTab === "edit" && selectedPolaroidData && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Rotation</Label>
                                    <Slider 
                                        value={[selectedPolaroidData.rotation]} 
                                        min={-45} max={45} step={1}
                                        onValueChange={([val]) => setPolaroids(prev => prev.map(p => p.id === selectedPolaroid ? { ...p, rotation: val } : p))}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label>Scale</Label>
                                    <Slider 
                                        value={[selectedPolaroidData.scale]} 
                                        min={0.5} max={2} step={0.1}
                                        onValueChange={([val]) => setPolaroids(prev => prev.map(p => p.id === selectedPolaroid ? { ...p, scale: val } : p))}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2">
                                        <Wand2 size={14} className="text-[var(--color-brand-red)]" />
                                        AI Magic Edit
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            value={aiPrompt} 
                                            onChange={(e) => setAiPrompt(e.target.value)} 
                                            placeholder="e.g. Make it cinematic..." 
                                            className="bg-black/50"
                                        />
                                        <Button 
                                            onClick={() => handleAIEdit(aiPrompt)} 
                                            disabled={isGeneratingEdit || !aiPrompt}
                                            className="bg-[var(--color-brand-red)]"
                                        >
                                            {isGeneratingEdit ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
                                        </Button>
                                    </div>
                                    {selectedPolaroidData.customFilter && (
                                        <Button variant="outline" onClick={() => setPolaroids(prev => prev.map(p => p.id === selectedPolaroid ? { ...p, customFilter: undefined } : p))} className="w-full text-xs">
                                            <Undo2 size={14} className="mr-2" /> Reset AI Edits
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "text" && selectedPolaroidData && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Caption Style</Label>
                                    <Select value={captionStyle} onValueChange={setCaptionStyle}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CAPTION_STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleGenerateCaption} disabled={isGeneratingCaption} className="w-full bg-white/10 hover:bg-white/20">
                                    {isGeneratingCaption ? <Loader2 className="animate-spin mr-2" /> : <Sparkles size={16} className="mr-2" />}
                                    Generate AI Caption
                                </Button>
                                <Input 
                                    value={selectedPolaroidData.caption} 
                                    onChange={(e) => setPolaroids(prev => prev.map(p => p.id === selectedPolaroid ? { ...p, caption: e.target.value } : p))}
                                    placeholder="Write a caption..."
                                    className="font-['Caveat'] text-xl"
                                />
                            </div>
                        )}

                        {activeTab === "settings" && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Background Color</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {BACKGROUND_COLORS.map((bg) => (
                                            <button
                                                key={bg.color}
                                                onClick={() => setBackgroundColor(bg.color)}
                                                className={cn(
                                                    "aspect-square rounded-full border-2 transition-all",
                                                    backgroundColor === bg.color ? "border-[var(--color-brand-red)] scale-110" : "border-white/10"
                                                )}
                                                style={{ backgroundColor: bg.color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label>Export Size</Label>
                                    <Select value={exportSize.toString()} onValueChange={(v) => setExportSize(parseInt(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(mode === "single" ? EXPORT_SIZES.single : EXPORT_SIZES.storyboard).map((size, i) => (
                                                <SelectItem key={i} value={i.toString()}>
                                                    {size.name} ({size.width}x{size.height})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Bottom Tab Bar */}
        <div className="h-16 bg-[#0A0A0A] border-t border-white/10 flex items-center justify-around px-2 relative z-50">
            <TabButton icon={Upload} label="Upload" isActive={activeTab === "upload"} onClick={() => setActiveTab(activeTab === "upload" ? null : "upload")} />
            <TabButton icon={Palette} label="Filters" isActive={activeTab === "filter"} onClick={() => setActiveTab(activeTab === "filter" ? null : "filter")} disabled={!selectedPolaroid} />
            <TabButton icon={Layers} label="Themes" isActive={activeTab === "theme"} onClick={() => setActiveTab(activeTab === "theme" ? null : "theme")} disabled={!selectedPolaroid} />
            <TabButton icon={Settings2} label="Edit" isActive={activeTab === "edit"} onClick={() => setActiveTab(activeTab === "edit" ? null : "edit")} disabled={!selectedPolaroid} />
            <TabButton icon={Type} label="Text" isActive={activeTab === "text"} onClick={() => setActiveTab(activeTab === "text" ? null : "text")} disabled={!selectedPolaroid} />
            <TabButton icon={Share2} label="Settings" isActive={activeTab === "settings"} onClick={() => setActiveTab(activeTab === "settings" ? null : "settings")} />
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, isActive, onClick, disabled }: {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95",
                isActive ? "text-[var(--color-brand-red)]" : "text-neutral-500 hover:text-neutral-300",
                disabled && "opacity-30 cursor-not-allowed"
            )}
        >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}

function PolaroidCard({ polaroid, isSelected, onClick, onUpdate, containerWidth, containerHeight }: {
    polaroid: Polaroid;
    isSelected: boolean;
    onClick: () => void;
    onUpdate: (updates: Partial<Polaroid>) => void;
    containerWidth: number;
    containerHeight: number;
}) {
    const theme = THEMES[polaroid.theme];
    const filter = FILTERS[polaroid.filter];
    const appliedFilter = polaroid.customFilter || filter.filter;

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => onUpdate({ position: { x: polaroid.position.x + info.offset.x, y: polaroid.position.y + info.offset.y } })}
            onClick={onClick}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
                scale: polaroid.scale, 
                rotate: polaroid.rotation,
                x: polaroid.position.x,
                y: polaroid.position.y,
                opacity: 1 
            }}
            className={cn(
                "absolute cursor-move select-none transition-shadow duration-200",
                isSelected && "ring-4 ring-[#FF3333] z-50"
            )}
            style={{
                width: 320,
                backgroundColor: theme.frameColor,
                padding: "16px 16px 50px 16px",
                boxShadow: isSelected ? `${theme.shadow}, 0 0 40px rgba(255, 51, 51, 0.3)` : theme.shadow,
                borderRadius: "12px",
                // Center initially relative to container
                left: `calc(50% - 160px)`,
                top: `calc(50% - 200px)`,
            }}
        >
            <div className="relative bg-black overflow-hidden rounded-sm" style={{ aspectRatio: "4/5" }}>
                <img
                    src={polaroid.imageUrl}
                    className="w-full h-full object-cover"
                    style={{ filter: appliedFilter, objectPosition: "center top" }}
                    draggable={false}
                />
            </div>
            <div className="mt-3 text-center font-['Caveat'] text-xl leading-tight px-2" style={{ color: theme.textColor }}>
                {polaroid.caption || "Add a caption..."}
            </div>
        </motion.div>
    );
}
