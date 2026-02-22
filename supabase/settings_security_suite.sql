-- SETTINGS & SECURITY INFRASTRUCTURE (v1)
-- Run this in your Supabase SQL Editor to enable real-time preferences and session monitoring.

-- 1. ENHANCE PROFILES WITH PREFERENCES
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
    "theme": "dark",
    "notifications": {
      "team_invites": true,
      "task_updates": true,
      "mentions": true,
      "platform_news": true
    },
    "privacy": {
      "profile_visible": true,
      "show_reputation": true
    }
  }'::jsonb;

-- 2. CREATE USER SESSIONS TABLE (SECURITY MONITORING)
-- This table will store non-sensitive metadata about active/past logins.
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    device_type text,
    browser text,
    os text,
    ip_address text,
    location text,
    last_active timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- 3. FUNCTION TO TRACK SESSIONS (Can be called from AppContext on load)
CREATE OR REPLACE FUNCTION public.sync_user_session(
    p_device_type text,
    p_browser text,
    p_os text,
    p_ip text,
    p_location text
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.user_sessions (user_id, device_type, browser, os, ip_address, location)
    VALUES (auth.uid(), p_device_type, p_browser, p_os, p_ip, p_location)
    ON CONFLICT (id) DO UPDATE SET 
        last_active = now(),
        is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
