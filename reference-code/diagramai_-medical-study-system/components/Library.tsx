
import React from 'react';
import { StudyDeck } from '../types';

interface LibraryProps {
  decks: StudyDeck[];
  onSelectDeck: (deck: StudyDeck) => void;
}

const Library: React.FC<LibraryProps> = ({ decks, onSelectDeck }) => {
  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-6">🏜️</div>
        <h2 className="text-2xl font-bold text-slate-900">Your Library is Empty</h2>
        <p className="text-slate-500 mt-2 max-w-sm">Start by creating your first diagram-based study deck from your lecture notes.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Study Decks</h1>
          <p className="text-slate-500">Manage and study your generated medical content.</p>
        </div>
        <div className="flex gap-2">
          <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none">
            <option>All Topics</option>
            <option>Anatomy</option>
            <option>Physiology</option>
            <option>Biochemistry</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <div 
            key={deck.id}
            onClick={() => onSelectDeck(deck)}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
          >
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
              <img 
                src={deck.diagrams[0]?.imageUrl || 'https://picsum.photos/400/225'} 
                alt={deck.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block px-2 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded uppercase mb-1">
                  {deck.tag}
                </span>
                <h3 className="text-white font-bold leading-tight line-clamp-2">{deck.title}</h3>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-1">
                  <span>🖼️</span>
                  <span>{deck.diagrams.length} Diagrams</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{new Date(deck.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors">
                  Study Now
                </button>
                <button 
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Anki export started! Your .apkg file will be ready in a moment.');
                  }}
                >
                  📥
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
