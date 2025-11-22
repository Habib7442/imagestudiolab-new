"use client";

import { BananaPost } from "./BananaPost";
import { Masonry } from "react-plock";

interface BananaWallProps {
  posts: any[];
  userUpvotes: string[];
  currentUserId?: string;
}

export function BananaWall({ posts, userUpvotes, currentUserId }: BananaWallProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🍌</div>
        <h3 className="text-xl font-bold text-white mb-2">The Wall is Empty</h3>
        <p className="text-neutral-400">Be the first to post a masterpiece!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Masonry
        items={posts}
        config={{
          columns: [1, 2, 2, 3],
          gap: [24, 24, 24, 24],
          media: [640, 768, 1024, 1280],
        }}
        render={(post, idx) => (
          <BananaPost
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            hasUpvoted={userUpvotes.includes(post.id)}
          />
        )}
      />
    </div>
  );
}
