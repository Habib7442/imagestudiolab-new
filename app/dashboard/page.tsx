"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { 
  FileText, 
  ChevronRight, 
  Trash2, 
  Clock,
  LayoutGrid,
  Search,
  BookOpen,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchGenerations(user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchGenerations = async (userId: string) => {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setGenerations(data);
    setLoading(false);
  };

  const deleteGeneration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this study deck? It will be permanently removed.")) return;
    
    // Optimistic UI update
    const previousGenerations = [...generations];
    setGenerations(prev => prev.filter(g => g.id !== id));

    try {
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("DELETE ERROR:", error);
        alert(`Failed to delete: ${error.message}`);
        setGenerations(previousGenerations); // Rollback
      }
    } catch (err) {
      console.error("UNEXPECTED DELETE ERROR:", err);
      setGenerations(previousGenerations); // Rollback
    }
  };

  const filteredGenerations = generations.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <p className="font-outfit font-bold text-slate-400">Loading your library...</p>
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
          <BookOpen className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-outfit font-black text-slate-900 mb-4">Your Study Library</h1>
        <p className="text-slate-500 mb-8 font-medium">Please sign in to save and manage your AI-generated study decks across devices.</p>
        <button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:shadow-2xl transition-all"
        >
          Sign In to Access Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-outfit font-black text-slate-900 mb-2">My Study Decks</h1>
            <p className="text-slate-500 font-medium">Manage and review your {generations.length} generated collections.</p>
          </div>
          <Link 
            href="/" 
            className="px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all flex items-center gap-2"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            Create New Deck
          </Link>
        </header>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search your decks..." 
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-teal-500 border-none transition-all font-medium text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredGenerations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGenerations.map((g, i) => (
              <motion.div 
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group hover:border-teal-200 transition-all"
              >
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img 
                    src={g.diagram_url || '/placeholder-diagram.png'} 
                    alt={g.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation();
                        deleteGeneration(g.id); 
                      }}
                      className="p-2.5 bg-white/95 text-rose-600 rounded-xl shadow-xl hover:bg-rose-600 hover:text-white transition-all transform hover:scale-110 active:scale-95 group/btn"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <Link href={`/deck/${g.id}`} className="p-6 block">
                  <div className="flex items-center justify-between mb-3">
                    <div className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest">
                      {g.concepts?.length || 0} CONCEPTS
                    </div>
                    {g.status && g.status !== 'completed' && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <Zap className="w-3 h-3" />
                        {g.status}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-1 group-hover:text-teal-600 transition-colors">{g.title}</h3>
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-tight">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(g.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 text-teal-600">
                      {g.status === 'failed' ? 'Error' : g.status === 'completed' || !g.status ? 'Open' : 'Processing'} <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <LayoutGrid className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">No decks found</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Start by generating your first medical study deck from notes or PDFs.</p>
            <Link 
              href="/" 
              className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all inline-block"
            >
              Go to Generator
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}
