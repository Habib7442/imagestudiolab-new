"use strict";
import React, { useState, useEffect } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { generateSocialCaptions } from "@/actions/ai-actions";
import { cn } from "@/lib/utils";

interface CaptionsGeneratorProps {
  topic: string;
  userContent: string;
}

export function CaptionsGenerator({ topic, userContent }: CaptionsGeneratorProps) {
  const [captions, setCaptions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchCaptions = async () => {
      setLoading(true);
      try {
        const data = await generateSocialCaptions(topic, userContent);
        if (mounted) setCaptions(data);
      } catch (e) {
        console.error("Failed to fetch captions", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (topic) fetchCaptions();
    return () => { mounted = false; };
  }, [topic]); 

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopied(platform);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) return (
    <div className="w-full bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[100px]">
      <div className="flex items-center gap-3 text-neutral-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Crafting viral captions...</span>
      </div>
    </div>
  );

  if (!captions) return null;

  const platforms = [
    { id: 'linkedin', icon: '💼', name: 'LinkedIn', color: 'text-blue-400' },
    { id: 'instagram', icon: '📸', name: 'Instagram', color: 'text-pink-400' },
    { id: 'twitter', icon: '🐦', name: 'Twitter / X', color: 'text-sky-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {platforms.map((p) => (
        <div key={p.id} className="bg-[#111] border border-white/10 rounded-2xl p-4 flex flex-col group hover:border-white/20 transition-all relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${p.id === 'linkedin' ? 'from-blue-600 to-blue-400' : p.id === 'instagram' ? 'from-purple-500 to-pink-500' : 'from-sky-500 to-blue-400'} opacity-50`}></div>
            
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <span className="text-lg">{p.icon}</span>
                 <h4 className={cn("text-sm font-bold", p.color)}>{p.name}</h4>
               </div>
               <button 
                onClick={() => copyToClipboard(captions[p.id], p.id)}
                className="p-1.5 rounded-lg bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Copy"
               >
                 {copied === p.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
               </button>
            </div>
            
            <div className="bg-black/40 rounded-xl p-3 flex-1 border border-white/5">
                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap font-medium">
                  {captions[p.id]}
                </p>
            </div>
        </div>
      ))}
    </div>
  );
}
