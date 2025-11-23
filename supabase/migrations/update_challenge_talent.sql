-- Update the active challenge
UPDATE challenges 
SET title = 'Share Your Talent: Create a Mini-Book',
    description = 'Share your expertise! Create a 6-8 page illustrated mini-book teaching something you know. From cooking to coding, fitness to finance.',
    prize_amount = '$10 USD'
WHERE status = 'active';

-- Add category and cover_image_url to entries
ALTER TABLE challenge_entries 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
