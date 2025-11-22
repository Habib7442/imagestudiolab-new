import { getBananaPosts, getBananaLeaderboard, getUserUpvotes } from "@/actions/banana-actions";
import { BananaGenerator } from "@/components/banana/BananaGenerator";
import { BananaWall } from "@/components/banana/BananaWall";
import { Leaderboard } from "@/components/banana/Leaderboard";
import Navbar from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function NanoBananaWallPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { posts } = await getBananaPosts();
  const leaderboardPosts = await getBananaLeaderboard();
  const userUpvotes = await getUserUpvotes();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Nano Banana Wall
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            Unleash your creativity. Generate AI art, share it with the community, and compete for the weekly crown. 🍌👑
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <BananaGenerator />
            
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-2xl">🎨</span> Community Gallery
              </h2>
              <BananaWall 
                posts={posts || []} 
                userUpvotes={userUpvotes} 
                currentUserId={user?.id} 
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Leaderboard posts={leaderboardPosts || []} />
            
            {/* Info Card */}
            <div className="mt-6 bg-[#111] border border-white/10 rounded-xl p-6">
              <h4 className="font-bold text-white mb-2">How it works</h4>
              <ul className="space-y-2 text-sm text-neutral-400 list-disc list-inside">
                <li>Enter a prompt to generate unique art</li>
                <li>Post your favorite creations to the wall</li>
                <li>Upvote the best submissions</li>
                <li>Top voted posts win the weekly leaderboard</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
