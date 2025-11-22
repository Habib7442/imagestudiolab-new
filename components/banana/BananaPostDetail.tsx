"use client";

import { useState } from "react";
import { Heart, Trash2, Share2, Download } from "lucide-react";
import { toggleBananaUpvote, deleteBananaPost } from "@/actions/banana-actions";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface BananaPostDetailProps {
  post: any;
  currentUserId?: string;
  hasUpvoted: boolean;
}

export function BananaPostDetail({ post, currentUserId, hasUpvoted: initialHasUpvoted }: BananaPostDetailProps) {
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [upvotes, setUpvotes] = useState(post.upvotes_count || 0);
  const [isVoting, setIsVoting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isOwnPost = currentUserId && currentUserId === post.user_id;

  const handleUpvote = async () => {
    if (!currentUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to upvote!");
        router.push("/login?returnTo=/nano-banana-wall/" + post.id);
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await deleteBananaPost(post.id);
      router.push("/nano-banana-wall");
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete post");
    }
  };

  const handleShare = async () => {
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

  const handleDownload = async () => {
    try {
      const response = await fetch(post.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `banana-art-${post.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download image");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden">
          <img
            src={post.image_url}
            alt={post.prompt}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Author Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg font-bold text-black">
              {post.username[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white">{post.username}</h3>
              <p className="text-sm text-neutral-400">{formatDate(post.created_at)}</p>
            </div>
          </div>

          {/* Prompt */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-neutral-400 mb-2">Prompt</h4>
            <p className="text-white leading-relaxed">{post.prompt}</p>
          </div>

          {/* Stats & Actions */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Upvotes</span>
              <span className="text-2xl font-bold text-white">{upvotes}</span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleUpvote}
                disabled={isVoting}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
                  hasUpvoted
                    ? "bg-red-500/20 text-red-500 border border-red-500/50"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                )}
              >
                <Heart size={20} className={cn(hasUpvoted && "fill-current")} />
                {hasUpvoted ? "Upvoted" : "Upvote"}
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all"
              >
                <Share2 size={20} />
                Share
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-all"
              >
                <Download size={20} />
                Download
              </button>

              {isOwnPost && (
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all"
                >
                  <Trash2 size={20} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
