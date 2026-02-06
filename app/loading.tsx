"use client";

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-6">
        <motion.div 
          className="absolute inset-0 border-4 border-teal-50 rounded-full"
        />
        <motion.div 
          className="absolute inset-0 border-4 border-t-teal-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl rotate-12 flex items-center justify-center text-white font-black text-xl">D</div>
        </div>
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-outfit font-black text-slate-800 tracking-tight"
      >
        DIAGRAM<span className="text-teal-600">AI</span> SYNCING...
      </motion.p>
    </div>
  );
}
