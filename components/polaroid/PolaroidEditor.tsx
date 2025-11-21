"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePolaroidStore } from "@/store/use-polaroid-store";
import { DesktopSidebar } from "./DesktopSidebar";
import { PolaroidCanvas } from "./PolaroidCanvas";
import { MobileControls } from "./MobileControls";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export default function PolaroidEditor() {
  const { mode, setMode, polaroids } = usePolaroidStore();

  const handleExport = async () => {
    const canvas = document.getElementById("polaroid-canvas");
    if (!canvas) return;

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(canvas, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `polaroid-story-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden">
      <LoadingOverlay />
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
              mode === "single"
                ? "bg-[var(--color-brand-red)] text-white"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Single
          </button>
          <button
            onClick={() => setMode("storyboard")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all",
              mode === "storyboard"
                ? "bg-blue-600 text-white"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Story
          </button>
        </div>

        <Button
          onClick={handleExport}
          className="bg-[var(--color-brand-red)] hover:bg-red-600 text-xs h-8 px-3"
          disabled={polaroids.length === 0}
        >
          <Download size={14} className="mr-1" />
          Export
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Desktop Sidebar - Hidden on mobile */}
        <DesktopSidebar />

        {/* Canvas */}
        <PolaroidCanvas />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileControls />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
