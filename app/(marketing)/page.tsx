"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Layers, ShieldCheck } from "lucide-react";
import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/shared/Hero";

import OurGenerations from "@/components/shared/OurGenerations";

// --- Components ---

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-xl p-8 relative overflow-hidden group hover:border-white/10 transition-colors"
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-brand-red)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="mb-6 text-white p-3 bg-white/5 rounded-lg inline-block group-hover:bg-[var(--color-brand-red)]/10 group-hover:text-[var(--color-brand-red)] transition-colors duration-300">
      <Icon size={24} />
    </div>
    
    <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
    <p className="text-neutral-500 text-sm leading-relaxed group-hover:text-neutral-400 transition-colors">
      {desc}
    </p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-[var(--color-brand-red)] selection:text-white">
      
      <Navbar />
      <Hero />
      
      <OurGenerations />

      {/* --- CARDS SECTION --- */}


        {/* Bottom Red Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-[var(--color-brand-red)]/20 to-transparent pointer-events-none blur-3xl" />


    </div>
  );
}
