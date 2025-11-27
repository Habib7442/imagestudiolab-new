"use client";

import React from "react";
import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/shared/Hero";

import OurGenerations from "@/components/shared/OurGenerations";
import Features from "@/components/shared/Features";
import Footer from "@/components/shared/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-[var(--color-brand-red)] selection:text-white">
      
      <Navbar />
      <Hero />
      
      <OurGenerations />
      
      <Features />
      
      <Footer />

      {/* Bottom Red Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-[var(--color-brand-red)]/20 to-transparent pointer-events-none blur-3xl" />
    </div>
  );
}
