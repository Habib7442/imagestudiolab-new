"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const items = [
  {
    id: 1,
    src: "/our-generations/1.png",
    className: "md:col-span-2 md:row-span-2", // Big feature
  },
  {
    id: 2,
    src: "/our-generations/2.png",
    className: "md:col-span-1 md:row-span-2", // Tall
  },
  {
    id: 3,
    src: "/our-generations/3.png",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: 4,
    src: "/our-generations/4.png",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    id: 5,
    src: "/our-generations/5.png",
    className: "md:col-span-1 md:row-span-1", 
  },
  {
    id: 6,
    src: "/our-generations/6.png",
    className: "md:col-span-2 md:row-span-1", // Wide
  },
  {
    id: 7,
    src: "/our-generations/7.png",
    className: "md:col-span-3 md:row-span-2", // Ultra Wide Feature
  },
];

export default function OurGenerations() {
  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
      <div className="mb-16 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <span className="px-3 py-1 text-xs font-bold bg-white text-black rounded-full mr-2">Gallery</span>
          <span className="text-xs text-neutral-300 pr-2">Made with ImageStudioLab</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent"
        >
          Our Generations
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="text-neutral-400 max-w-2xl mx-auto text-lg"
        >
          A showcase of stunning visuals created by our community using our advanced AI tools.
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px]">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className={cn(
              "relative rounded-2xl overflow-hidden group border border-white/10 bg-[#111] shadow-2xl",
              item.className
            )}
          >
            <img 
              src={item.src} 
              alt={`Generation ${item.id}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            
            <div className="absolute bottom-4 left-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
                <span className="text-xs font-medium text-white">Generated with AI</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
