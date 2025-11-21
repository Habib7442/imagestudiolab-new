"use client";

import { useState, useEffect } from "react";
import { Star, Send, Loader2, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/shared/Navbar";
import { createClient } from "@/lib/supabase/client";
import { submitTestimonial, getApprovedTestimonials, getUserTestimonials, deleteTestimonial } from "@/actions/testimonial-actions";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  rating: number;
  message: string;
  is_approved: boolean;
  created_at: string;
}

export default function TestimonialsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [approvedTestimonials, setApprovedTestimonials] = useState<Testimonial[]>([]);
  const [userTestimonials, setUserTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      
      if (session?.user) {
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "");
        setUserEmail(session.user.email || "");
      }
    };
    
    checkAuth();
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    setIsLoading(true);
    
    // Load approved testimonials
    const approvedResult = await getApprovedTestimonials();
    if (approvedResult.success && approvedResult.data) {
      setApprovedTestimonials(approvedResult.data);
    }
    
    // Load user's testimonials if logged in
    const userResult = await getUserTestimonials();
    if (userResult.success && userResult.data) {
      setUserTestimonials(userResult.data);
    }
    
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert("Please sign in to submit a testimonial");
      return;
    }

    if (!message.trim() || message.length < 10) {
      alert("Please write at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    const result = await submitTestimonial({
      user_name: userName,
      user_email: userEmail,
      rating,
      message: message.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setSubmitStatus("success");
      setMessage("");
      setRating(5);
      
      // Reload testimonials
      await loadTestimonials();
      
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } else {
      setSubmitStatus("error");
      alert(result.error || "Failed to submit testimonial");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    
    const result = await deleteTestimonial(id);
    if (result.success) {
      await loadTestimonials();
    } else {
      alert(result.error || "Failed to delete testimonial");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
              Share Your Experience
            </h1>
            <p className="text-neutral-400 text-lg">
              Help others discover ImageStudioLab by sharing your thoughts
            </p>
          </div>

          {/* Submit Form */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 lg:p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="text-yellow-500" />
              Write a Testimonial
            </h2>
            
            {!isLoggedIn ? (
              <div className="text-center py-8">
                <p className="text-neutral-400 mb-4">Please sign in to submit a testimonial</p>
                <Button asChild className="bg-[var(--color-brand-red)] hover:bg-red-600">
                  <a href="/login">Sign In</a>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Your Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-brand-red)] outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-brand-red)] outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 transition-colors",
                            star <= rating ? "fill-yellow-500 text-yellow-500" : "text-neutral-600"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Your Testimonial</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 focus:border-[var(--color-brand-red)] outline-none transition-colors resize-none"
                    placeholder="Share your experience with ImageStudioLab..."
                  />
                  <p className="text-xs text-neutral-500 mt-1">{message.length} characters (min 10)</p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !message.trim() || message.length < 10}
                  className="w-full bg-gradient-to-r from-[var(--color-brand-red)] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-6 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : submitStatus === "success" ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Submitted Successfully!
                    </>
                  ) : submitStatus === "error" ? (
                    <>
                      <XCircle className="mr-2 h-5 w-5" />
                      Failed to Submit
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Testimonial
                    </>
                  )}
                </Button>

                {submitStatus === "success" && (
                  <p className="text-green-500 text-sm text-center">
                    Thank you! Your testimonial is pending approval.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* User's Testimonials */}
          {isLoggedIn && userTestimonials.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Your Testimonials</h2>
              <div className="space-y-4">
                {userTestimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-[#111] border border-white/10 rounded-xl p-6 relative"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-brand-red)] to-red-600 flex items-center justify-center text-lg font-bold">
                          {testimonial.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{testimonial.user_name}</h3>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-4 h-4",
                                  i < testimonial.rating ? "fill-yellow-500 text-yellow-500" : "text-neutral-600"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-xs px-3 py-1 rounded-full",
                            testimonial.is_approved
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          )}
                        >
                          {testimonial.is_approved ? "Approved" : "Pending"}
                        </span>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          className="text-red-500 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">{testimonial.message}</p>
                    <p className="text-xs text-neutral-500 mt-3">
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved Testimonials */}
          <div>
            <h2 className="text-2xl font-bold mb-6">What Our Users Say</h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--color-brand-red)]" />
              </div>
            ) : approvedTestimonials.length === 0 ? (
              <div className="text-center py-12 bg-[#111] border border-white/10 rounded-xl">
                <p className="text-neutral-400">No testimonials yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedTestimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-[#111] border border-white/10 rounded-xl p-6 hover:border-[var(--color-brand-red)]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-brand-red)] to-red-600 flex items-center justify-center text-lg font-bold">
                        {testimonial.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{testimonial.user_name}</h3>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "w-4 h-4",
                                i < testimonial.rating ? "fill-yellow-500 text-yellow-500" : "text-neutral-600"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-neutral-300 leading-relaxed line-clamp-4">{testimonial.message}</p>
                    <p className="text-xs text-neutral-500 mt-3">
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
