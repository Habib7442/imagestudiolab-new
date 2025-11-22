"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolaroidStore, TextElement } from "@/store/use-polaroid-store";
import { useRef } from "react";

interface TextElementComponentProps {
  element: TextElement;
  isSelected: boolean;
  onClick: () => void;
}

export function TextElementComponent({ element, isSelected, onClick }: TextElementComponentProps) {
  const { updateTextElement, removeTextElement } = usePolaroidStore();
  const elementRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={elementRef}
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => {
        updateTextElement(element.id, {
          x: element.x + info.offset.x,
          y: element.y + info.offset.y,
        });
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: element.x,
        y: element.y,
        rotate: element.rotation,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute cursor-move select-none p-2 border border-transparent hover:border-white/20 rounded-lg transition-colors",
        isSelected && "border-[var(--color-brand-red)] bg-black/5"
      )}
      style={{
        top: "50%",
        left: "50%",
        zIndex: isSelected ? 100 : 50,
      }}
    >
      <p
        style={{
          fontSize: element.fontSize,
          color: element.color,
          fontFamily: element.fontFamily,
          fontWeight: element.fontWeight,
          whiteSpace: "pre-wrap",
          textAlign: "center",
          lineHeight: 1.2,
          textShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        {element.text}
      </p>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-red-600 z-50"
          onClick={(e) => {
            e.stopPropagation();
            removeTextElement(element.id);
          }}
        >
          <X size={10} className="text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}
