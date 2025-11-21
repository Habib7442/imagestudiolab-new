"use server";

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const returnTo = formData.get('returnTo') as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error.message);
    let errorMsg = 'Invalid email or password. Please try again.';
    if (error.message.includes('Email not confirmed')) {
      errorMsg = 'Please verify your email address before signing in.';
    }
    redirect(`/login?error=${encodeURIComponent(errorMsg)}${returnTo ? `&returnTo=${returnTo}` : ''}`);
  }

  revalidatePath('/', 'layout');
  redirect(returnTo || '/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const returnTo = formData.get('returnTo') as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback${returnTo ? `?returnTo=${returnTo}` : ''}`,
    },
  });

  if (error) {
    console.error('Signup error:', error.message);
    let errorMsg = 'Could not create account. Please try again.';
    if (error.message.includes('already registered')) {
      errorMsg = 'This email is already registered. Please sign in instead.';
    }
    redirect(`/login?error=${encodeURIComponent(errorMsg)}${returnTo ? `&returnTo=${returnTo}` : ''}`);
  }

  revalidatePath('/', 'layout');
  redirect(`/login?message=${encodeURIComponent('Success! Check your email to verify your account before signing in.')}`);
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google sign-in error:', error.message);
    redirect('/login?error=Could not authenticate with Google');
  }

  if (data.url) {
    redirect(data.url); // Redirect to Google OAuth consent screen
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
