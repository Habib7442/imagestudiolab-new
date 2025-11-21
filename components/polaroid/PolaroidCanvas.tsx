"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { usePolaroidStore } from "@/store/use-polaroid-store";
import { EXPORT_SIZES } from "@/constants/polaroid-presets";
import { PolaroidCard } from "./PolaroidCard";

export function PolaroidCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { polaroids, mode, exportSize, backgroundColor, selectedPolaroid, setSelectedPolaroid } = usePolaroidStore();
  
  const currentSize = mode === "single" ? EXPORT_SIZES.single[exportSize] : EXPORT_SIZES.storyboard[exportSize];

  return (
    <main className="flex-1 overflow-hidden relative bg-[#111] flex items-center justify-center p-4 sm:p-8">
      {/* Social Media 1:1 Canvas Container */}
      <div
        id="polaroid-canvas"
        ref={canvasRef}
        className="relative shadow-2xl overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor,
          width: "min(100%, 80vh)",
          aspectRatio: "1/1",
          borderRadius: "2px", // Slight rounding for aesthetics, or 0 for strict square
        }}
      >
        {polaroids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center p-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ImageIcon size={64} className="mx-auto mb-4 text-neutral-800/50" />
              </motion.div>
              <h2 className="text-xl font-bold text-neutral-800/70 mb-2">
                Canvas Ready
              </h2>
              <p className="text-neutral-600/70 text-sm max-w-[200px] mx-auto">
                Upload photos to start your aesthetic creation
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {polaroids.map((polaroid) => (
              <PolaroidCard
                key={polaroid.id}
                polaroid={polaroid}
                isSelected={selectedPolaroid === polaroid.id}
                onClick={() => setSelectedPolaroid(polaroid.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
