ALTER TABLE challenge_entries 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
