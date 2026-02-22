-- CONSOLIDATED COMMUNITY UPDATE (v2)
-- Run this in your Supabase SQL Editor to enable all new features.

-- 1. ADD MISSING COLUMNS
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS code_snippet text,
  ADD COLUMN IF NOT EXISTS code_language text,
  ADD COLUMN IF NOT EXISTS project_details jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count integer DEFAULT 0;

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;

-- 2. CREATE SYNC FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_post_like_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts 
        SET likes_count = COALESCE(likes_count, 0) + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts 
        SET likes_count = GREATEST(0, COALESCE(likes_count, 1) - 1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_post_comment_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts 
        SET comments_count = COALESCE(comments_count, 0) + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts 
        SET comments_count = GREATEST(0, COALESCE(comments_count, 1) - 1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE TRIGGERS
DROP TRIGGER IF EXISTS tr_on_post_like ON public.post_likes;
CREATE TRIGGER tr_on_post_like
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE PROCEDURE public.handle_post_like_sync();

DROP TRIGGER IF EXISTS tr_on_post_comment ON public.comments;
CREATE TRIGGER tr_on_post_comment
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE PROCEDURE public.handle_post_comment_sync();

-- 4. INITIAL SYNC (Optional: Run if you have existing data)
-- UPDATE public.posts p SET 
--   likes_count = (SELECT count(*) FROM public.post_likes WHERE post_id = p.id),
--   comments_count = (SELECT count(*) FROM public.comments WHERE post_id = p.id);

-- 5. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
