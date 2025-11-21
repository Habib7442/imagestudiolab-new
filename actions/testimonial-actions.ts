"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface TestimonialData {
  user_name: string;
  user_email: string;
  user_avatar?: string;
  rating: number;
  message: string;
}

export async function submitTestimonial(data: TestimonialData) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "You must be signed in to submit a testimonial" };
    }

    // Insert testimonial
    const { data: testimonial, error } = await supabase
      .from("testimonials")
      .insert({
        user_id: user.id,
        user_name: data.user_name,
        user_email: data.user_email,
        user_avatar: data.user_avatar || user.user_metadata?.avatar_url || null,
        rating: data.rating,
        message: data.message,
        is_approved: false, // Requires admin approval
      })
      .select()
      .single();

    if (error) {
      console.error("Error submitting testimonial:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/testimonials");
    return { success: true, data: testimonial };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getApprovedTestimonials() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching testimonials:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getUserTestimonials() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user testimonials:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteTestimonial(id: string) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting testimonial:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/testimonials");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
