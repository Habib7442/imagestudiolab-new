"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCredits(session.user.id);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchCredits(user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();
    
    if (data) setCredits(data.credits);
  };

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCredits(null);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5 group">
        <img src="/logo.png" alt="Logo" className="w-9 h-9 group-hover:rotate-12 transition-transform" />
        <span className="font-outfit font-black text-xl tracking-tight hidden sm:inline-block text-slate-900">
          ImageStudio<span className="text-teal-600">Lab</span>
        </span>
      </Link>

      <div className="flex items-center gap-4 lg:gap-8">
        {user && (
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">
              Generator
            </Link>
            <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors">
              My Library
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full border border-teal-100 font-bold text-xs">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                {credits ?? 0} Credits
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <button 
                onClick={logout}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-wider"
              >
                Logout
              </button>
              <Link href="/dashboard" className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden hover:scale-105 transition-transform">
                {user.user_metadata.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/login"
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-slate-200 transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
