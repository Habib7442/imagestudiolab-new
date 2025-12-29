"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Download, Search, Layout, Type, Palette, Wand2, Lightbulb, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { INFOGRAPHIC_TEMPLATES, InfographicTemplate } from "@/constants/infographics";
import { generateSocialCaptions } from "@/actions/ai-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

export default function InfographicInterface() {
  const [topic, setTopic] = useState("");
  const [userContent, setUserContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<InfographicTemplate | null>(INFOGRAPHIC_TEMPLATES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  // Check authentication & restore state
  useEffect(() => {
    // 1. Initial session check
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkInitialSession();

    // 2. Listen for auth changes (handles redirects, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    // 3. Restore local state if returning from login
    const savedState = localStorage.getItem('infographic_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.topic) setTopic(parsed.topic);
        if (parsed.userContent) setUserContent(parsed.userContent);
        if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate);
        if (parsed.generatedImage) setGeneratedImage(parsed.generatedImage);
        localStorage.removeItem('infographic_state');
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please describe a topic for your infographic!");
      return;
    }
    if (!selectedTemplate) {
      setError("Please select a template design!");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      // Inject user's topic and content into the template prompt
      let finalPrompt = selectedTemplate.prompt.replaceAll("[TOPIC]", topic);
      
      let contentBlock = "";
      if (userContent.trim()) {
         contentBlock = "**Detailed Content Instructions (Strictly follow these):**\n" + userContent;
      } else {
         contentBlock = "**Detailed Content Instructions:**\nAuto-generate relevant, accurate, and high-value educational content based on the topic.";
      }
      
      finalPrompt = finalPrompt.replace("[USER_CONTENT_BLOCK]", contentBlock);

      const formData = new FormData();
      formData.append("prompt", finalPrompt);
      formData.append("mode", "infographic"); 

      const response = await fetch("/api/generate-photoshoot", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate infographic");
      }

      setGeneratedImage(data.result);
    } catch (error: any) {
      console.error(error);
      setError(error.message || "Failed to generate infographic. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!isLoggedIn) {
      setShowLoginAlert(true);
      return;
    }

    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `infographic-${topic.slice(0, 20).replace(/\s+/g, '-')}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLoginRedirect = () => {
    const stateToSave = {
      topic,
      userContent,
      selectedTemplate,
      generatedImage
    };
    localStorage.setItem('infographic_state', JSON.stringify(stateToSave));
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 pt-24 md:pt-32 font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Layout className="w-6 h-6 mr-2" />
            <span className="font-bold tracking-wider uppercase text-sm">AI Infographic Studio</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Visualize Any Concept
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto mb-8">
            Turn complex ideas into viral, educational Instagram infographics in seconds. 
            Perfect for coaches, educators, and brands.
          </p>
        </motion.div>

        {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Topic Input */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                What's your topic? <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. 'Camera Parts', 'How to make Coffee', 'Benefits of Yoga'..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all min-h-[80px] resize-none"
                />
              </div>
            </div>

            {/* User Content Input (Optional) */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-wider">
                <Type className="w-4 h-4 text-blue-400" />
                Specific Content Usually (Optional)
              </label>
              <div className="relative">
                <Textarea
                  value={userContent}
                  onChange={(e) => setUserContent(e.target.value)}
                  placeholder="e.g. List specific steps, facts, or comparison points you want to include..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[100px] resize-none"
                />
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-400 uppercase tracking-wider">
                <Palette className="w-4 h-4 text-purple-400" />
                Choose Structure
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                {INFOGRAPHIC_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                      "group relative p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 hover:bg-white/5",
                      selectedTemplate?.id === template.id 
                        ? "border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                        : "border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br shadow-inner shrink-0",
                      template.gradient
                    )}>
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{template.name}</h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">{template.description}</p>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-4 right-4">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim() || !selectedTemplate}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg mt-4",
                isGenerating || !topic.trim() || !selectedTemplate
                  ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02]"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Visualizing Concept...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Infographic
                </>
              )}
            </button>

          </div>

            {/* Right Panel: Preview */}
            <div className="lg:col-span-7 space-y-6">
            <div className="sticky top-8">
              <div className="aspect-[9/16] w-full max-w-sm mx-auto rounded-3xl bg-[#111] border border-white/10 overflow-hidden relative flex items-center justify-center shadow-2xl">
                
                <AnimatePresence mode="wait">
                  {generatedImage ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative w-full h-full group"
                    >
                      <img src={generatedImage} alt="Generated Infographic" className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                        <button 
                          onClick={handleDownload}
                          className="px-6 py-3 bg-white text-black rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                          <Download className="w-4 h-4" />
                          Download HD
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center p-8 px-12"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <Layout className="w-8 h-8 text-neutral-600" />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-300 mb-2">Detailed Visuals</h3>
                      <p className="text-neutral-500 text-sm">
                        Enter a topic to generate a comprehensive, split-screen educational visual.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isGenerating && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-purple-400 font-medium animate-pulse">Structuring data...</p>
                    <p className="text-neutral-500 text-xs mt-2">Design • Layout • Rendering</p>
                  </div>
                )}
              </div>
              
              {/* Caption Generator */}
              {generatedImage && !isGenerating && (
                 <CaptionsGenerator topic={topic} userContent={userContent} />
              )}

            </div>
            </div>

        </div>
      </div>

      {/* Login Alert Dialog */}
      <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent className="bg-[#111] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">Sign in to Download</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Please sign in to save your infographic!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 text-white border-white/10 hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLoginRedirect}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
            >
              Sign In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

function CaptionsGenerator({ topic, userContent }: { topic: string, userContent: string }) {
  const [captions, setCaptions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGen = async () => {
    setLoading(true);
    try {
      const res = await generateSocialCaptions(topic, userContent);
      setCaptions(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <span className="text-base">💬</span> Viral Captions
        </h3>
        {!captions && (
          <button 
            onClick={handleGen}
            disabled={loading}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3" />}
            {loading ? "Writing..." : "Auto-Write"}
          </button>
        )}
      </div>

      {loading && !captions && (
        <div className="space-y-3 animate-pulse">
           <div className="h-4 bg-white/5 rounded w-3/4" />
           <div className="h-4 bg-white/5 rounded w-1/2" />
        </div>
      )}

      {captions && (
        <div className="space-y-4">
          <CaptionBlock platform="LinkedIn" icon="💼" text={captions.linkedin} />
          <CaptionBlock platform="Instagram" icon="📸" text={captions.instagram} />
          <CaptionBlock platform="X (Twitter)" icon="🐦" text={captions.twitter} />
          
          <button onClick={handleGen} className="w-full text-center text-xs text-neutral-500 hover:text-neutral-300 mt-2">
            Regenerate Captions
          </button>
        </div>
      )}
    </div>
  );
}

const CaptionBlock = ({ platform, icon, text }: { platform: string, icon: string, text: string }) => {
  const [copied, setCopied] = useState(false);
  
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black/50 rounded-xl p-3 border border-white/5 relative group">
       <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 mb-2">
         <span>{icon}</span> {platform}
       </div>
       <p className="text-sm text-neutral-300 whitespace-pre-line leading-relaxed pb-6 min-h-[60px]">
         {text}
       </p>
       <button 
         onClick={copy}
         className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-white/10 text-[10px] font-bold text-neutral-400 hover:bg-white/20 hover:text-white transition-colors flex items-center gap-1"
       >
         {copied ? "Copied!" : "Copy"}
       </button>
    </div>
  );
};
