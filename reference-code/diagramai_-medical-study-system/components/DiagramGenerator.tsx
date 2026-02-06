
import React, { useState, useRef } from 'react';
import { extractMedicalConcepts, generateMedicalDiagram, generateQuizForConcept, ensureApiKey, FilePart } from '../services/geminiService';
import { StudyDeck, DiagramData } from '../types';

interface DiagramGeneratorProps {
  onComplete: (deck: StudyDeck) => void;
}

const DiagramGenerator: React.FC<DiagramGeneratorProps> = ({ onComplete }) => {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'processing'>('input');
  const [currentTask, setCurrentTask] = useState('');
  const [progress, setProgress] = useState(0);
  const [attachedPdf, setAttachedPdf] = useState<{ name: string, data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setAttachedPdf({ name: file.name, data: base64Data });
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert('Please upload a PDF file.');
    }
  };

  const removePdf = () => {
    setAttachedPdf(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!notes.trim() && !attachedPdf) return;

    await ensureApiKey();
    setIsProcessing(true);
    setStep('processing');
    setProgress(5);

    try {
      const pdfPart: FilePart | undefined = attachedPdf ? {
        inlineData: {
          data: attachedPdf.data,
          mimeType: 'application/pdf'
        }
      } : undefined;

      setCurrentTask('Analyzing lecture materials...');
      const { concepts, deckTitle } = await extractMedicalConcepts(notes, pdfPart);
      setProgress(20);

      const diagrams: DiagramData[] = [];
      
      for (let i = 0; i < concepts.length; i++) {
        const concept = concepts[i];
        setCurrentTask(`Generating high-yield diagram for: ${concept}...`);
        
        const imageUrl = await generateMedicalDiagram(concept);
        setProgress(20 + ((i + 1) / concepts.length) * 40);

        setCurrentTask(`Building active recall quiz for: ${concept}...`);
        const quizQuestions = await generateQuizForConcept(concept, notes, pdfPart);
        
        diagrams.push({
          id: Math.random().toString(36).substr(2, 9),
          concept,
          imageUrl,
          description: `Comprehensive study aid for ${concept} based on your provided notes.`,
          labels: [], 
          quizQuestions,
          createdAt: Date.now()
        });
      }

      setCurrentTask('Assembling your study deck...');
      setProgress(100);

      const newDeck: StudyDeck = {
        id: Math.random().toString(36).substr(2, 9),
        title: deckTitle || 'New Medical Deck',
        description: `Generated from lecture materials. Topics: ${concepts.join(', ')}`,
        tag: 'First Year MBBS',
        diagrams,
        createdAt: Date.now()
      };

      setTimeout(() => onComplete(newDeck), 1000);
    } catch (error) {
      console.error(error);
      alert('Something went wrong during generation. Please check your API key and notes.');
      setIsProcessing(false);
      setStep('input');
    }
  };

  if (step === 'processing') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            {progress < 40 ? '🔍' : progress < 80 ? '🎨' : '🧠'}
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Creating Your Study System</h2>
        <p className="text-slate-500 mb-8">{currentTask}</p>
        
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
          <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between text-xs font-medium text-slate-400">
          <span>AI is thinking...</span>
          <span>{progress}% Complete</span>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className={`p-4 rounded-xl border ${progress > 15 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
            <span className="block text-xl mb-2">✅</span>
            <p className="text-xs font-bold text-slate-900">Content Extraction</p>
            <p className="text-[10px] text-slate-500 mt-1">Gemini Pro identifies high-yield exam topics.</p>
          </div>
          <div className={`p-4 rounded-xl border ${progress > 60 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
            <span className="block text-xl mb-2">{progress > 60 ? '✅' : '⏳'}</span>
            <p className="text-xs font-bold text-slate-900">Medical Diagrams</p>
            <p className="text-[10px] text-slate-500 mt-1">Custom labeled diagrams for consistent visualization.</p>
          </div>
          <div className={`p-4 rounded-xl border ${progress > 90 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
            <span className="block text-xl mb-2">{progress > 90 ? '✅' : '⏳'}</span>
            <p className="text-xs font-bold text-slate-900">Anki Decks & Quizzes</p>
            <p className="text-[10px] text-slate-500 mt-1">Automatic flashcards for active recall study.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Convert Materials into Mastery</h1>
        <p className="mt-4 text-lg text-slate-600">Paste textbook excerpts or upload a PDF. We'll build your complete study workflow.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Study Materials</label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 text-sm font-bold hover:text-indigo-700 transition-colors flex items-center gap-1"
              >
                <span>📎</span>
                Attach PDF
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="application/pdf"
              />
            </div>

            <textarea
              className={`w-full ${attachedPdf ? 'h-48' : 'h-64'} p-6 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none text-slate-800 placeholder-slate-400 leading-relaxed`}
              placeholder="Example: The heart is a muscular organ in most animals, which pumps blood... (Paste notes or upload PDF)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>

            {attachedPdf && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{attachedPdf.name}</p>
                    <p className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">PDF Attached</p>
                  </div>
                </div>
                <button 
                  onClick={removePdf}
                  className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-500 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-slate-500 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://picsum.photos/32/32?random=${i}`} alt="user" />
                ))}
              </div>
              <p>Trusted by <span className="font-bold text-indigo-600">2,400+</span> medical students</p>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={(!notes.trim() && !attachedPdf) || isProcessing}
              className={`w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>✨</span>
              Generate Study System
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: '⏱️', title: 'Save 150+ Hours', text: 'Auto-generates what usually takes weeks of drawing.' },
          { icon: '🎴', title: 'Anki-Ready', text: 'One-click export to Anki for spaced repetition.' },
          { icon: '🩺', title: 'High Yield', text: 'Focuses on concepts most likely to appear in exams.' },
          { icon: '📄', title: 'PDF Support', text: 'Works with lecture slides and textbook chapters.' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiagramGenerator;
