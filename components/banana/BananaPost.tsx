"use client";

import { useState } from "react";
import { Heart, Share2, Trash2 } from "lucide-react";
import { toggleBananaUpvote, deleteBananaPost } from "@/actions/banana-actions";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BananaPostProps {
  post: any;
  currentUserId?: string;
  hasUpvoted: boolean;
}

export function BananaPost({ post, currentUserId, hasUpvoted: initialHasUpvoted }: BananaPostProps) {
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [upvotes, setUpvotes] = useState(post.upvotes_count || 0);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isOwnPost = currentUserId && currentUserId === post.user_id;

  const handleUpvote = async () => {
    if (!currentUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Please log in to upvote!");
            router.push("/login?returnTo=/nano-banana-wall");
            return;
        }
    }

    if (isVoting) return;
    setIsVoting(true);

    const newHasUpvoted = !hasUpvoted;
    setHasUpvoted(newHasUpvoted);
    setUpvotes((prev: number) => newHasUpvoted ? prev + 1 : prev - 1);

    try {
      await toggleBananaUpvote(post.id);
    } catch (error) {
      console.error("Upvote failed", error);
      setHasUpvoted(!newHasUpvoted);
      setUpvotes((prev: number) => !newHasUpvoted ? prev + 1 : prev - 1);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const shareUrl = `${window.location.origin}/nano-banana-wall/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Nano Banana Wall Art',
          text: `Check out this AI art by ${post.username}: ${post.prompt}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteBananaPost(post.id);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete post.");
    }
  };

  const isOwner = currentUserId === post.user_id;

  return (
    <Link href={`/nano-banana-wall/${post.id}`} className="block">
      <div className="group relative bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-yellow-400/50 transition-colors cursor-pointer">
      <div className="relative overflow-hidden">
        <img 
          src={post.image_url} 
          alt={post.prompt} 
          className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
          <p className="text-white text-sm line-clamp-2 font-medium">{post.prompt}</p>
          <p className="text-neutral-400 text-xs mt-1">by {post.username}</p>
        </div>
      </div>
      
      <div className="p-3 flex items-center justify-between bg-[#111]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-black">
            {post.username[0].toUpperCase()}
          </div>
          <span className="text-xs text-neutral-300 truncate max-w-[100px]">{post.username}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition-all"
            title="Share"
          >
            <Share2 size={14} />
          </button>

          {isOwnPost && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-red-400 hover:bg-red-500/20 hover:text-red-500 transition-all disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUpvote();
            }}
            disabled={isVoting}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all",
              hasUpvoted 
                ? "bg-red-500/20 text-red-500" 
                : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
            )}
          >
            <Heart size={14} className={cn(hasUpvoted && "fill-current")} />
            {upvotes}
          </button>
        </div>
      </div>
      </div>
    </Link>
  );
}
