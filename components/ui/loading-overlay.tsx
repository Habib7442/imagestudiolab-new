"use client";

import { Loader2 } from "lucide-react";
import { usePolaroidStore } from "@/store/use-polaroid-store";

export function LoadingOverlay() {
  const { isGeneratingCaption, isGeneratingEdit } = usePolaroidStore();
  const isLoading = isGeneratingCaption || isGeneratingEdit;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-xl p-6 flex flex-col items-center gap-4 shadow-2xl">
        <Loader2 className="w-10 h-10 text-[var(--color-brand-red)] animate-spin" />
        <div className="text-center">
          <h3 className="text-white font-bold text-lg">Magic in Progress</h3>
          <p className="text-neutral-400 text-sm">
            {isGeneratingCaption ? "Writing the perfect caption..." : "Applying sexy edits..."}
          </p>
        </div>
      </div>
    </div>
  );
}
