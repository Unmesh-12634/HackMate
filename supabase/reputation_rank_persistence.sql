-- REPUTATION, RANK & ACTIVITY SETUP (v3)
-- Run this in your Supabase SQL Editor to enable real-time stats and activity tracking.

-- 1. ENSURE PROFILES COLUMNS EXIST
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS reputation_points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prestige_rank text DEFAULT 'Operative',
  ADD COLUMN IF NOT EXISTS follower_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;

-- 2. CREATE ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS public.activities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type text NOT NULL,
    entity_type text,
    entity_id text,
    description text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Allow users to read all activities (social feed)
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON public.activities;
CREATE POLICY "Activities are viewable by everyone" ON public.activities
    FOR SELECT USING (true);

-- Allow users to insert their own activities
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.activities;
CREATE POLICY "Users can insert their own activities" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. RANK CALCULATION LOGIC
CREATE OR REPLACE FUNCTION public.calculate_prestige_rank(points integer)
RETURNS text AS $$
BEGIN
    IF points >= 2000 THEN RETURN 'Commander';
    ELSIF points >= 500 THEN RETURN 'Elite';
    ELSIF points >= 100 THEN RETURN 'Specialist';
    ELSE RETURN 'Operative';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. TRIGGER FOR AUTOMATIC RANK UPDATES
CREATE OR REPLACE FUNCTION public.on_reputation_change()
RETURNS TRIGGER AS $$
BEGIN
    NEW.prestige_rank := public.calculate_prestige_rank(COALESCE(NEW.reputation_points, 0));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_on_reputation_change ON public.profiles;
CREATE TRIGGER tr_on_reputation_change
BEFORE INSERT OR UPDATE OF reputation_points ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.on_reputation_change();

-- 5. INITIAL SYNC
UPDATE public.profiles SET 
  prestige_rank = public.calculate_prestige_rank(COALESCE(reputation_points, 0));

-- 6. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
