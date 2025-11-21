"use client";

import { useState } from "react";
import { LayoutTemplate, Plus, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TemplatesList } from "./TemplatesList";
import { usePolaroidStore } from "@/store/use-polaroid-store";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

export function MobileControls() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { 
    addPolaroid, 
    mode, 
    polaroids,
    selectedPolaroid, 
    generateAIForPolaroid,
    backgroundColor,
    setBackgroundColor,
    updatePolaroid,
  } = usePolaroidStore();

  const onDrop = (acceptedFiles: File[]) => {
    if (mode === "storyboard" && polaroids.length + acceptedFiles.length > 5) {
      alert("Maximum 5 images allowed for optimal performance.");
      return;
    }

    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          addPolaroid({
            id: `polaroid-${Date.now()}-${Math.random()}`,
            imageUrl: reader.result,
            caption: "",
            filter: "none",
            theme: "classic",
            rotation: Math.random() * 10 - 5,
            position: { x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 },
            scale: 0.5,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: mode === "storyboard",
    noClick: true, // We'll trigger it manually
  });

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/10 px-4 py-3 z-50">
      <div className="flex items-center justify-around">
        {/* Add Image */}
        <div {...getRootProps()}>
          <input {...getInputProps()} id="mobile-upload-input" className="hidden" />
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-white hover:bg-white/10"
            onClick={() => document.getElementById("mobile-upload-input")?.click()}
          >
            <Plus size={24} />
            <span className="sr-only">Add Image</span>
          </Button>
        </div>

        {/* Templates Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white hover:bg-white/10"
            >
              <LayoutTemplate size={24} />
              <span className="sr-only">Templates</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-[#0A0A0A] border-t border-white/10 h-auto max-h-[40vh]">
            <SheetHeader className="mb-3">
              <SheetTitle className="text-white text-sm">Choose Template</SheetTitle>
            </SheetHeader>
            <div className="overflow-x-auto overflow-y-hidden pb-4">
              <div className="flex gap-3 px-1">
                {require("@/constants/templates").TEMPLATES.map((template: any) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      usePolaroidStore.getState().applyTemplate(template.id);
                    }}
                    className="flex-shrink-0 w-24 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--color-brand-red)] rounded-lg p-3 transition-all"
                  >
                    <div className="aspect-square bg-black/30 rounded mb-2 flex items-center justify-center">
                      <LayoutTemplate size={20} className="text-neutral-600" />
                    </div>
                    <p className="text-[10px] text-white font-medium truncate">{template.name}</p>
                    <p className="text-[8px] text-neutral-500">{template.slots.length}+ images</p>
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Settings/Edit Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white hover:bg-white/10"
            >
              <SlidersHorizontal size={24} />
              <span className="sr-only">Edit</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#0A0A0A] border-l border-white/10 w-80">
            <SheetHeader>
              <SheetTitle className="text-white">Editor Tools</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {selectedPolaroid && (
                <div className="space-y-6 pt-2">
                  <h3 className="text-sm font-bold text-white/90">Edit Polaroid</h3>
                  
                  {/* Caption Section */}
                  <div className="space-y-3">
                    <label className="text-xs text-neutral-400 flex justify-between items-center">
                      <span>Caption</span>
                      <button 
                        onClick={() => generateAIForPolaroid(selectedPolaroid)}
                        className="text-[10px] text-[var(--color-brand-red)] hover:underline flex items-center gap-1"
                      >
                        ✨ Auto-Caption
                      </button>
                    </label>
                    <textarea
                      value={usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.caption || ""}
                      onChange={(e) => updatePolaroid(selectedPolaroid, { caption: e.target.value })}
                      placeholder="Write a caption..."
                      className="w-full bg-white/5 border border-white/10 rounded-md text-sm text-white p-3 outline-none focus:border-[var(--color-brand-red)] resize-none font-['Caveat']"
                      rows={2}
                    />
                  </div>

                  {/* Rotation Control */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-neutral-400">Rotation</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={Math.round(usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.rotation || 0)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) updatePolaroid(selectedPolaroid, { rotation: val });
                          }}
                          className="w-12 bg-transparent text-right text-xs text-white border-b border-white/20 focus:border-[var(--color-brand-red)] outline-none"
                        />
                        <span className="text-xs text-neutral-400">°</span>
                      </div>
                    </div>
                    <Slider
                      defaultValue={[0]}
                      value={[usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.rotation || 0]}
                      min={-45}
                      max={45}
                      step={1}
                      onValueChange={(value) => updatePolaroid(selectedPolaroid, { rotation: value[0] })}
                      className="py-2"
                    />
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {[-45, -30, -15, 0, 15, 30, 45].map((deg) => (
                        <button
                          key={deg}
                          onClick={() => updatePolaroid(selectedPolaroid, { rotation: deg })}
                          className={cn(
                            "px-3 py-1.5 text-[10px] rounded border transition-colors whitespace-nowrap",
                            Math.round(usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.rotation || 0) === deg
                              ? "bg-[var(--color-brand-red)] border-[var(--color-brand-red)] text-white"
                              : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                          )}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Control */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-neutral-400">Size / Scale</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={Math.round((usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.scale || 1) * 100)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) updatePolaroid(selectedPolaroid, { scale: val / 100 });
                          }}
                          className="w-12 bg-transparent text-right text-xs text-white border-b border-white/20 focus:border-[var(--color-brand-red)] outline-none"
                        />
                        <span className="text-xs text-neutral-400">%</span>
                      </div>
                    </div>
                    <Slider
                      defaultValue={[1]}
                      value={[usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.scale || 1]}
                      min={0.5}
                      max={2}
                      step={0.1}
                      onValueChange={(value) => updatePolaroid(selectedPolaroid, { scale: value[0] })}
                      className="py-2"
                    />
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                      {[50, 75, 100, 125, 150, 200].map((size) => (
                        <button
                          key={size}
                          onClick={() => updatePolaroid(selectedPolaroid, { scale: size / 100 })}
                          className={cn(
                            "px-3 py-1.5 text-[10px] rounded border transition-colors whitespace-nowrap",
                            Math.round((usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.scale || 1) * 100) === size
                              ? "bg-[var(--color-brand-red)] border-[var(--color-brand-red)] text-white"
                              : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                          )}
                        >
                          {size}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter & Theme */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-neutral-400 block">Filter</label>
                      <select
                        value={usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.filter || "none"}
                        onChange={(e) => updatePolaroid(selectedPolaroid, { filter: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-md text-xs text-white p-2 outline-none focus:border-[var(--color-brand-red)]"
                      >
                        {Object.keys(require("@/constants/polaroid-presets").FILTERS).map((f) => (
                          <option key={f} value={f} className="bg-[#0A0A0A]">{f}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-neutral-400 block">Theme</label>
                      <select
                        value={usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.theme || "classic"}
                        onChange={(e) => updatePolaroid(selectedPolaroid, { theme: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-md text-xs text-white p-2 outline-none focus:border-[var(--color-brand-red)]"
                      >
                        {Object.keys(require("@/constants/polaroid-presets").THEMES).map((t) => (
                          <option key={t} value={t} className="bg-[#0A0A0A]">{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sexy AI Edits */}
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <h4 className="text-xs font-bold text-white/90">AI Edits</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {require("@/constants/ai-presets").AI_EDIT_PRESETS.map((preset: any) => (
                        <button
                          key={preset.id}
                          onClick={() => usePolaroidStore.getState().editPolaroidImage(selectedPolaroid, preset.prompt)}
                          className="text-[10px] py-2.5 px-2 bg-white/5 hover:bg-[var(--color-brand-red)]/20 border border-white/10 hover:border-[var(--color-brand-red)] rounded transition-colors text-left truncate"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Custom AI prompt..."
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2.5 text-xs text-white focus:border-[var(--color-brand-red)] outline-none pr-8"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            usePolaroidStore.getState().editPolaroidImage(selectedPolaroid, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="text-[10px] text-neutral-500">↵</span>
                      </div>
                    </div>

                    {usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.originalImageUrl && 
                     usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.originalImageUrl !== 
                     usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.imageUrl && (
                      <button
                        onClick={() => usePolaroidStore.getState().restorePolaroidImage(selectedPolaroid)}
                        className="w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <span>↺</span> Restore Original Image
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Background Color */}
              <div className="space-y-4 pt-6 border-t border-white/10 mt-6">
                <h3 className="text-sm font-bold text-white/90">Canvas Background</h3>
                <div className="grid grid-cols-5 gap-3">
                  {["#E8DCC4", "#000000", "#FFFFFF", "#FFB6C1", "#E0F7FA", "#F3E5F5", "#FFF3E0", "#E8F5E9", "#ECEFF1", "#212121"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={cn(
                        "w-12 h-12 rounded-full border border-white/20 transition-transform active:scale-95",
                        backgroundColor === color && "ring-2 ring-white ring-offset-2 ring-offset-black"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20">
                    <input 
                        type="color" 
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
