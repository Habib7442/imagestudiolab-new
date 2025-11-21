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
    selectedPolaroid, 
    generateAIForPolaroid,
    backgroundColor,
    setBackgroundColor,
    updatePolaroid,
  } = usePolaroidStore();

  const onDrop = (acceptedFiles: File[]) => {
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
          <SheetContent side="bottom" className="bg-[#0A0A0A] border-t border-white/10 h-[80vh]">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-white">Choose Template</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-full pb-20">
              <TemplatesList />
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
          <SheetContent side="bottom" className="bg-[#0A0A0A] border-t border-white/10 h-[80vh]">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-white">Editor Tools</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-full pb-20 space-y-6">
              {/* Magic AI */}
              {selectedPolaroid && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white/90">AI Magic</h3>
                  {/* Caption Section */}
                  <div className="space-y-2">
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
                      className="w-full bg-white/5 border border-white/10 rounded-md text-sm text-white p-2 outline-none focus:border-[var(--color-brand-red)] resize-none font-['Caveat']"
                      rows={2}
                    />
                  </div>
                  {/* Sexy AI Edits */}
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold text-white/90 mb-3">Sexy AI Edits</h4>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {require("@/constants/ai-presets").AI_EDIT_PRESETS.map((preset: any) => (
                        <button
                          key={preset.id}
                          onClick={() => usePolaroidStore.getState().editPolaroidImage(selectedPolaroid, preset.prompt)}
                          className="text-[10px] py-2 px-2 bg-white/5 hover:bg-[var(--color-brand-red)]/20 border border-white/10 hover:border-[var(--color-brand-red)] rounded transition-colors text-left truncate"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Custom AI prompt..."
                        className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-[var(--color-brand-red)] outline-none pr-8"
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
                     usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.originalImageUrl !== usePolaroidStore.getState().polaroids.find(p => p.id === selectedPolaroid)?.imageUrl && (
                      <button
                        onClick={() => usePolaroidStore.getState().restorePolaroidImage(selectedPolaroid)}
                        className="w-full mt-3 py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <span>↺</span> Restore Original Image
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Background Color */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white/90">Canvas Background</h3>
                <div className="grid grid-cols-5 gap-3">
                  {["#E8DCC4", "#000000", "#FFFFFF", "#FFB6C1", "#E0F7FA", "#F3E5F5", "#FFF3E0", "#E8F5E9", "#ECEFF1", "#212121"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={cn(
                        "w-10 h-10 rounded-full border border-white/20 transition-transform active:scale-95",
                        backgroundColor === color && "ring-2 ring-white ring-offset-2 ring-offset-black"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
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
