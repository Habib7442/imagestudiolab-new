import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SlideProps {
  slide: {
    id: number | string;
    type?: string;
    title: string;
    content: string;
    image_url?: string;
    image_prompt?: string;
  };
  index: number;
  total: number;
  className?: string;
  headingColor?: string;
  contentColor?: string;
  fontFamily?: string;
}

export const Slide = forwardRef<HTMLDivElement, SlideProps>(({ 
  slide, 
  index, 
  total, 
  className,
  headingColor = "#ffffff",
  contentColor = "#e5e7eb",
  fontFamily = "Inter"
}, ref) => {
  return (
    <div ref={ref} className={cn("bg-white h-full w-full p-6 flex flex-col relative overflow-hidden shadow-sm border border-gray-100", className)} style={{ fontFamily }}>
      {/* Background Image */}
      {/* Background Image */}
      {slide.image_url ? (
        <div className="absolute inset-0 z-0">
          <img 
            src={slide.image_url} 
            alt={slide.title} 
            className="w-full h-full object-cover opacity-100"
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-neutral-900 flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white opacity-50"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mt-auto p-4">
        <div className="flex items-center justify-between mb-2 opacity-80 text-xs uppercase tracking-widest font-medium" style={{ color: contentColor }}>
          <span>{index === 0 ? "Cover Story" : `Slide ${index + 1}`}</span>
          <span>{index + 1} / {total}</span>
        </div>
        
        <h2 
          className="text-3xl font-bold mb-3 leading-tight text-shadow-sm"
          style={{ color: headingColor }}
        >
          {slide.title}
        </h2>
        
        <p 
          className="text-lg font-light leading-relaxed text-shadow-sm"
          style={{ color: contentColor }}
        >
          {slide.content}
        </p>

        {index === total - 1 && (
            <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-center" style={{ borderColor: contentColor }}>
                <span className="text-sm font-medium" style={{ color: contentColor }}>Swipe for more →</span>
            </div>
        )}
      </div>

      {/* Brand/Watermark (Optional) */}
      <div className="absolute top-4 right-4 z-20 opacity-50">
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md" />
      </div>
    </div>
  );
});

Slide.displayName = "Slide";
