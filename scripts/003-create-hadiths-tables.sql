-- Create hadiths table
CREATE TABLE IF NOT EXISTS hadiths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arabic_text TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  collection TEXT NOT NULL,
  book_number INTEGER,
  hadith_number INTEGER,
  reference TEXT,
  grade TEXT CHECK (grade IN ('sahih', 'hasan', 'daif')) DEFAULT 'sahih',
  narrator TEXT,
  is_featured BOOLEAN DEFAULT false,
  featured_date DATE,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hadith_views table for tracking recently viewed
CREATE TABLE IF NOT EXISTS hadith_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hadith_id UUID NOT NULL REFERENCES hadiths(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hadith_id)
);

-- Create saved_hadiths table for bookmarks
CREATE TABLE IF NOT EXISTS saved_hadiths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hadith_id UUID NOT NULL REFERENCES hadiths(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hadith_id)
);

-- Enable RLS
ALTER TABLE hadiths ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadith_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_hadiths ENABLE ROW LEVEL SECURITY;

-- Hadiths are publicly readable
CREATE POLICY "Anyone can read hadiths" ON hadiths
  FOR SELECT USING (true);

-- Users can only see their own views
CREATE POLICY "Users can read own views" ON hadith_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own views" ON hadith_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own views" ON hadith_views
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only manage their own saved hadiths
CREATE POLICY "Users can read own saved" ON saved_hadiths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved" ON saved_hadiths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved" ON saved_hadiths
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hadiths_featured ON hadiths(is_featured, featured_date);
CREATE INDEX IF NOT EXISTS idx_hadith_views_user ON hadith_views(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_hadiths_user ON saved_hadiths(user_id, created_at DESC);
