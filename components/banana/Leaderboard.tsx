import { Trophy } from "lucide-react";

interface LeaderboardProps {
  posts: any[];
}

export function Leaderboard({ posts }: LeaderboardProps) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-6 sticky top-24">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-400">
        <Trophy size={20} />
        Weekly Champions
      </h3>
      
      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={post.id} className="flex items-center gap-3 group cursor-pointer">
            <div className="font-mono text-2xl font-bold text-neutral-600 w-6">
              #{index + 1}
            </div>
            
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
              <img src={post.image_url} alt="Ranked" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{post.username}</p>
              <p className="text-xs text-neutral-400">{post.upvotes_count} upvotes</p>
            </div>
          </div>
        ))}
        
        {posts.length === 0 && (
          <p className="text-sm text-neutral-500 italic">No champions yet this week.</p>
        )}
      </div>
    </div>
  );
}
