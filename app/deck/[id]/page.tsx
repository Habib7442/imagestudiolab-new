"use client";

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  BrainCircuit, 
  Dna, 
  Lock, 
  ChevronLeft,
  Check,
  X as XIcon,
  RotateCcw,
  Trophy,
  BookOpen,
  Zap,
  Microscope,
  FileText,
  Sparkles,
  Layout as LayoutIcon,
  ImageIcon,
  ChevronRight,
  ClipboardCheck,
  X
} from 'lucide-react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import ReactMarkdown from 'react-markdown';

export default function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deck, setDeck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const fetchDeck = async () => {
      const { data } = await supabase
        .from('generations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) setDeck(data);
      setLoading(false);
    };

    fetchDeck();

    // Real-time subscription for "streaming" updates
    const channel = supabase
      .channel(`deck_streaming_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generations',
          filter: `id=eq.${id}`
        },
        (payload) => {
          setDeck(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (deck.quiz_data?.[currentQuestion]?.correctAnswer !== undefined && index === deck.quiz_data[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (deck.quiz_data && currentQuestion < deck.quiz_data.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowScore(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowScore(false);
  };

  if (loading || !deck) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
      <div className="absolute inset-0">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 blur-[100px] animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[100px] animate-pulse delay-700" />
      </div>
      <div className="relative flex flex-col items-center gap-10">
        <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-8 border-white/5 rounded-[2.5rem] rotate-45" />
            <motion.div 
              className="absolute inset-0 border-8 border-t-teal-500 rounded-[2.5rem] rotate-45"
              animate={{ rotate: 405 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-teal-500">
                <BrainCircuit className="w-12 h-12" />
            </div>
        </div>
        <div className="text-center">
            <h2 className="text-2xl font-outfit font-black text-white mb-2 uppercase tracking-tight">Locating Your Deck</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Syncing with AI Cluster...</p>
        </div>
      </div>
    </div>
  );

  if (deck?.status === 'failed') return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
       <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
             <XIcon className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-outfit font-black text-slate-900 mb-4">Generation Failed</h1>
          <p className="text-slate-500 mb-8 font-medium">{deck.error_message || "We encountered an unexpected error while illustrating your deck."}</p>
          <Link href="/" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold inline-block">Try Again</Link>
       </div>
    </div>
  )

  if (!deck) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-black text-slate-800 mb-4">DECK NOT FOUND</h1>
        <Link href="/" className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs">Back to Home</Link>
      </div>
    </div>
  );

  // Safety check for quiz_data
  const hasQuizData = deck.quiz_data && Array.isArray(deck.quiz_data) && deck.quiz_data.length > 0;
  const currentQuiz = hasQuizData ? deck.quiz_data[currentQuestion] : null;
  const allImages = Array.from(new Set([
    ...(deck.diagram_urls || []), 
    deck.diagram_url, 
    deck.infographic_image_url
  ])).filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 pb-24 font-outfit">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-600 transition-colors font-black text-[10px] uppercase tracking-[0.2em] group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Library
          </Link>
          <div className="flex items-center gap-3">
             {deck.status === 'completed' ? (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                  <BookOpen className="w-3 h-3" /> Ready for Review
                </div>
             ) : (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100 shadow-sm animate-pulse">
                  <Zap className="w-3 h-3" /> Live Generating...
                </div>
             )}
          </div>
        </div>

        <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1] mb-6 tracking-tight">
                {deck.title || (
                    <div className="h-20 w-3/4 bg-slate-200 animate-pulse rounded-3xl" />
                )}
            </h1>
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(deck.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'})}</span>
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                    {deck.concepts?.length || 'Analyzing'} Key Concepts
                </span>
                {deck.status === 'processing' && (
                  <>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                      {deck.error_message || 'AI STATUS: THINKING...'}
                    </span>
                  </>
                )}
            </div>
        </div>

        {/* 1. Visual Illustration Panel (Full Width) */}
        <div className="mb-12">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-teal-100">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs">Knowledge visualization</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Concept Overview</p>
                        </div>
                    </div>
                    <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-teal-400 transition-all text-xs font-bold text-slate-600 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download
                    </button>
                </div>

                <div className="p-12 flex items-center justify-center bg-white min-h-[500px]">
                    {allImages.length > 0 ? (
                        <img 
                            src={allImages[0]} 
                            className="max-w-full max-h-[600px] object-contain drop-shadow-2xl rounded-2xl"
                            alt="Primary Clinical Visual" 
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-8 text-slate-300 py-20">
                            <div className="relative">
                               <ImageIcon className="w-20 h-20 opacity-10" />
                               <motion.div 
                                 animate={{ rotate: 360 }}
                                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                 className="absolute -inset-4 border-2 border-dashed border-teal-500/20 rounded-full"
                               />
                            </div>
                            <div className="text-center">
                                <p className="font-black uppercase tracking-[0.2em] text-[10px] text-teal-600 mb-2">Rendering 3D Illustration</p>
                                <p className="text-[9px] text-slate-400 font-bold max-w-[200px] leading-relaxed">AI is currently illustrating the main deck visual...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* 2. Quiz Interface (Horizontal Layout, Non-Sticky) */}
        <div className="mb-12">
            <div className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-md">
                            <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <h2 className="font-black text-white uppercase tracking-widest text-xs">Knowledge Challenge</h2>
                    </div>
                    {deck.quiz_data?.length > 0 && (
                        <div className="px-4 py-1.5 bg-slate-800 rounded-xl text-[10px] font-black text-slate-500 border border-white/5 uppercase">
                            Question {currentQuestion + 1} of {deck.quiz_data?.length || 0}
                        </div>
                    )}
                </div>

                <div className="p-10 md:p-16">
                    {deck.quiz_data?.length > 0 ? (
                      <AnimatePresence mode="wait">
                        {!showScore ? (
                            <motion.div 
                                key={currentQuestion}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                            >
                                <div className="grid lg:grid-cols-2 gap-12">
                                    {/* Question Side */}
                                    <div>
                                        <div className="p-4 bg-teal-500/10 border-l-4 border-teal-500 text-teal-100 rounded-r-2xl mb-8">
                                            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-teal-400">Concept Application</p>
                                            <h3 className="text-xl md:text-2xl font-bold leading-relaxed">{currentQuiz.question}</h3>
                                        </div>

                                        {isAnswered && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="bg-white/5 border border-white/5 rounded-3xl p-8"
                                            >
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Expert Explanation</p>
                                                <p className="text-slate-300 text-sm leading-relaxed mb-6">{currentQuiz.explanation}</p>
                                                
                                                {(currentQuiz.key_takeaway || currentQuiz.clinical_pearl) && (
                                                    <div className="pt-6 border-t border-white/10 flex gap-4">
                                                        <Sparkles className="w-6 h-6 text-teal-400 shrink-0" />
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-1">Key Takeaway</p>
                                                            <p className="text-white text-base font-black italic">{currentQuiz.key_takeaway || currentQuiz.clinical_pearl}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Options Side */}
                                    <div className="flex flex-col gap-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Select the most appropriate answer</p>
                                        {currentQuiz.options.map((opt: string, i: number) => {
                                            const isSelected = selectedOption === i;
                                            const isCorrect = i === currentQuiz.correctAnswer;
                                            
                                            return (
                                                <button 
                                                    key={i}
                                                    disabled={isAnswered}
                                                    onClick={() => handleOptionSelect(i)}
                                                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all font-bold flex items-center justify-between group
                                                        ${!isAnswered ? 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-teal-500 hover:scale-[1.01]' : ''}
                                                        ${isSelected && isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : ''}
                                                        ${isSelected && !isCorrect ? 'bg-rose-500/20 border-rose-500 text-rose-400' : ''}
                                                        ${isAnswered && isCorrect && !isSelected ? 'border-emerald-500/50 text-emerald-400' : ''}
                                                        ${isAnswered && !isSelected && !isCorrect ? 'opacity-20 grayscale border-transparent text-slate-500' : ''}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-5">
                                                        <span className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xs transition-colors ${isSelected ? 'border-current' : 'border-slate-700'}`}>
                                                            {String.fromCharCode(65 + i)}
                                                        </span>
                                                        <span className="text-base leading-snug">{opt}</span>
                                                    </div>
                                                    {isAnswered && isCorrect && <Check className="w-5 h-5" />}
                                                    {isAnswered && isSelected && !isCorrect && <XIcon className="w-5 h-5" />}
                                                </button>
                                            );
                                        })}

                                        {isAnswered && (
                                            <button 
                                                onClick={nextQuestion}
                                                className="mt-8 w-full py-5 bg-teal-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:shadow-2xl transition-all flex items-center justify-center gap-3 group"
                                            >
                                                {currentQuestion === (deck.quiz_data?.length || 1) - 1 ? 'View Results' : 'Next Scenario'}
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-20 text-center max-w-lg mx-auto">
                                <div className="w-24 h-24 bg-teal-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-12 shadow-2xl">
                                    <Trophy className="w-12 h-12" />
                                </div>
                                <h2 className="text-4xl font-black text-white mb-2">Quiz Results</h2>
                                <div className="text-6xl font-black text-teal-400 mb-6">{Math.round((score/(deck.quiz_data?.length || 1))*100)}%</div>
                                <p className="text-slate-500 font-bold mb-10">Subject Mastery Proficiency</p>
                                <button onClick={resetQuiz} className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                                    <RotateCcw className="w-4 h-4" /> Retake Quiz
                                </button>
                            </div>
                        )}
                      </AnimatePresence>
                    ) : (
                        <div className="py-20 flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 relative overflow-hidden">
                                <Zap className="w-8 h-8 text-indigo-400" />
                                <motion.div 
                                    animate={{ left: ['-100%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full"
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">AI Questioning Engine</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Designing smart MCQs for this deck...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* 3. Infographic Panel (Full Width) */}
        <div className="mb-12">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 md:p-16">
                <div className="flex items-center gap-4 mb-12 pb-8 border-b border-slate-50">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">Visual Summary & Study Guide</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Expertly Curated Summary</p>
                    </div>
                </div>
                
                {deck.infographic_data ? (
                  <>
                    {deck.infographic_image_url && (
                        <div className="mb-12 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
                            <img src={deck.infographic_image_url} className="w-full h-auto" alt="Infographic Plot" />
                        </div>
                    )}
                    <div className="prose prose-lg prose-slate max-w-none text-slate-600 font-medium leading-[1.8] prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight">
                        <ReactMarkdown>{deck.infographic_data}</ReactMarkdown>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-8">
                     <div className="w-full h-96 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center text-slate-300">
                        <div className="text-center">
                           <LayoutIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                           <p className="font-black text-[10px] uppercase tracking-widest">Layout Engine: Compiling Infographic...</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="w-1/3 h-8 bg-slate-100 rounded-full animate-pulse" />
                        <div className="w-full h-4 bg-slate-100 rounded-full animate-pulse" />
                        <div className="w-full h-4 bg-slate-100 rounded-full animate-pulse" />
                        <div className="w-2/3 h-4 bg-slate-100 rounded-full animate-pulse" />
                     </div>
                  </div>
                )}
            </div>
        </div>

        {/* 4. Core Concepts Grid (Horizontal Bottom) */}
        <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] -mr-48 -mt-48" />
            
            <div className="relative mb-20">
                <h2 className="text-4xl md:text-5xl font-black mb-4">Core Mastery Points</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Essential Insights & Principles</p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                {(deck.concepts || Array(6).fill({ concept: 'loading', description: 'AI is currently extracting this concept from your document...' })).map((concept: any, i: number) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        key={i} 
                        className={`p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group overflow-hidden flex flex-col ${concept.concept === 'loading' ? 'animate-pulse' : ''}`}
                    >
                        <div className="relative aspect-square mb-8 rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center border border-white/5">
                            {concept.image_url ? (
                                <img 
                                    src={concept.image_url} 
                                    alt={concept.concept}
                                    className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105 duration-700 cursor-zoom-in"
                                    onClick={() => setFullscreenImage(concept.image_url)}
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                   <ImageIcon className="w-8 h-8 text-slate-700 opacity-50" />
                                   {concept.concept !== 'loading' && (
                                     <span className="text-[8px] font-black uppercase text-teal-500/50">Rendering...</span>
                                   )}
                                </div>
                            )}
                            <div className="absolute top-4 left-4 w-8 h-8 bg-black/40 backdrop-blur-md rounded-lg flex items-center justify-center text-xs font-black text-white border border-white/10">
                                0{i+1}
                            </div>
                        </div>

                        <h4 className="text-xl font-black mb-4 text-white group-hover:text-teal-400 transition-colors">
                            {concept.concept === 'loading' ? 'Generating Concept...' : concept.concept}
                        </h4>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium flex-grow">
                            {concept.description}
                        </p>
                        {(concept.significance || concept.depth) && (
                             <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-[10px] text-indigo-200 italic font-bold mt-auto">
                                Mastery Point: "{concept.significance || concept.depth}"
                             </div>
                        )}
                        {concept.concept === 'loading' && (
                          <div className="mt-auto h-10 w-full bg-white/5 rounded-2xl" />
                        )}
                    </motion.div>
                ))}
            </div>
            
            <div className="relative flex flex-wrap gap-4 items-center justify-center pt-10 border-t border-white/5">
                 <div className="group relative">
                    <button className="px-12 py-5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-full border-none font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl shadow-teal-500/20 active:scale-95">
                        Download Pro PDF
                    </button>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        Coming Soon (V2)
                    </div>
                 </div>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
            onClick={() => setFullscreenImage(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                <X className="w-10 h-10" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={fullscreenImage}
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
