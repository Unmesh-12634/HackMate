-- XP & STREAK PERSISTENCE UPGRADE
-- Adds core gamification columns to the global profiles table

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS streak_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS bounties_claimed text[] DEFAULT '{}';

-- Index for leaderboard performance
CREATE INDEX IF NOT EXISTS idx_profiles_xp_rank ON public.profiles(total_xp DESC, reputation_points DESC);

-- Update RLS (if needed, profiles is usually readable by all, but writeable by own)
-- Profiles usually has a policy: "Users can update own profile"
