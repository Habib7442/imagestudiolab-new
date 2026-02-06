
import React, { useState, useEffect } from 'react';
import { AppState, StudyDeck } from './types';
import Layout from './components/Layout';
import DiagramGenerator from './components/DiagramGenerator';
import Library from './components/Library';
import QuizMode from './components/QuizMode';

const App: React.FC = () => {
  const [activeState, setActiveState] = useState<AppState>(AppState.DASHBOARD);
  const [decks, setDecks] = useState<StudyDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<StudyDeck | null>(null);

  // Load decks from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('diagram-ai-decks');
    if (saved) {
      try {
        setDecks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved decks");
      }
    }
  }, []);

  // Save decks to localStorage
  useEffect(() => {
    localStorage.setItem('diagram-ai-decks', JSON.stringify(decks));
  }, [decks]);

  const handleGenerationComplete = (newDeck: StudyDeck) => {
    setDecks(prev => [newDeck, ...prev]);
    setSelectedDeck(newDeck);
    setActiveState(AppState.STUDYING);
  };

  const handleSelectDeck = (deck: StudyDeck) => {
    setSelectedDeck(deck);
    setActiveState(AppState.STUDYING);
  };

  return (
    <Layout activeState={activeState} onNavigate={setActiveState}>
      {activeState === AppState.DASHBOARD && (
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center mb-16">
            <div className="flex-1">
              <h1 className="text-5xl font-black text-slate-900 leading-tight">
                Don't just read about anatomy. <br/>
                <span className="text-indigo-600">See it, study it, master it.</span>
              </h1>
              <p className="mt-6 text-xl text-slate-500 max-w-lg leading-relaxed">
                DiagramAI turns 150 hours of drawing and card-making into 2 minutes of automated AI magic.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button 
                  onClick={() => setActiveState(AppState.GENERATING)}
                  className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all transform hover:scale-105"
                >
                  Create Your First Deck
                </button>
                <button 
                  onClick={() => setActiveState(AppState.LIBRARY)}
                  className="px-10 py-5 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 text-slate-600 rounded-2xl font-bold transition-all"
                >
                  View Library
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
              <div className="relative bg-white p-4 rounded-[40px] shadow-2xl border border-white/50 rotate-3">
                <img 
                  src="https://picsum.photos/600/600?medical" 
                  alt="AI Diagram" 
                  className="rounded-[30px] w-full aspect-square object-cover shadow-inner"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 max-w-[200px] -rotate-6">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">New Generation</p>
                  <p className="text-xs font-bold text-slate-900">Left Ventricle Structure</p>
                  <div className="mt-2 flex gap-1">
                    <div className="h-1 flex-1 bg-green-500 rounded-full"></div>
                    <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
                    <div className="h-1 flex-1 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Recent Activity</h2>
            {decks.length > 0 ? (
              <Library decks={decks.slice(0, 3)} onSelectDeck={handleSelectDeck} />
            ) : (
              <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">No study activity yet. Generate your first diagram to see it here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeState === AppState.GENERATING && (
        <DiagramGenerator onComplete={handleGenerationComplete} />
      )}

      {activeState === AppState.LIBRARY && (
        <Library decks={decks} onSelectDeck={handleSelectDeck} />
      )}

      {activeState === AppState.STUDYING && selectedDeck && (
        <QuizMode deck={selectedDeck} onExit={() => setActiveState(AppState.LIBRARY)} />
      )}
    </Layout>
  );
};

export default App;
