"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, Heart, Trophy, BookOpen, Sparkles, CheckCircle2, Image as ImageIcon, LogIn } from "lucide-react";
import { generateBookCover, generateMiniBookPages, submitChallengeEntry, toggleChallengeUpvote } from "@/actions/challenge-actions";
import { resizeImage, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useChallengeStore } from "@/store/use-challenge-store";
// @ts-ignore
import HTMLFlipBook from "react-pageflip";

const CATEGORIES = [
    { id: "cooking", name: "Cooking & Recipes", icon: "👨‍🍳" },
    { id: "coding", name: "Coding & Tech", icon: "💻" },
    { id: "fitness", name: "Fitness & Wellness", icon: "💪" },
    { id: "art", name: "Art & Creativity", icon: "🎨" },
    { id: "life", name: "Life Skills", icon: "🏠" },
    { id: "language", name: "Language Learning", icon: "🌍" },
    { id: "business", name: "Business & Side Hustles", icon: "💼" },
    { id: "hobbies", name: "Hobbies & Crafts", icon: "✂️" },
    { id: "mental", name: "Mental Health", icon: "🧠" },
    { id: "parenting", name: "Parenting & Kids", icon: "👶" },
    { id: "other", name: "Other", icon: "✨" },
];

interface ChallengeInterfaceProps {
  challenge: any;
  initialEntries: any[];
  userUpvotes: string[];
}

export function ChallengeInterface({ challenge, initialEntries, userUpvotes }: ChallengeInterfaceProps) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"gallery" | "create">("gallery");
  const [entries, setEntries] = useState(initialEntries);
  const [upvotedEntries, setUpvotedEntries] = useState<Set<string>>(new Set(userUpvotes));

  // Zustand Store
  const { 
    step, setStep,
    category, setCategory,
    customCategory, setCustomCategory,
    title, setTitle,
    prompt, setPrompt,
    coverPrompt, setCoverPrompt,
    coverRefImage, setCoverRefImage,
    generatedCover, setGeneratedCover,
    generatedPages, setGeneratedPages,
    reset
  } = useChallengeStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check auth & listen for changes
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Hydrate store
    useChallengeStore.persist.rehydrate();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
      router.push("/login?next=" + window.location.pathname);
  };

  const handleCoverRefUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const resized = await resizeImage(e.target.files[0], 512);
      setCoverRefImage(resized);
    }
  };

  const handleGenerateCover = async () => {
      if (!title) return alert("Please enter a title first.");
      setIsGenerating(true);
      try {
          const cover = await generateBookCover(title, coverPrompt || undefined, coverRefImage || undefined);
          setGeneratedCover(cover);
      } catch (e) {
          console.error(e);
          alert("Cover generation failed.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleGeneratePages = async () => {
      if (!prompt || !category) return alert("Please enter a topic prompt.");
      const finalCategory = category === "other" ? customCategory : CATEGORIES.find(c => c.id === category)?.name || category;
      
      setIsGenerating(true);
      try {
          const pages = await generateMiniBookPages(prompt, finalCategory);
          setGeneratedPages(pages);
          setStep(3); // Move to preview
      } catch (e) {
          console.error(e);
          alert("Pages generation failed.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSubmit = async () => {
    if (!generatedCover || generatedPages.length === 0) return;
    const finalCategory = category === "other" ? customCategory : CATEGORIES.find(c => c.id === category)?.name || category;

    setIsSubmitting(true);
    try {
      await submitChallengeEntry(challenge.id, title, prompt, finalCategory, generatedCover, generatedPages);
      alert("Entry submitted successfully!");
      setActiveTab("gallery");
      // Reset form & draft
      reset();
    } catch (error) {
      console.error(error);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (entryId: string) => {
    if (!user) {
        handleLogin();
        return;
    }
    const isUpvoted = upvotedEntries.has(entryId);
    const newSet = new Set(upvotedEntries);
    if (isUpvoted) newSet.delete(entryId);
    else newSet.add(entryId);
    setUpvotedEntries(newSet);

    setEntries(prev => prev.map(e => {
        if (e.id === entryId) {
            return { ...e, upvotes_count: e.upvotes_count + (isUpvoted ? -1 : 1) };
        }
        return e;
    }));

    try {
        await toggleChallengeUpvote(entryId);
    } catch (e) {
        setUpvotedEntries(upvotedEntries);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Tabs */}
      <div className="flex justify-center mb-12">
        <div className="bg-[#111] p-1 rounded-full border border-white/10 flex gap-1">
          <button
            onClick={() => setActiveTab("gallery")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              activeTab === "gallery" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            )}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              activeTab === "create" ? "bg-purple-600 text-white" : "text-neutral-400 hover:text-white"
            )}
          >
            Create Mini-Book
          </button>
        </div>
      </div>

      {activeTab === "gallery" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {entries.map(entry => (
            <div key={entry.id} className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group">
              <div className="aspect-[3/4] relative bg-black">
                <img src={entry.hero_image_url || entry.cover_image_url || entry.comic_pages[0]} alt={entry.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase border border-white/10">
                    {CATEGORIES.find(c => c.id === entry.category)?.icon} {entry.category}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                    <Link href={`/book/${entry.id}`} className="w-full">
                        <Button variant="secondary" className="w-full font-bold">Read Book</Button>
                    </Link>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white truncate">{entry.title}</h3>
                <p className="text-xs text-neutral-400 mb-3">by {entry.username}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Trophy className="w-3 h-3" />
                        <span className="text-xs font-bold">Rank #{entries.indexOf(entry) + 1}</span>
                    </div>
                    <button 
                        onClick={() => handleUpvote(entry.id)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                            upvotedEntries.has(entry.id) 
                                ? "bg-red-500/20 text-red-500" 
                                : "bg-white/5 text-neutral-400 hover:bg-white/10"
                        )}
                    >
                        <Heart className={cn("w-3 h-3", upvotedEntries.has(entry.id) && "fill-current")} />
                        {entry.upvotes_count}
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
            {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6">1. Choose Your Topic</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={cn(
                                        "p-3 rounded-xl border text-left transition-all",
                                        category === cat.id 
                                            ? "bg-purple-500/20 border-purple-500 text-white" 
                                            : "bg-black border-white/10 text-neutral-400 hover:border-white/30"
                                    )}
                                >
                                    <div className="text-2xl mb-1">{cat.icon}</div>
                                    <div className="text-xs font-bold">{cat.name}</div>
                                </button>
                            ))}
                        </div>

                        {category === "other" && (
                            <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Custom Category Name</label>
                                <Input 
                                    value={customCategory} 
                                    onChange={e => setCustomCategory(e.target.value)} 
                                    placeholder="e.g. Space Exploration" 
                                    className="bg-black border-white/10 text-white"
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">Book Title</label>
                                <Input 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    placeholder="e.g. 5 Easy Pasta Dishes" 
                                    className="bg-black border-white/10 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">What will you teach? (Prompt)</label>
                                <Textarea 
                                    value={prompt} 
                                    onChange={e => setPrompt(e.target.value)} 
                                    placeholder="Describe the content of your mini-book..." 
                                    className="bg-black border-white/10 text-white min-h-[100px]"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <Button onClick={() => setStep(2)} disabled={!title || !prompt || (category === "other" && !customCategory)} className="w-full bg-white text-black hover:bg-neutral-200 font-bold py-6 text-lg">
                        Next: Design Cover →
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6">2. Design Book Cover</h3>
                        
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Custom Cover Prompt (Optional)</label>
                                    <Textarea 
                                        value={coverPrompt} 
                                        onChange={e => setCoverPrompt(e.target.value)} 
                                        placeholder="Describe how you want the cover to look... (e.g. Minimalist style, vibrant colors, 3D render)" 
                                        className="bg-black border-white/10 text-white min-h-[80px]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">Reference Image (Optional)</label>
                                    <div className="aspect-[3/4] bg-black rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-colors flex items-center justify-center overflow-hidden group relative">
                                        {coverRefImage ? (
                                            <img src={coverRefImage} className="w-full h-full object-cover opacity-50" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                                                <span className="text-xs text-neutral-500">Upload Reference</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleCoverRefUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-center items-center">
                                {generatedCover ? (
                                    <div className="aspect-[3/4] w-full rounded-xl overflow-hidden border border-white/20 shadow-2xl shadow-purple-900/20 relative group">
                                        <img src={generatedCover} className="w-full h-full object-cover" />
                                        {isGenerating && (
                                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                                                <Loader2 className="animate-spin w-8 h-8 text-purple-400" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button size="sm" onClick={handleGenerateCover} disabled={isGenerating}>
                                                {isGenerating ? "Regenerating..." : "Regenerate"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button 
                                        onClick={handleGenerateCover} 
                                        disabled={isGenerating}
                                        className="w-full h-full min-h-[200px] bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 hover:border-purple-500 transition-all flex flex-col gap-3"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin w-8 h-8" /> : <Sparkles className="w-8 h-8 text-purple-400" />}
                                        <span>Generate Cover</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                        <Button 
                            onClick={handleGeneratePages} 
                            disabled={!generatedCover || isGenerating} 
                            className="flex-[2] bg-white text-black hover:bg-neutral-200 font-bold py-6"
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> Generating Pages...</span>
                            ) : (
                                "Generate Book Content →"
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                     <div className="bg-[#111] border border-white/10 rounded-2xl p-8 flex justify-center">
                        {/* Flipbook Preview */}
                        <div className="relative w-full max-w-[500px] aspect-[3/4]">
                             {/* @ts-ignore */}
                            <HTMLFlipBook
                                width={400}
                                height={550}
                                size="stretch"
                                minWidth={300}
                                maxWidth={1000}
                                minHeight={400}
                                maxHeight={1533}
                                maxShadowOpacity={0.5}
                                showCover={true}
                                mobileScrollSupport={true}
                                className="demo-book"
                            >
                                {/* Cover Page */}
                                <div className="page bg-black">
                                    <img src={generatedCover!} className="w-full h-full object-cover" />
                                </div>

                                {/* Content Pages */}
                                {generatedPages.map((page, i) => (
                                    <div key={i} className="page bg-white">
                                        <img src={page} className="w-full h-full object-contain" />
                                        <div className="absolute bottom-2 right-2 text-black text-xs font-bold bg-white/80 px-2 rounded">{i+1}</div>
                                    </div>
                                ))}

                                {/* Back Cover */}
                                <div className="page bg-[#1a1a1a] text-white p-10 flex flex-col items-center justify-center border-l border-white/10 text-center">
                                    <img src="/logo.png" className="w-24 h-24 mb-6 object-contain mx-auto" />
                                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                        ImageStudio Lab
                                    </h3>
                                    <p className="text-neutral-500 mt-2 text-sm">Generated with AI Magic</p>
                                    <div className="mt-12 text-xs text-neutral-600">
                                        Share your talent.<br/>Create your own mini-book.
                                    </div>
                                </div>
                            </HTMLFlipBook>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                        {user ? (
                            <Button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] bg-green-600 hover:bg-green-500 text-white font-bold py-6"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Publish to Gallery"}
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleLogin}
                                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-bold py-6"
                            >
                                <LogIn className="mr-2 w-5 h-5" /> Sign in to Submit
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
