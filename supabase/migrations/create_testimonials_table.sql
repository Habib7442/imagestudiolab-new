-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);

-- Create index on is_approved for filtering approved testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON public.testimonials(is_approved);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonials
  FOR SELECT
  USING (is_approved = true);

-- Policy: Authenticated users can insert their own testimonials
CREATE POLICY "Authenticated users can create testimonials"
  ON public.testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own testimonials (even if not approved)
CREATE POLICY "Users can view their own testimonials"
  ON public.testimonials
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own testimonials (only if not approved yet)
CREATE POLICY "Users can update their own unapproved testimonials"
  ON public.testimonials
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_approved = false)
  WITH CHECK (auth.uid() = user_id AND is_approved = false);

-- Policy: Users can delete their own testimonials
CREATE POLICY "Users can delete their own testimonials"
  ON public.testimonials
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
