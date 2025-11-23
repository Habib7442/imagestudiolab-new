import { getActiveChallenge, getChallengeEntries, getUserChallengeUpvotes } from "@/actions/challenge-actions";
import Navbar from "@/components/shared/Navbar";
import { ChallengeInterface } from "@/components/challenge/ChallengeInterface";

export default async function ChallengeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = await getActiveChallenge(); // Ideally fetch by ID, but we only have one active for now
  const entries = await getChallengeEntries(id);
  const userUpvotes = await getUserChallengeUpvotes();

  if (!challenge) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Challenge not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 pb-20">
         <ChallengeInterface 
            challenge={challenge} 
            initialEntries={entries} 
            userUpvotes={userUpvotes}
         />
      </div>
    </div>
  );
}
