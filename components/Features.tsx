"use client";

import { motion } from 'framer-motion';
import { 
  Microscope, 
  Stethoscope, 
  BookOpen, 
  Download, 
  Share2, 
  Smartphone 
} from 'lucide-react';

const features = [
  {
    title: "Visual Concepts",
    description: "Textbook-quality illustrations for any scientific, technical, or complex subject.",
    icon: Stethoscope,
    color: "teal"
  },
  {
    title: "Structured Breakdowns",
    description: "Visual mapping of complex processes or systems for instant clarity and retention.",
    icon: Microscope,
    color: "indigo"
  },
  {
    title: "Exam Mastery",
    description: "AI extracts high-yield concepts tailored to your specific curriculum and academic goals.",
    icon: BookOpen,
    color: "purple"
  },
  {
    title: "Pro PDF Exports",
    description: "Download beautiful, high-resolution study guides and diagrams as professional PDFs.",
    icon: Download,
    color: "pink"
  }
];

export default function Features() {
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-outfit font-black text-slate-900 mb-4">Master Your Subject Visually</h2>
          <p className="text-slate-500 max-w-xl mx-auto italic">"Because re-reading notes 20 times to memorize them is a thing of the past."</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
             <motion.div 
               key={i}
               whileHover={{ y: -8 }}
               className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
             >
               <div className={`w-12 h-12 rounded-2xl bg-${f.color}-50 flex items-center justify-center text-${f.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                 <f.icon className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
               <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
               
               <div className={`absolute bottom-0 right-0 w-24 h-24 bg-${f.color}-500/5 rounded-tl-[4rem] group-hover:scale-150 transition-transform duration-700`} />
             </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
