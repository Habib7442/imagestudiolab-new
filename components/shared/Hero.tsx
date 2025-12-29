import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Lightbulb, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";

const DotPattern = () => (
  <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
       style={{ 
         backgroundImage: "radial-gradient(#333 1px, transparent 1px)", 
         backgroundSize: "24px 24px" 
       }} 
  />
);

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-32 pb-20 overflow-hidden">
        
      <DotPattern />
      
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest">New V2.0 Engine</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight"
        >
          Visualise Ideas with <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
            AI Infographics
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-16 leading-relaxed"
        >
          Turn complex topics or product catalogs into viral, high-converting vertical infographics in seconds. No design skills needed.
        </motion.p>

        {/* Two Main Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
           {/* Topic Card */}
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.6 }}
           >
             <Link href="/create/topic" className="group relative block h-full p-8 rounded-3xl bg-[#0F0F0F] border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-500 text-left overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700">
                   <Lightbulb className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Topic to Visual</h3>
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        Explain concepts, listicles, or guides. Perfect for educational content.
                      </p>
                   </div>
                   <div className="mt-8 flex items-center gap-2 text-sm font-bold text-purple-400 group-hover:translate-x-2 transition-transform">
                      Start Creating <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
             </Link>
           </motion.div>

           {/* Product Card */}
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.7 }}
           >
             <Link href="/create/product" className="group relative block h-full p-8 rounded-3xl bg-[#0F0F0F] border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-500 text-left overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                   <ShoppingBag className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Product Showcase</h3>
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        Turn product photos into high-converting ads and flyers automatically.
                      </p>
                   </div>
                   <div className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:translate-x-2 transition-transform">
                      Start Creating <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
             </Link>
           </motion.div>
        </div>

      </div>
    </section>
  );
}
