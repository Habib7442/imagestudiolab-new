"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { login, signup, signInWithGoogle } from "../actions";
import { CheckCircle2, XCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

const DotPattern = () => (
  <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
       style={{ 
         backgroundImage: "radial-gradient(#333 1px, transparent 1px)", 
         backgroundSize: "24px 24px" 
       }} 
  />
);

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/';
  const errorMessage = searchParams.get('error');
  const successMessage = searchParams.get('message');

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    // Add returnTo to formData
    formData.append('returnTo', returnTo);
    try {
      if (isLogin) {
        await login(formData);
      } else {
        await signup(formData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative flex items-center justify-center p-4">
      
      <DotPattern />
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--color-brand-red)] blur-[150px] opacity-[0.05] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--color-brand-red)] blur-[120px] opacity-[0.03] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          <Link href="/" className="relative w-16 h-16 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,51,51,0.2)] border border-white/10 bg-black mb-4 hover:scale-105 transition-transform duration-300">
            <Image 
              src="/logo.png" 
              alt="ImageStudioLab Logo" 
              fill
              className="object-cover"
            />
          </Link>
          <h1 className="text-2xl font-bold">
            Image Studio <span className="text-[var(--color-brand-red)]">Lab</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-green-400 font-medium">Success!</p>
              <p className="text-xs text-green-300/80 mt-1">{successMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
          >
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400 font-medium">Error</p>
              <p className="text-xs text-red-300/80 mt-1">{errorMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          {/* Glassmorphic Card */}
          <div className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            
            {/* Top Glow Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-brand-red)] to-transparent opacity-50" />
            
            <form action={handleSubmit} className="space-y-6">
              
              {/* Google Sign In Button */}
              <Button
                type="button"
                onClick={async () => {
                  if (!isLogin && !termsAccepted) {
                    alert("Please accept the Terms and Conditions to continue.");
                    return;
                  }
                  setIsLoading(true);
                  await signInWithGoogle(returnTo);
                }}
                className="w-full bg-white hover:bg-neutral-100 text-black font-semibold py-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#0A0A0A] text-neutral-500">Or continue with email</span>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-neutral-400">
                  Email Address
                </label>
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="you@example.com"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-brand-red)]/50 focus:ring-2 focus:ring-[var(--color-brand-red)]/20 transition-all"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-neutral-400">
                  Password
                </label>
                <div className="relative">
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[var(--color-brand-red)]/50 focus:ring-2 focus:ring-[var(--color-brand-red)]/20 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              {!isLogin && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="border-white/20 data-[state=checked]:bg-[var(--color-brand-red)] data-[state=checked]:border-[var(--color-brand-red)]"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-400"
                  >
                    I accept the <Link href="/terms-of-service" className="text-[var(--color-brand-red)] hover:underline">Terms</Link> and <Link href="/privacy-policy" className="text-[var(--color-brand-red)] hover:underline">Privacy Policy</Link>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit"
                disabled={isLoading || (!isLogin && !termsAccepted)}
                className="w-full bg-[var(--color-brand-red)] hover:bg-red-600 text-white font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(255,51,51,0.3)] hover:shadow-[0_0_30px_rgba(255,51,51,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>

              {/* Toggle Login/Signup */}
              <div className="text-center pt-4 border-t border-white/5">
                <p className="text-sm text-neutral-500">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-[var(--color-brand-red)] hover:text-red-400 font-semibold transition-colors"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Bottom Glow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[var(--color-brand-red)] blur-3xl opacity-20 pointer-events-none" />
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link 
            href="/" 
            className="text-sm text-neutral-500 hover:text-white transition-colors inline-flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
