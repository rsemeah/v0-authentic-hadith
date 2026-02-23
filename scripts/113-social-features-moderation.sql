-- =============================================
-- 113: Social Features + Discussion Moderation
-- Adds: follows, friend_requests, moderation on discussions, reports, rate limiting
-- =============================================

-- =============================================
-- 1. ALTER discussions table: add moderation columns
-- =============================================
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved';
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS moderation_reason text;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS moderated_at timestamptz;
ALTER TABLE discussions ADD COLUMN IF NOT EXISTS moderated_by text; -- 'ai' or admin user_id

-- Index for filtering by moderation status
CREATE INDEX IF NOT EXISTS idx_discussions_moderation ON discussions(moderation_status);
CREATE INDEX IF NOT EXISTS idx_discussions_hadith_status ON discussions(hadith_id, moderation_status);

-- Update RLS: only show approved discussions to public
DROP POLICY IF EXISTS "Anyone can read discussions" ON discussions;
CREATE POLICY "Anyone can read approved discussions" ON discussions
  FOR SELECT USING (
    moderation_status = 'approved'
    OR user_id = auth.uid()  -- authors can see their own held/rejected posts
  );

-- =============================================
-- 2. User Follows (one-way, free tier)
-- =============================================
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id) -- can't follow yourself
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see follows" ON user_follows
  FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON user_follows
  FOR DELETE USING (auth.uid() = follower_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON user_follows(following_id);

-- =============================================
-- 3. Friend Requests (mutual, paid tier)
-- =============================================
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own requests" ON friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send requests" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can update request" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY "Users can delete own sent requests" ON friend_requests
  FOR DELETE USING (auth.uid() = sender_id);

CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id, status);

-- =============================================
-- 4. Friends view (accepted requests in either direction)
-- =============================================
CREATE OR REPLACE VIEW friends AS
SELECT
  CASE WHEN sender_id = auth.uid() THEN receiver_id ELSE sender_id END AS friend_id,
  responded_at AS friends_since
FROM friend_requests
WHERE status = 'accepted'
  AND (sender_id = auth.uid() OR receiver_id = auth.uid());

-- =============================================
-- 5. Content Reports
-- =============================================
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL, -- 'discussion' or 'reply'
  content_id uuid NOT NULL,   -- references discussions.id
  reason text NOT NULL,        -- 'inappropriate', 'sectarian', 'spam', 'harassment', 'other'
  details text,                -- optional user description
  status text NOT NULL DEFAULT 'pending', -- pending, reviewed, dismissed, actioned
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  action_taken text,           -- 'none', 'hidden', 'deleted', 'warned'
  created_at timestamptz DEFAULT now(),
  UNIQUE(reporter_id, content_type, content_id) -- one report per user per content
);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own reports" ON content_reports
  FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can submit reports" ON content_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
-- Admins update via service role (bypasses RLS)

CREATE INDEX IF NOT EXISTS idx_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_content ON content_reports(content_type, content_id);

-- =============================================
-- 6. Discussion rate limiting table
-- =============================================
CREATE TABLE IF NOT EXISTS discussion_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  post_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, usage_date)
);

ALTER TABLE discussion_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own usage" ON discussion_usage
  FOR SELECT USING (auth.uid() = user_id);
-- Insert/update via service role for atomic operations

-- =============================================
-- 7. Add follower/following counts to profiles (cached)
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS friends_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;

-- =============================================
-- 8. Triggers to maintain follow/friend counts
-- =============================================
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
    UPDATE profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE user_id = OLD.follower_id;
    UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE user_id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_follow_counts ON user_follows;
CREATE TRIGGER trg_follow_counts
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

CREATE OR REPLACE FUNCTION update_friend_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    UPDATE profiles SET friends_count = friends_count + 1 WHERE user_id = NEW.sender_id;
    UPDATE profiles SET friends_count = friends_count + 1 WHERE user_id = NEW.receiver_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_friend_counts ON friend_requests;
CREATE TRIGGER trg_friend_counts
  AFTER UPDATE ON friend_requests
  FOR EACH ROW EXECUTE FUNCTION update_friend_counts();

-- =============================================
-- 9. Achievement: social engagement
-- =============================================
INSERT INTO achievements (slug, name_en, description_en, icon, category, tier, criteria, xp_reward, display_order)
VALUES
  ('first_post', 'First Voice', 'Share your first discussion post', '💬', 'social', 1, '{"type": "discussion_post_count", "threshold": 1}', 15, 30),
  ('active_contributor', 'Active Contributor', 'Write 10 discussion posts', '🗣️', 'social', 2, '{"type": "discussion_post_count", "threshold": 10}', 50, 31),
  ('community_pillar', 'Community Pillar', 'Write 50 discussion posts', '🏛️', 'social', 3, '{"type": "discussion_post_count", "threshold": 50}', 150, 32),
  ('first_follow', 'Connected', 'Follow your first user', '🤝', 'social', 1, '{"type": "following_count", "threshold": 1}', 10, 33),
  ('social_butterfly', 'Social Butterfly', 'Follow 10 users', '🦋', 'social', 2, '{"type": "following_count", "threshold": 10}', 40, 34)
ON CONFLICT (slug) DO NOTHING;

-- Add discussion-related stats to user_stats
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS discussion_post_count integer DEFAULT 0;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;
