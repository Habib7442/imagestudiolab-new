-- Challenges Table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prize_amount TEXT,
  status TEXT DEFAULT 'active', -- active, completed
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrations
CREATE TABLE IF NOT EXISTS challenge_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_image_url TEXT, -- Optional
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Entries
CREATE TABLE IF NOT EXISTS challenge_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT, -- Store username for display
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  hero_image_url TEXT,
  costar_image_urls TEXT[], -- Array of URLs
  comic_pages TEXT[], -- Array of generated page URLs
  upvotes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Upvotes
CREATE TABLE IF NOT EXISTS challenge_upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  entry_id UUID REFERENCES challenge_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(entry_id, user_id)
);

-- RPC for atomic upvotes
CREATE OR REPLACE FUNCTION toggle_challenge_upvote(entry_id_input UUID)
RETURNS VOID AS $$
DECLARE
  user_id_input UUID;
BEGIN
  user_id_input := auth.uid();
  
  IF EXISTS (SELECT 1 FROM challenge_upvotes WHERE entry_id = entry_id_input AND user_id = user_id_input) THEN
    DELETE FROM challenge_upvotes WHERE entry_id = entry_id_input AND user_id = user_id_input;
    UPDATE challenge_entries SET upvotes_count = upvotes_count - 1 WHERE id = entry_id_input;
  ELSE
    INSERT INTO challenge_upvotes (entry_id, user_id) VALUES (entry_id_input, user_id_input);
    UPDATE challenge_entries SET upvotes_count = upvotes_count + 1 WHERE id = entry_id_input;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_upvotes ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for now)
CREATE POLICY "Public challenges are viewable by everyone" ON challenges FOR SELECT USING (true);
CREATE POLICY "Public entries are viewable by everyone" ON challenge_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert their own entries" ON challenge_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can register themselves" ON challenge_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public upvotes are viewable by everyone" ON challenge_upvotes FOR SELECT USING (true);

-- Insert the first challenge if not exists
INSERT INTO challenges (title, description, prize_amount, end_date)
SELECT '3-Page Comic Story Challenge', 'Create a compelling 3-page comic story using AI. Master the art of prompting and consistent character generation.', '$10 USD', NOW() + INTERVAL '7 days'
WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE title = '3-Page Comic Story Challenge');
