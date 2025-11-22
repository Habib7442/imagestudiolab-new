"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadBananaImage(base64Image: string) {
  const supabase = await createClient();
  
  // Convert base64 to buffer
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, 'base64');

  const fileName = `banana-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;

  const { data, error } = await supabase.storage
    .from('banana-wall')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: false
    });

  if (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image");
  }

  const { data: { publicUrl } } = supabase.storage
    .from('banana-wall')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function submitBananaPost(prompt: string, imageUrl: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get username (metadata or email fallback)
  const username = user.user_metadata.full_name || user.email?.split('@')[0] || "Anonymous Banana";

  const { error } = await supabase.from('banana_posts').insert({
    user_id: user.id,
    username,
    prompt,
    image_url: imageUrl,
  });

  if (error) throw error;
  revalidatePath('/nano-banana-wall');
}

export async function toggleBananaUpvote(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.rpc('toggle_banana_upvote', { post_id_input: postId });
  
  if (error) {
    console.error("RPC Error:", error);
    throw error;
  }

  revalidatePath('/nano-banana-wall');
}

export async function getBananaPosts(page = 1, limit = 20) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('banana_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { posts: data, count };
}

export async function getBananaLeaderboard() {
  const supabase = await createClient();
  
  // Get start of current week (Monday)
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0,0,0,0);

  const { data, error } = await supabase
    .from('banana_posts')
    .select('*')
    .gte('created_at', monday.toISOString())
    .order('upvotes_count', { ascending: false })
    .limit(5);

  if (error) throw error;
  return data;
}

export async function getUserUpvotes() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from('banana_upvotes')
        .select('post_id')
        .eq('user_id', user.id);
    
    return data?.map(v => v.post_id) || [];
}

export async function deleteBananaPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership
  const { data: post } = await supabase.from('banana_posts').select('user_id').eq('id', postId).single();
  if (!post) throw new Error("Post not found");
  if (post.user_id !== user.id) throw new Error("Forbidden");

  const { error } = await supabase.from('banana_posts').delete().eq('id', postId);
  if (error) throw error;

  revalidatePath('/nano-banana-wall');
}
