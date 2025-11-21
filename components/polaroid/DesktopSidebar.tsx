"use client";

import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn, resizeImage } from "@/lib/utils";
import { usePolaroidStore } from "@/store/use-polaroid-store";
import { TemplatesList } from "./TemplatesList";
import { Slider } from "@/components/ui/slider";

export function DesktopSidebar() {
  const {
    mode,
    polaroids,
    selectedPolaroid,
    backgroundColor,
    exportSize,
    setBackgroundColor,
    addPolaroid,
    generateAIForPolaroid,
    updatePolaroid,
  } = usePolaroidStore();

  const onDrop = (acceptedFiles: File[]) => {
    if (mode === "storyboard" && polaroids.length + acceptedFiles.length > 5) {
      alert("Maximum 5 images allowed for optimal performance.");
      return;
    }

    acceptedFiles.forEach(async (file) => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit for video
        alert(`File ${file.name} is too large. Please upload files under 50MB.`);
        return;
      }

      const isVideo = file.type.startsWith('video/');

      if (isVideo) {
        // Video handling
        const videoUrl = URL.createObjectURL(file);
        addPolaroid({
          id: `polaroid-${Date.now()}-${Math.random()}`,
          imageUrl: videoUrl,
          mediaType: 'video',
          caption: "",
          filter: "none",
          theme: "classic",
          rotation: Math.random() * 10 - 5,
          position: { x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 },
          scale: 0.5,
        });
        
        // Force single mode for video
        if (mode === 'storyboard') {
             usePolaroidStore.getState().setMode('single');
             alert("Switched to Single Mode for video support.");
        }
      } else {
        // Image handling
        if (file.size > 5 * 1024 * 1024) {
             alert(`File ${file.name} is too large. Please upload images under 5MB.`);
             return;
        }
        try {
          const resizedImage = await resizeImage(file);
          addPolaroid({
            id: `polaroid-${Date.now()}-${Math.random()}`,
            imageUrl: resizedImage,
            mediaType: 'image',
            caption: "",
            filter: "none",
            theme: "classic",
            rotation: Math.random() * 10 - 5,
            position: { x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 },
            scale: 0.5,
          });
        } catch (error) {
          console.error("Failed to process image:", error);
        }
      }
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        "image/*": [],
        "video/*": [] 
    },
    multiple: mode === "storyboard",
  });

  const selectedPolaroidData = polaroids.find((p) => p.id === selectedPolaroid);

  return (
    <aside className="hidden lg:block w-80 border-r border-white/10 bg-[#0A0A0A] overflow-y-auto custom-scrollbar">
      <div className="p-6 space-y-6">
        {/* Upload Section */}
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-white/90">
            <Upload size={16} className="text-[var(--color-brand-red)]" />
            Upload Images
            {mode === "single" && (
              <span className="ml-auto text-[10px] font-normal px-2 py-0.5 rounded-full bg-[var(--color-brand-red)]/20 text-[var(--color-brand-red)]">
                Single Mode
              </span>
            )}
            {mode === "storyboard" && (
              <span className="ml-auto text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                Storyboard Mode
              </span>
            )}
          </h3>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
              isDragActive
                ? "border-[var(--color-brand-red)] bg-[var(--color-brand-red)]/10 scale-105"
                : "border-white/20 hover:border-[var(--color-brand-red)]/50 hover:bg-white/5"
            )}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ y: isDragActive ? -5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ImageIcon size={40} className="mx-auto mb-3 text-neutral-500" />
              <p className="text-sm font-medium text-white">
                {isDragActive ? "Drop images here" : "Click or drag images"}
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                {mode === "single"
                  ? "Upload will replace current image"
                  : "Add multiple images for storyboard"}
              </p>
            </motion.div>
          </div>
        </div>

        {!selectedPolaroidData && polaroids.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon size={32} className="mx-auto mb-3 text-neutral-700" />
            <p className="text-sm text-neutral-600">
              Upload an image to start creating
            </p>
          </div>
        )}

        {/* Selected Polaroid Controls */}
        {selectedPolaroidData && (
          <div className="border-t border-white/10 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-white/90">Edit Polaroid</h3>
            
            {/* Caption Section */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 flex justify-between items-center">
                <span>Caption</span>
                <button 
                  onClick={() => generateAIForPolaroid(selectedPolaroidData.id)}
                  className="text-[10px] text-[var(--color-brand-red)] hover:underline flex items-center gap-1"
                >
                  ✨ Auto-Caption
                </button>
              </label>
              <textarea
                value={selectedPolaroidData.caption}
                onChange={(e) => updatePolaroid(selectedPolaroidData.id, { caption: e.target.value })}
                placeholder="Write a caption..."
                className="w-full bg-white/5 border border-white/10 rounded-md text-sm text-white p-2 outline-none focus:border-[var(--color-brand-red)] resize-none font-['Caveat']"
                rows={2}
              />
            </div>

            {/* Rotation Control */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-neutral-400">Rotation</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Math.round(selectedPolaroidData.rotation)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) updatePolaroid(selectedPolaroidData.id, { rotation: val });
                    }}
                    className="w-12 bg-transparent text-right text-xs text-white border-b border-white/20 focus:border-[var(--color-brand-red)] outline-none"
                  />
                  <span className="text-xs text-neutral-400">°</span>
                </div>
              </div>
              <Slider
                defaultValue={[0]}
                value={[selectedPolaroidData.rotation]}
                min={-45}
                max={45}
                step={1}
                onValueChange={(value) => updatePolaroid(selectedPolaroidData.id, { rotation: value[0] })}
                className="py-2"
              />
              <div className="flex gap-1 mt-2 overflow-x-auto pb-1 custom-scrollbar">
                {[-45, -30, -15, 0, 15, 30, 45].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => updatePolaroid(selectedPolaroidData.id, { rotation: deg })}
                    className={cn(
                      "px-2 py-1 text-[10px] rounded border transition-colors whitespace-nowrap",
                      Math.round(selectedPolaroidData.rotation) === deg
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
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-neutral-400">Size / Scale</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={Math.round((selectedPolaroidData.scale || 1) * 100)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) updatePolaroid(selectedPolaroidData.id, { scale: val / 100 });
                    }}
                    className="w-12 bg-transparent text-right text-xs text-white border-b border-white/20 focus:border-[var(--color-brand-red)] outline-none"
                  />
                  <span className="text-xs text-neutral-400">%</span>
                </div>
              </div>
              <Slider
                defaultValue={[1]}
                value={[selectedPolaroidData.scale || 1]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={(value) => updatePolaroid(selectedPolaroidData.id, { scale: value[0] })}
                className="py-2"
              />
              <div className="flex gap-1 mt-2 overflow-x-auto pb-1 custom-scrollbar">
                {[50, 75, 100, 125, 150, 200].map((size) => (
                  <button
                    key={size}
                    onClick={() => updatePolaroid(selectedPolaroidData.id, { scale: size / 100 })}
                    className={cn(
                      "px-2 py-1 text-[10px] rounded border transition-colors whitespace-nowrap",
                      Math.round((selectedPolaroidData.scale || 1) * 100) === size
                        ? "bg-[var(--color-brand-red)] border-[var(--color-brand-red)] text-white"
                        : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10"
                    )}
                  >
                    {size}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Filter</label>
                <select
                  value={selectedPolaroidData.filter}
                  onChange={(e) => updatePolaroid(selectedPolaroidData.id, { filter: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-md text-xs text-white p-2 outline-none focus:border-[var(--color-brand-red)]"
                >
                  {Object.keys(require("@/constants/polaroid-presets").FILTERS).map((f) => (
                    <option key={f} value={f} className="bg-[#0A0A0A]">{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Theme</label>
                <select
                  value={selectedPolaroidData.theme}
                  onChange={(e) => updatePolaroid(selectedPolaroidData.id, { theme: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-md text-xs text-white p-2 outline-none focus:border-[var(--color-brand-red)]"
                >
                  {Object.keys(require("@/constants/polaroid-presets").THEMES).map((t) => (
                    <option key={t} value={t} className="bg-[#0A0A0A]">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sexy AI Edits */}
            <div className="pt-4 border-t border-white/10">
              {selectedPolaroidData.mediaType === 'video' ? (
                <div className="text-center py-2">
                  <h4 className="text-xs font-bold text-white/90 mb-2">Video Enhancements</h4>
                  <p className="text-[10px] text-neutral-500">AI edits are not available for video.</p>
                  <p className="text-[10px] text-neutral-500 mt-1">Try the new cinematic filters above! 👆</p>
                </div>
              ) : (
                <>
                  <h4 className="text-xs font-bold text-white/90 mb-3">AI Edits</h4>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {require("@/constants/ai-presets").AI_EDIT_PRESETS.map((preset: any) => (
                      <button
                        key={preset.id}
                        onClick={() => usePolaroidStore.getState().editPolaroidImage(selectedPolaroidData.id, preset.prompt)}
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
                          usePolaroidStore.getState().editPolaroidImage(selectedPolaroidData.id, e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <span className="text-[10px] text-neutral-500">↵</span>
                    </div>
                  </div>

                  {selectedPolaroidData.originalImageUrl && selectedPolaroidData.originalImageUrl !== selectedPolaroidData.imageUrl && (
                    <button
                      onClick={() => usePolaroidStore.getState().restorePolaroidImage(selectedPolaroidData.id)}
                      className="w-full mt-3 py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <span>↺</span> Restore Original Image
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Background Color */}
        <div className="border-t border-white/10 pt-6 space-y-4">
          <h3 className="text-sm font-bold text-white/90">Canvas Background</h3>
          <div className="grid grid-cols-5 gap-2">
            {["#E8DCC4", "#000000", "#FFFFFF", "#FFB6C1", "#E0F7FA", "#F3E5F5", "#FFF3E0", "#E8F5E9", "#ECEFF1", "#212121"].map((color) => (
              <button
                key={color}
                onClick={() => setBackgroundColor(color)}
                className={cn(
                  "w-8 h-8 rounded-full border border-white/20 transition-transform hover:scale-110",
                  backgroundColor === color && "ring-2 ring-white ring-offset-2 ring-offset-black"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
               <input 
                  type="color" 
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
               />
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <div className="border-t border-white/10 pt-6">
          {polaroids.some(p => p.mediaType === 'video') ? (
            <div className="text-center py-4">
               <p className="text-xs text-neutral-500">Templates are disabled for video polaroids.</p>
            </div>
          ) : (
            <TemplatesList />
          )}
        </div>

        {/* More controls will be added here via separate components */}
      </div>
    </aside>
  );
}
