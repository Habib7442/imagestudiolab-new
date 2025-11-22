import { getBananaPostById, getUserUpvotes } from "@/actions/banana-actions";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/shared/Navbar";
import { BananaPostDetail } from "@/components/banana/BananaPostDetail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BananaPostPage({ params }: PageProps) {
  const { id } = await params;
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const post = await getBananaPostById(id);
    const userUpvotes = await getUserUpvotes();

    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          {/* Back Button */}
          <Link 
            href="/nano-banana-wall" 
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            Back to Gallery
          </Link>

          <BananaPostDetail 
            post={post} 
            currentUserId={user?.id}
            hasUpvoted={userUpvotes.includes(id)}
          />
        </main>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
