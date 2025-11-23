import { createClient } from "@/lib/supabase/server";
import { BookViewer } from "@/components/challenge/BookViewer";
import { notFound } from "next/navigation";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: entry } = await supabase.from("challenge_entries").select("*").eq("id", id).single();
  
  if (!entry) return notFound();

  // Check if user upvoted
  const { data: { user } } = await supabase.auth.getUser();
  let isUpvoted = false;
  if (user) {
      const { data } = await supabase.from("challenge_upvotes").select("id").eq("entry_id", id).eq("user_id", user.id).single();
      isUpvoted = !!data;
  }

  return <BookViewer entry={entry} initialIsUpvoted={isUpvoted} currentUserId={user?.id} />;
}
