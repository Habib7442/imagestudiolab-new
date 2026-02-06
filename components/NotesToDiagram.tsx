"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  FilePart,
  TargetLevel
} from '@/lib/types';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Zap, 
  Paperclip,
  X,
  Clock,
  Activity,
  Brain,
  Layers,
  CheckCircle2,
  Layout,
  School,
  Cog,
  Stethoscope,
  ChevronDown
} from 'lucide-react';

const TARGET_OPTIONS: { label: string, value: TargetLevel, icon: any }[] = [
  // School
  { label: 'Class 9', value: 'class_9', icon: <School className="w-4 h-4" /> },
  { label: 'Class 10', value: 'class_10', icon: <School className="w-4 h-4" /> },
  { label: 'Class 11', value: 'class_11', icon: <School className="w-4 h-4" /> },
  { label: 'Class 12', value: 'class_12', icon: <School className="w-4 h-4" /> },
  // Engineering
  { label: 'Eng: CS/IT', value: 'eng_cs', icon: <Cog className="w-4 h-4" /> },
  { label: 'Eng: Mechanical', value: 'eng_mech', icon: <Cog className="w-4 h-4" /> },
  { label: 'Eng: Civil', value: 'eng_civil', icon: <Cog className="w-4 h-4" /> },
  { label: 'Eng: Electrical', value: 'eng_elec', icon: <Cog className="w-4 h-4" /> },
  { label: 'Eng: Chemical', value: 'eng_chem', icon: <Cog className="w-4 h-4" /> },
  // Medical
  { label: 'Med: MBBS/MD', value: 'med_mbbs', icon: <Stethoscope className="w-4 h-4" /> },
  { label: 'Med: Nursing', value: 'med_nursing', icon: <Stethoscope className="w-4 h-4" /> },
  { label: 'Med: Dental', value: 'med_dental', icon: <Stethoscope className="w-4 h-4" /> },
  { label: 'Med: Pharmacy', value: 'med_pharmacy', icon: <Stethoscope className="w-4 h-4" /> },
];

export default function NotesToDiagram() {
  const [notes, setNotes] = useState('');
  const [targetLevel, setTargetLevel] = useState<TargetLevel>('class_12');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchCredits(user.id);
    });
  }, []);

  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('users').select('credits').eq('id', userId).single();
    if (data) setCredits(data.credits);
  };

  const deductCredit = async () => {
    if (!user) return true; 
    if (credits <= 0) return false;

    const { error } = await supabase
      .from('users')
      .update({ credits: credits - 1 })
      .eq('id', user.id);
    
    if (error) return false;
    setCredits(prev => prev - 1);
    return true;
  };

  const refundCredit = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('users')
      .update({ credits: credits }) // Restoring to original value held in state before deduction
      .eq('id', user.id);
    
    if (!error) {
       // Since the local 'credits' state was already decremented by 1 in deductCredit, 
       // we fetch the latest or just increment it back if we have the state.
       // Actually, the state 'credits' was the value BEFORE deduction. 
       // If deductCredit happens: state is decremented.
       // So refund should increment it back.
       setCredits(prev => prev + 1);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!notes.trim() && !selectedFile) return;
    setLoading(true);
    setLoadingStep('Initializing AI Engine...');

    try {
      let fileUrl = '';
      if (selectedFile) {
        setLoadingStep('Uploading documents...');
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user?.id || 'anon'}_${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('study-notes')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;
        fileUrl = filePath;
      }

      // 1. Call Secure API Route
      const response = await fetch('/api/deck/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes,
          targetLevel,
          userId: user?.id,
          fileUrl,
          fileName: selectedFile?.name,
          fileType: selectedFile?.type
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to start generation');

      // Instant Redirect: Don't wait, let the deck page handle the "streaming" view
      router.push(`/deck/${resData.generationId}`);

    } catch (error: any) {
      console.error("GENERATION TRIGGER ERROR:", error);
      alert(`Could not start generation: ${error?.message || 'Unknown error'}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-16">
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-start py-8 md:py-20 px-6 overflow-y-auto"
          >
            <div className="max-w-md w-full text-center mt-12 md:mt-0">
              <div className="relative w-40 h-40 mx-auto mb-10">
                <div className="absolute inset-0 border-8 border-teal-50 rounded-[2.5rem] rotate-45" />
                <motion.div 
                  className="absolute inset-0 border-8 border-t-teal-600 rounded-[2.5rem]"
                  animate={{ rotate: 405 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-teal-600">
                  <Activity className="w-16 h-16 animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-4xl font-outfit font-black text-slate-900 mb-2">Creating Study Deck</h2>
              <div className="flex items-center justify-center gap-2 text-slate-500 font-bold mb-10 bg-slate-50 w-fit mx-auto px-4 py-2 rounded-full border border-slate-100">
                <Clock className="w-4 h-4 text-teal-500" />
                <span>Elapsed: {elapsedTime}s</span>
              </div>

              <div className="space-y-3 text-left bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                {[
                  { step: 'Analyzing core concepts...', icon: <Zap className="w-4 h-4" /> },
                  { step: 'Rendering high-fidelity illustrations...', icon: <Layers className="w-4 h-4" /> },
                  { step: 'Creating smart exam-style questions...', icon: <CheckCircle2 className="w-4 h-4" /> },
                  { step: 'Compiling visual summary & infographic...', icon: <Layout className="w-4 h-4" /> }
                ].map((s, i) => {
                  const isActive = loadingStep.includes(s.step.substring(0, 10));
                  
                  return (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-teal-50 border border-teal-100 text-teal-900 scale-[1.02]' : 'opacity-30 grayscale'}`}>
                      <div className={`p-2 rounded-xl ${isActive ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {s.icon}
                      </div>
                      <span className="text-sm font-black uppercase tracking-tight">{s.step}</span>
                      {isActive && <motion.div className="ml-auto flex gap-1" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity }}>
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                      </motion.div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-bold border border-teal-100 mb-6">
          <Sparkles className="w-4 h-4" />
          Powered by Gemini 3 Flash & Pro
        </div>
        <h1 className="text-5xl md:text-7xl font-outfit font-black tracking-tight mb-6 leading-[1.1]">
          Convert Notes into <br />
          <span className="gradient-text">Visual Masterpieces</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
          Professional illustrations, smart quizzes, and infographics <br className="hidden md:block" />
          generated specifically for your curriculum.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative group max-w-4xl mx-auto"
      >
        <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-1 md:p-2">
            <div className="bg-slate-50/50 rounded-[2rem] p-8">
              
              {/* Target Level Selector */}
              <div className="relative mb-8">
                <button 
                  onClick={() => setShowLevelSelector(!showLevelSelector)}
                  className="flex items-center gap-4 px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group w-full md:w-auto"
                >
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    {TARGET_OPTIONS.find(o => o.value === targetLevel)?.icon}
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Target Level</p>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {TARGET_OPTIONS.find(o => o.value === targetLevel)?.label}
                    </p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-300 transition-transform ${showLevelSelector ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showLevelSelector && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-3 w-full md:w-[450px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {TARGET_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setTargetLevel(opt.value);
                              setShowLevelSelector(false);
                            }}
                            className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${targetLevel === opt.value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-50 text-slate-600'}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${targetLevel === opt.value ? 'bg-white/20' : 'bg-slate-100'}`}>
                              {opt.icon}
                            </div>
                            <span className="text-xs font-black uppercase tracking-tight">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <textarea
                className="w-full h-48 md:h-64 bg-transparent border-none focus:ring-0 text-slate-800 text-xl font-medium placeholder:text-slate-300 resize-none p-2 mb-6"
                placeholder="Paste your study notes, research papers, or complex topics here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <AnimatePresence>
                {selectedFile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-8 flex items-center gap-5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm"
                  >
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="flex-grow overflow-hidden text-left">
                      <p className="font-black text-slate-900 text-base truncate">{selectedFile.name}</p>
                      <p className="text-xs font-bold text-slate-400">PDF Document • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                      onClick={() => setSelectedFile(null)}
                      className="p-3 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-2xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-t border-slate-200/50 pt-8">
                <div className="flex flex-wrap items-center gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="application/pdf,image/*" 
                    onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) setSelectedFile(file);
                    }} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-200 hover:border-teal-400 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-teal-50/30"
                  >
                    <Paperclip className="w-4 h-4 text-teal-500" />
                    Attach Scan / PDF
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    <Zap className="w-4 h-4 text-amber-500" />
                    1 Generation
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={loading || (!notes.trim() && !selectedFile)}
                    className={`group relative overflow-hidden px-12 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] transition-all w-full md:w-auto ${loading ? 'opacity-70' : ''}`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Generate Deck
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
