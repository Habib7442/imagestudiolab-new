
import React, { useState } from 'react';
import { StudyDeck, QuizQuestion } from '../types';

interface QuizModeProps {
  deck: StudyDeck;
  onExit: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ deck, onExit }) => {
  const allQuestions = deck.diagrams.flatMap(d => 
    d.quizQuestions.map(q => ({ ...q, diagramUrl: d.imageUrl, concept: d.concept }))
  );
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQ = allQuestions[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQ.correctAnswer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIdx < allQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="text-7xl mb-6">🏆</div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 mb-8">You mastered {deck.title}</p>
        
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-8">
          <div className="text-5xl font-black text-indigo-600 mb-2">{Math.round((score / allQuestions.length) * 100)}%</div>
          <p className="text-slate-500 font-medium">Your Accuracy Score</p>
          <div className="mt-6 flex justify-center gap-8">
            <div className="text-center">
              <div className="text-xl font-bold text-green-500">{score}</div>
              <div className="text-xs text-slate-400">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-500">{allQuestions.length - score}</div>
              <div className="text-xs text-slate-400">Incorrect</div>
            </div>
          </div>
        </div>

        <button 
          onClick={onExit}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onExit} className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1">
          <span>←</span> Back to Library
        </button>
        <div className="px-4 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
          Question {currentIdx + 1} of {allQuestions.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col">
          <div className="bg-slate-50 p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{currentQ.concept}</h3>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <img src={currentQ.diagramUrl} alt="Study Diagram" className="max-w-full h-auto rounded-xl shadow-md" />
          </div>
          <div className="p-4 bg-indigo-50 text-[10px] text-indigo-700 text-center font-medium italic">
            Visual aid generated specifically for this medical concept.
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 leading-tight">{currentQ.question}</h2>
            
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-medium ${
                    isAnswered 
                      ? idx === currentQ.correctAnswer
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : selectedOption === idx
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-white border-slate-100 text-slate-400'
                      : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </div>
                </button>
              ))}
            </div>

            {isAnswered && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className={`p-4 rounded-2xl ${selectedOption === currentQ.correctAnswer ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <p className="text-xs font-bold uppercase mb-1">{selectedOption === currentQ.correctAnswer ? 'Correct!' : 'Keep Learning'}</p>
                  <p className="text-sm leading-relaxed">{currentQ.explanation}</p>
                </div>
                
                <button
                  onClick={handleNext}
                  className="w-full mt-6 py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  {currentIdx === allQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizMode;
