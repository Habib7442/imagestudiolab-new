"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Menu, X, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  actionButton?: React.ReactNode;
}

export default function Navbar({ actionButton }: NavbarProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const isOnAppPage = pathname === '/photoshoot' || pathname === '/thumbnail-gen';

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled && "bg-[#050505]/80 backdrop-blur-md border-white/5 py-3",
        !isScrolled && "py-4 lg:py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 lg:gap-3 group">
          <div className="relative w-7 h-7 lg:w-8 lg:h-8 overflow-hidden rounded-lg shadow-[0_0_15px_rgba(255,51,51,0.3)] transition-shadow group-hover:shadow-[0_0_25px_rgba(255,51,51,0.5)]">
            <Image 
              src="/logo.png" 
              alt="ImageStudioLab" 
              fill 
              sizes="32px"
              className="object-cover"
            />
          </div>
          <span className="font-bold text-base lg:text-lg tracking-tight text-white">
            ImageStudio<span className="text-[var(--color-brand-red)]">Lab</span>
          </span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link 
            href="/testimonials" 
            className="text-neutral-400 hover:text-white transition-colors relative group"
          >
            Testimonials
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--color-brand-red)] transition-all duration-300 group-hover:w-full" />
          </Link>
          <div className="relative group">
            <Link 
              href="/nano-banana-wall" 
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span className="text-yellow-400">🍌</span> Nano Banana Wall
            </Link>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-yellow-400 transition-all duration-300 group-hover:w-full" />
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {actionButton}
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-neutral-800 text-neutral-400 text-xs">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-neutral-300 font-medium hidden lg:inline-block">
                  {user?.email}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="text-neutral-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="hidden lg:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild className="text-neutral-400 hover:text-white hover:bg-white/5">
                <Link href="/login">
                  Sign in
                </Link>
              </Button>
              {!isOnAppPage && !actionButton && (
                <Button asChild size="sm" className="bg-[var(--color-brand-red)] hover:bg-red-600 text-white shadow-[0_0_15px_rgba(255,51,51,0.3)] hover:shadow-[0_0_25px_rgba(255,51,51,0.5)] border-none">
                  <Link href="/photoshoot">
                    Get Started
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {actionButton}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 right-0 bg-[#050505]/95 backdrop-blur-md border-b border-white/10 shadow-lg"
        >
          <div className="px-4 py-6 space-y-4">
            <Link
              href="/testimonials"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-neutral-400 hover:text-white transition-colors py-2"
            >
              Testimonials
            </Link>
            <Link
              href="/nano-banana-wall"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-neutral-400 hover:text-white transition-colors py-2 flex items-center gap-2"
            >
              <span className="text-yellow-400">🍌</span> Nano Banana Wall
            </Link>
            
            <div className="pt-4 border-t border-white/10 space-y-3">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-neutral-800 text-neutral-400 text-xs">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white font-medium">{user?.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-neutral-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full justify-start text-neutral-400 hover:text-white hover:bg-white/5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href="/login">Sign in</Link>
                  </Button>
                  {!isOnAppPage && (
                    <Button
                      asChild
                      className="w-full bg-[var(--color-brand-red)] hover:bg-red-600 text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/photoshoot">Get Started</Link>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
