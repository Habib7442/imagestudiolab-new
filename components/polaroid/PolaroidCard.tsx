"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolaroidStore } from "@/store/use-polaroid-store";
import { THEMES, FILTERS } from "@/constants/polaroid-presets";

import { Polaroid } from "@/store/use-polaroid-store";

interface PolaroidCardProps {
  polaroid: Polaroid;
  isSelected: boolean;
  onClick: () => void;
}

export function PolaroidCard({ polaroid, isSelected, onClick }: PolaroidCardProps) {
  const { updatePolaroid } = usePolaroidStore();
  const theme = THEMES[polaroid.theme];
  const filter = FILTERS[polaroid.filter];
  const appliedFilter = polaroid.customFilter || filter.filter;

  return (
    <motion.div
      id={`polaroid-${polaroid.id}`}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDragEnd={(_, info) => {
        updatePolaroid(polaroid.id, {
          position: {
            x: polaroid.position.x + info.offset.x,
            y: polaroid.position.y + info.offset.y,
          },
        });
      }}
      initial={{ scale: 0, rotate: polaroid.rotation, opacity: 0 }}
      animate={{
        scale: polaroid.scale || 1,
        rotate: polaroid.rotation,
        x: polaroid.position.x,
        y: polaroid.position.y,
        opacity: 1,
      }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: (polaroid.scale || 1) * 1.05, zIndex: 100 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute cursor-move select-none transition-all duration-200",
        isSelected && "ring-4 ring-[var(--color-brand-red)] ring-offset-4 z-50 shadow-2xl"
      )}
      style={{
        top: "50%",
        left: "50%",
        marginLeft: -110, // Half of width (220px)
        marginTop: -140, // Half of approximate height
        width: 220,
        backgroundColor: theme.frameColor,
        padding: "12px 12px 40px 12px",
        boxShadow: isSelected
          ? `${theme.shadow}, 0 0 40px rgba(255, 51, 51, 0.3)`
          : theme.shadow,
        borderRadius: "8px",
      }}
    >
      <div className="relative bg-black overflow-hidden rounded-sm" style={{ aspectRatio: "4/5" }}>
        <img
          src={polaroid.imageUrl}
          alt="Polaroid"
          className="w-full h-full object-cover"
          style={{
            filter: appliedFilter,
            objectPosition: "center top",
          }}
          draggable={false}
        />
      </div>

      <div
        className="mt-3 text-center font-['Caveat'] text-lg leading-tight px-1"
        style={{ color: theme.textColor }}
      >
        <p 
          className={cn(
            "text-center leading-tight w-full break-words whitespace-pre-wrap",
            (polaroid.caption?.length || 0) > 50 ? "text-[10px]" : "text-xs"
          )}
        >
          {polaroid.caption || "Add a caption..."}
        </p>
      </div>

      {isSelected && (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-600 z-50"
            onClick={(e) => {
              e.stopPropagation();
              usePolaroidStore.getState().removePolaroid(polaroid.id);
            }}
          >
            <X size={14} className="text-white" />
          </motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -left-3 w-7 h-7 bg-[var(--color-brand-red)] rounded-full flex items-center justify-center shadow-lg z-50"
          >
            <Check size={14} className="text-white" />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
