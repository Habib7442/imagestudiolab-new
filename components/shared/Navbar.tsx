"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled && "bg-[#050505]/80 backdrop-blur-md border-white/5 py-4",
        !isScrolled && "py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 overflow-hidden rounded-lg shadow-[0_0_15px_rgba(255,51,51,0.3)] transition-shadow group-hover:shadow-[0_0_25px_rgba(255,51,51,0.5)]">
            <Image 
              src="/logo.png" 
              alt="ImageStudioLab" 
              fill 
              className="object-cover"
            />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            ImageStudio<span className="text-[var(--color-brand-red)]">Lab</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {["Features", "Pricing", "Docs"].map((item) => (
            <Link 
              key={item} 
              href="#" 
              className="text-neutral-400 hover:text-white transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--color-brand-red)] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="text-neutral-400 hover:text-white hover:bg-white/5">
            <Link href="/login">
              Sign in
            </Link>
          </Button>
          <Button asChild className="bg-[var(--color-brand-red)] hover:bg-red-600 text-white shadow-[0_0_15px_rgba(255,51,51,0.3)] hover:shadow-[0_0_25px_rgba(255,51,51,0.5)] border-none">
            <Link href="/polaroid">
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
