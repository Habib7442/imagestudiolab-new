-- Create a new storage bucket for challenge uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('challenge-uploads', 'challenge-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
-- Allow public access to view files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'challenge-uploads' );

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'challenge-uploads'
  AND auth.role() = 'authenticated'
);

-- Allow users to update/delete their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'challenge-uploads'
  AND auth.uid() = owner
);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'challenge-uploads'
  AND auth.uid() = owner
);
