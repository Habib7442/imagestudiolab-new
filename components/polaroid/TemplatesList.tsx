"use client";

import { LayoutTemplate } from "lucide-react";
import { TEMPLATES } from "@/constants/templates";
import { usePolaroidStore } from "@/store/use-polaroid-store";
import { cn } from "@/lib/utils";

export function TemplatesList() {
  const { applyTemplate, polaroids } = usePolaroidStore();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-white/90">
        <LayoutTemplate size={16} className="text-[var(--color-brand-red)]" />
        Templates
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => applyTemplate(template.id)}
            className={cn(
              "group relative aspect-square rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all overflow-hidden text-left p-3 flex flex-col justify-end",
              "hover:border-[var(--color-brand-red)]/50"
            )}
          >
            {/* Preview Visualization (CSS-based) */}
            <div className="absolute inset-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="relative w-full h-full">
                {template.slots.map((slot, i) => (
                  <div
                    key={i}
                    className="absolute bg-white/20 border border-white/30 rounded-sm shadow-sm"
                    style={{
                      width: '40%',
                      height: '50%',
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${slot.x * 0.2}px, ${slot.y * 0.2}px) rotate(${slot.rotation}deg) scale(${slot.scale * 0.8})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-xs font-medium text-white truncate">
                {template.name}
              </div>
              <div className="text-[10px] text-neutral-400 truncate">
                {template.minImages}+ images
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {polaroids.length < 2 && (
        <p className="text-[10px] text-neutral-500 mt-2 italic">
          Add more images to see the full effect of templates.
        </p>
      )}
    </div>
  );
}
