import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MINI_APPS } from "@/constants/miniapps";
import { cn } from "@/lib/utils";

const DotPattern = () => (
  <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
       style={{ 
         backgroundImage: "radial-gradient(#333 1px, transparent 1px)", 
         backgroundSize: "24px 24px" 
       }} 
  />
);

const MiniAppCard = ({ app, index }: { app: typeof MINI_APPS[0], index: number }) => {
  const isLive = app.status === "live";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
      className="w-full"
    >
      <Link 
        href={isLive ? app.href : "#"} 
        className={cn(
          "group relative flex flex-col h-full bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:-translate-y-1",
          !isLive && "opacity-80 cursor-not-allowed"
        )}
      >
        {/* Image Area / Gradient Placeholder */}
        <div className={cn(
          "w-full h-48 relative overflow-hidden transition-all duration-500",
          "bg-gradient-to-br opacity-20 group-hover:opacity-30",
          app.gradient
        )}>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay" />
           
           {/* Floating Icon in Background */}
           <div className="absolute -bottom-4 -right-4 text-9xl opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700 select-none">
             {app.icon}
           </div>
        </div>

        <div className="p-8 relative z-10 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-4">
            <div className="text-4xl p-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              {app.icon}
            </div>
            
            {isLive ? (
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-wider text-green-500">Live</span>
               </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Coming Soon</span>
              </div>
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-all">
            {app.name}
          </h3>
          <p className="text-sm text-neutral-400 leading-relaxed font-medium">
            {app.description}
          </p>
          
          {isLive && (
            <div className="mt-6 flex items-center text-sm font-bold text-[var(--color-brand-red)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Launch App <span className="ml-1">→</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-32 overflow-hidden">
        
      <DotPattern />
      
      {/* Red Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--color-brand-red)] blur-[150px] opacity-[0.06] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-6xl mx-auto">
        
        {/* Logo Animation */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-[var(--color-brand-red)] blur-[40px] opacity-20 rounded-full" />
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,51,51,0.2)] border border-white/10 bg-black group hover:scale-105 transition-transform duration-500">
             <Image 
               src="/logo.png" 
               alt="ImageStudioLab Logo" 
               fill
               sizes="96px"
               className="object-cover"
             />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
        >
          Image Studio <span className="text-[var(--color-brand-red)] relative inline-block">
            Lab
            <span className="absolute -bottom-2 left-0 w-full h-[6px] bg-[var(--color-brand-red)]/20 rounded-full blur-sm" />
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base md:text-lg text-neutral-400 max-w-2xl mb-20 leading-relaxed font-light"
        >
          The next-generation creative suite. <br className="hidden md:block" />
          <span className="text-white font-medium">Experimental tools</span> for viral content creators.
        </motion.p>

        {/* Nano Banana Wall Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-4xl mx-auto mb-12"
        >
          <Link href="/nano-banana-wall" className="block group relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🍌</span>
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">New Feature</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  Nano Banana Wall
                </h3>
                <p className="text-neutral-400 text-sm max-w-md">
                  Join the community creativity challenge. Generate AI art, post to the wall, and compete for the weekly crown.
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm group-hover:translate-x-1 transition-transform whitespace-nowrap">
                Enter the Wall <span className="text-lg">→</span>
              </div>
            </div>
          </Link>
        </motion.div>



        {/* Mini Apps Grid - Centered & Larger */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto text-left">
          {MINI_APPS.map((app, index) => (
            <MiniAppCard key={app.id} app={app} index={index} />
          ))}
        </div>

      </div>

      {/* Bottom Red Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-[var(--color-brand-red)]/10 to-transparent pointer-events-none blur-3xl" />
    </section>
  );
}
