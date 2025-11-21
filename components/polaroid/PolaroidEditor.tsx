"use client";

import { useEffect } from "react";
import { Download, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePolaroidStore } from "@/store/use-polaroid-store";
import { DesktopSidebar } from "./DesktopSidebar";
import { PolaroidCanvas } from "./PolaroidCanvas";
import { MobileControls } from "./MobileControls";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PolaroidEditor() {
  const { mode, setMode, polaroids, setBackgroundColor } = usePolaroidStore();
  const router = useRouter();
  const supabase = createClient();

  // Restore state after login
  useEffect(() => {
    const savedState = localStorage.getItem('polaroid-state-before-login');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        // Restore the polaroids and settings
        state.polaroids.forEach((polaroid: any) => {
          usePolaroidStore.getState().addPolaroid(polaroid);
        });
        if (state.backgroundColor) {
          setBackgroundColor(state.backgroundColor);
        }
        if (state.mode) {
          setMode(state.mode);
        }
        // Clear the saved state
        localStorage.removeItem('polaroid-state-before-login');
      } catch (err) {
        console.error('Failed to restore state:', err);
      }
    }
  }, [setBackgroundColor, setMode]);


  const handleExport = async () => {
    usePolaroidStore.getState().setIsExporting(true);
    
    try {
      // Hide icons by deselecting
      usePolaroidStore.getState().setSelectedPolaroid(null);
      
      // Allow a brief moment for the UI to update (hide icons)
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = document.getElementById("polaroid-canvas");
      if (!canvas) throw new Error("Canvas not found");

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Save current polaroid state to localStorage before redirecting
        const currentState = {
          polaroids: usePolaroidStore.getState().polaroids,
          backgroundColor: usePolaroidStore.getState().backgroundColor,
          mode: usePolaroidStore.getState().mode,
        };
        localStorage.setItem('polaroid-state-before-login', JSON.stringify(currentState));
        
        // Redirect to login with return URL
        alert("Please sign in to download your creation. Your work will be saved!");
        router.push('/login?returnTo=/polaroid');
        return;
      }

      // Check for video
      const videoPolaroid = polaroids.find(p => p.mediaType === 'video');

      if (videoPolaroid) {
          const { exportVideo } = await import("@/lib/video-exporter");
          await exportVideo(videoPolaroid);
          return;
      }

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(canvas, { 
        cacheBust: true, 
        pixelRatio: 3,
        quality: 1.0,
        backgroundColor: usePolaroidStore.getState().backgroundColor
      });
      const link = document.createElement("a");
      link.download = `polaroid-story-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export", err);
      alert("Failed to export. Please try again.");
    } finally {
      usePolaroidStore.getState().setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const hasVideo = polaroids.some(p => p.mediaType === 'video');

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden">
      <LoadingOverlay />
      {/* Header */}
      <header className="flex-none h-16 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md z-50 px-3 sm:px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="text-2xl">📸</div>
          <h1 className="text-lg sm:text-xl font-bold hidden sm:block">
            Polaroid<span className="text-[var(--color-brand-red)]">X</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-black/50 rounded-full p-1 border border-white/10">
          <button
            onClick={() => setMode("single")}
            className={cn(
              "px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all",
              mode === "single"
                ? "bg-[var(--color-brand-red)] text-white"
                : "text-neutral-400 hover:text-white"
            )}
          >
            Single
          </button>
          <button
            onClick={() => !hasVideo && setMode("storyboard")}
            disabled={hasVideo}
            className={cn(
              "px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all",
              mode === "storyboard"
                ? "bg-blue-600 text-white"
                : hasVideo ? "text-neutral-600 cursor-not-allowed" : "text-neutral-400 hover:text-white"
            )}
            title={hasVideo ? "Story mode disabled for video" : "Switch to Story mode"}
          >
            Story
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            className="bg-[var(--color-brand-red)] hover:bg-red-600 text-xs h-8 px-2 sm:px-3"
            disabled={polaroids.length === 0}
          >
            <Download size={14} className="sm:mr-1" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/10"
            title="Logout"
          >
            <LogOut size={16} />
          </Button>
        </div>
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
