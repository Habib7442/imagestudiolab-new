import { getActiveChallenge } from "@/actions/challenge-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trophy, Calendar, Star } from "lucide-react";
import Navbar from "@/components/shared/Navbar";

export default async function ChallengesPage() {
  const challenge = await getActiveChallenge();

  if (!challenge) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
            <p>No active challenges at the moment. Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-32 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-bold uppercase tracking-wider">Weekly Challenge</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              {challenge.title}
            </h1>
            
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              {challenge.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Prize Pool</h3>
              <p className="text-2xl font-bold text-yellow-400">{challenge.prize_amount}</p>
              <div className="text-xs text-neutral-400 mt-3 space-y-1">
                <p className="text-yellow-500/80">🏆 Winner takes all</p>
                <p>• Min 50 upvotes to qualify</p>
                <p>• Highest upvoted entry wins</p>
              </div>
            </div>
            
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Deadline</h3>
              <p className="text-lg text-neutral-300">
                {new Date(challenge.end_date).toLocaleDateString()}
              </p>
              <p className="text-xs text-neutral-500 mt-2">7 days remaining</p>
            </div>
            
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-colors">
               <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Learning</h3>
              <p className="text-sm text-neutral-300">
                Master AI prompting & storytelling
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href={`/challenges/${challenge.id}`}>
              <Button className="bg-white text-black hover:bg-neutral-200 text-lg px-8 py-6 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all">
                Enter Challenge Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
