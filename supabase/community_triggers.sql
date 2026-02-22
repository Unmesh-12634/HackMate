-- REAL-TIME COUNTERS FOR COMMUNITY
-- Run this in your Supabase SQL Editor to enable automatic likes/comments count updates.

-- 1. FUNCTION: Sync Post Likes Count
CREATE OR REPLACE FUNCTION public.handle_post_like_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts 
        SET likes_count = likes_count + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts 
        SET likes_count = GREATEST(0, likes_count - 1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRIGGER: On Like Insert/Delete
DROP TRIGGER IF EXISTS tr_on_post_like ON public.post_likes;
CREATE TRIGGER tr_on_post_like
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE PROCEDURE public.handle_post_like_sync();

-- 3. FUNCTION: Sync Post Comments Count
CREATE OR REPLACE FUNCTION public.handle_post_comment_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts 
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts 
        SET comments_count = GREATEST(0, comments_count - 1)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGER: On Comment Insert/Delete
DROP TRIGGER IF EXISTS tr_on_post_comment ON public.comments;
CREATE TRIGGER tr_on_post_comment
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE PROCEDURE public.handle_post_comment_sync();

-- 5. RELOAD SCHEMA CACHE (Nudge PostgREST)
NOTIFY pgrst, 'reload schema';
