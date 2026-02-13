-- Subscription tier enum
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'lifetime');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'cancelled', 'expired', 'past_due');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add subscription columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  subscription_tier subscription_tier DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  subscription_status subscription_status DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  subscription_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  subscription_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  subscription_cancel_at_period_end BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  stripe_customer_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  stripe_subscription_id TEXT UNIQUE;

-- Tier quotas configuration
CREATE TABLE IF NOT EXISTS tier_quotas (
  tier subscription_tier PRIMARY KEY,
  ai_queries_per_day INTEGER NOT NULL,
  ai_queries_per_month INTEGER NOT NULL,
  saved_hadith_limit INTEGER NOT NULL,
  can_use_advanced_search BOOLEAN DEFAULT false,
  can_use_semantic_search BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed tier quotas
INSERT INTO tier_quotas (tier, ai_queries_per_day, ai_queries_per_month, saved_hadith_limit, can_use_advanced_search, can_use_semantic_search, priority_support) VALUES
  ('free', 0, 0, 10, false, false, false),
  ('premium', 50, 500, 500, true, true, true),
  ('lifetime', -1, -1, -1, true, true, true)
ON CONFLICT (tier) DO UPDATE SET
  ai_queries_per_day = EXCLUDED.ai_queries_per_day,
  ai_queries_per_month = EXCLUDED.ai_queries_per_month,
  saved_hadith_limit = EXCLUDED.saved_hadith_limit,
  can_use_advanced_search = EXCLUDED.can_use_advanced_search,
  can_use_semantic_search = EXCLUDED.can_use_semantic_search,
  priority_support = EXCLUDED.priority_support;

-- User usage tracking
CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_queries_today INTEGER DEFAULT 0,
  ai_queries_this_month INTEGER DEFAULT 0,
  saved_hadith_count INTEGER DEFAULT 0,
  last_daily_reset DATE DEFAULT CURRENT_DATE,
  last_monthly_reset DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe events idempotency table (if not exists)
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_last_reset ON user_usage(last_daily_reset);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- RLS policies
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_quotas ENABLE ROW LEVEL SECURITY;

-- User usage RLS
DO $$ BEGIN
  CREATE POLICY "Users can view own usage"
    ON user_usage FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage usage"
    ON user_usage FOR ALL
    TO service_role
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tier quotas readable by all authenticated users
DO $$ BEGIN
  CREATE POLICY "Authenticated users can read tier quotas"
    ON tier_quotas FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Atomic increment function
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO user_usage (user_id, ai_queries_today, ai_queries_this_month, last_daily_reset, last_monthly_reset)
  VALUES (p_user_id, 1, 1, v_today, v_today)
  ON CONFLICT (user_id) DO UPDATE SET
    ai_queries_today = CASE
      WHEN user_usage.last_daily_reset < v_today THEN 1
      ELSE user_usage.ai_queries_today + 1
    END,
    ai_queries_this_month = CASE
      WHEN EXTRACT(MONTH FROM user_usage.last_monthly_reset) < EXTRACT(MONTH FROM v_today)
        OR EXTRACT(YEAR FROM user_usage.last_monthly_reset) < EXTRACT(YEAR FROM v_today)
      THEN 1
      ELSE user_usage.ai_queries_this_month + 1
    END,
    last_daily_reset = v_today,
    last_monthly_reset = CASE
      WHEN EXTRACT(MONTH FROM user_usage.last_monthly_reset) < EXTRACT(MONTH FROM v_today)
        OR EXTRACT(YEAR FROM user_usage.last_monthly_reset) < EXTRACT(YEAR FROM v_today)
      THEN v_today
      ELSE user_usage.last_monthly_reset
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user quota status
CREATE OR REPLACE FUNCTION check_user_quota(p_user_id UUID)
RETURNS TABLE(
  allowed BOOLEAN,
  daily_remaining INTEGER,
  monthly_remaining INTEGER,
  daily_limit INTEGER,
  monthly_limit INTEGER,
  tier subscription_tier
) AS $$
DECLARE
  v_tier subscription_tier;
  v_usage RECORD;
  v_quota RECORD;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get user tier
  SELECT p.subscription_tier INTO v_tier
  FROM profiles p
  WHERE p.user_id = p_user_id;

  IF v_tier IS NULL THEN
    v_tier := 'free';
  END IF;

  -- Get tier quotas
  SELECT * INTO v_quota
  FROM tier_quotas tq
  WHERE tq.tier = v_tier;

  -- Lifetime = always allowed
  IF v_tier = 'lifetime' THEN
    RETURN QUERY SELECT true, -1, -1, -1, -1, v_tier;
    RETURN;
  END IF;

  -- Get or create usage record
  SELECT * INTO v_usage
  FROM user_usage
  WHERE user_usage.user_id = p_user_id;

  IF v_usage IS NULL THEN
    INSERT INTO user_usage (user_id, ai_queries_today, ai_queries_this_month)
    VALUES (p_user_id, 0, 0);

    RETURN QUERY SELECT
      (v_quota.ai_queries_per_day > 0),
      v_quota.ai_queries_per_day,
      v_quota.ai_queries_per_month,
      v_quota.ai_queries_per_day,
      v_quota.ai_queries_per_month,
      v_tier;
    RETURN;
  END IF;

  -- Reset counters if needed
  IF v_usage.last_daily_reset < v_today THEN
    UPDATE user_usage uu
    SET ai_queries_today = 0, last_daily_reset = v_today
    WHERE uu.user_id = p_user_id;
    v_usage.ai_queries_today := 0;
  END IF;

  IF EXTRACT(MONTH FROM v_usage.last_monthly_reset) < EXTRACT(MONTH FROM v_today)
    OR EXTRACT(YEAR FROM v_usage.last_monthly_reset) < EXTRACT(YEAR FROM v_today)
  THEN
    UPDATE user_usage uu
    SET ai_queries_this_month = 0, last_monthly_reset = v_today
    WHERE uu.user_id = p_user_id;
    v_usage.ai_queries_this_month := 0;
  END IF;

  -- Check quotas
  RETURN QUERY SELECT
    (v_usage.ai_queries_today < v_quota.ai_queries_per_day
     AND (v_quota.ai_queries_per_month = -1 OR v_usage.ai_queries_this_month < v_quota.ai_queries_per_month)),
    v_quota.ai_queries_per_day - v_usage.ai_queries_today,
    CASE
      WHEN v_quota.ai_queries_per_month = -1 THEN -1
      ELSE v_quota.ai_queries_per_month - v_usage.ai_queries_this_month
    END,
    v_quota.ai_queries_per_day,
    v_quota.ai_queries_per_month,
    v_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
