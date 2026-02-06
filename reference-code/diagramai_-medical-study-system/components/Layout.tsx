
import React from 'react';
import { AppState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeState: AppState;
  onNavigate: (state: AppState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeState, onNavigate }) => {
  const navItems = [
    { id: AppState.DASHBOARD, label: 'Home', icon: '🏠' },
    { id: AppState.LIBRARY, label: 'My Decks', icon: '📚' },
    { id: AppState.GENERATING, label: 'Create New', icon: '✨' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <span className="text-2xl">🧠</span>
            <span>DiagramAI</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Medical Study System</p>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeState === item.id 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <p className="text-xs font-semibold opacity-90 uppercase tracking-wide">Pro Status</p>
            <p className="text-sm font-bold mt-1">Unlimited Diagrams</p>
            <button className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold py-2 px-3 rounded-lg backdrop-blur-sm transition-all">
              Manage Billing
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Mobile */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-indigo-600">
            <span>🧠 DiagramAI</span>
          </div>
          <button className="text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
