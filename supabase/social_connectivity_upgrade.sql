-- SOCIAL CONNECTIVITY UPGRADE (v1)
-- Run this in your Supabase SQL Editor to enable follower/following counts and real-time syncing.

-- 1. ADD COLUMNS TO PROFILES (If not already there)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS follower_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer DEFAULT 0;

-- 2. CREATE SYNC FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_follower_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Increase follower count for the one being followed
        UPDATE public.profiles 
        SET follower_count = COALESCE(follower_count, 0) + 1
        WHERE id = NEW.following_id;
        
        -- Increase following count for the one doing the following
        UPDATE public.profiles 
        SET following_count = COALESCE(following_count, 0) + 1
        WHERE id = NEW.follower_id;
    ELSIF (TG_OP = 'DELETE') THEN
        -- Decrease follower count
        UPDATE public.profiles 
        SET follower_count = GREATEST(0, COALESCE(follower_count, 1) - 1)
        WHERE id = OLD.following_id;
        
        -- Decrease following count
        UPDATE public.profiles 
        SET following_count = GREATEST(0, COALESCE(following_count, 1) - 1)
        WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE TRIGGERS
DROP TRIGGER IF EXISTS tr_on_follower_change ON public.followers;
CREATE TRIGGER tr_on_follower_change
AFTER INSERT OR DELETE ON public.followers
FOR EACH ROW EXECUTE PROCEDURE public.handle_follower_sync();

-- 4. INITIAL SYNC (Optional: Run if you have existing data)
UPDATE public.profiles p SET 
  follower_count = (SELECT count(*) FROM public.followers WHERE following_id = p.id),
  following_count = (SELECT count(*) FROM public.followers WHERE follower_id = p.id);

-- 5. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
