"use client";

import { motion } from "framer-motion";
import { Zap, Layers, ShieldCheck, Wand2, Smartphone, Globe } from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI-Powered Magic",
    desc: "Generate professional photoshoots in seconds using state-of-the-art AI models."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Get your results instantly. No more waiting for days to get your edits back from a designer."
  },
  {
    icon: Layers,
    title: "Infinite Styles",
    desc: "Choose from hundreds of curated styles or create your own unique look with custom prompts."
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    desc: "Designed for creators on the go. Create stunning content directly from your phone."
  },
  {
    icon: ShieldCheck,
    title: "Privacy Focused",
    desc: "Your photos are yours. We prioritize your privacy and security at every step."
  },
  {
    icon: Globe,
    title: "Global Community",
    desc: "Join thousands of creators worldwide sharing their creations on the Nano Banana Wall."
  }
];

const FeatureCard = ({ icon: Icon, title, desc, index }: { icon: any, title: string, desc: string, index: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-white/10 transition-colors"
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="mb-6 text-white p-3 bg-white/5 rounded-xl inline-block group-hover:bg-fuchsia-500/10 group-hover:text-fuchsia-400 transition-colors duration-300">
      <Icon size={24} />
    </div>
    
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
      {desc}
    </p>
  </motion.div>
);

export default function Features() {
  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-bold mb-6"
        >
          Why Creators Love <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">ImageStudioLab</span>
        </motion.h2>
        <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
          Everything you need to create viral content, all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
}
