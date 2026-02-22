-- Migration: Profile Upgrades & GitHub Integration Groundwork
-- Description: Adds the `activities` table for real-time profile graphs and adds GitHub placeholder columns to `profiles`.

-- 1. Add GitHub columns to profiles for future OAuth integration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS github_username text,
ADD COLUMN IF NOT EXISTS github_access_token text; -- Should be encrypted in a real prod scenario

-- 2. Add is_pinned to memberships for "Pinned Projects" feature
ALTER TABLE public.memberships
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;

-- 3. Create the Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    action_type text NOT NULL, -- e.g., 'created_task', 'joined_team', 'pushed_commit'
    entity_type text, -- e.g., 'task', 'team', 'repository'
    entity_id text, -- ID of the related entity
    description text NOT NULL, -- e.g., 'Completed fixing the navbar'
    metadata jsonb DEFAULT '{}'::jsonb, -- Extra data (e.g., github commit sha)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Activities
-- Users can view their own activities (for the profile graph)
CREATE POLICY "Users can view their own activities"
    ON public.activities FOR SELECT
    USING (auth.uid() = user_id);

-- System/Users can insert their own activities
CREATE POLICY "Users can insert their own activities"
    ON public.activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. Enable Realtime for activities table
-- This allows the Supabase client to subscribe to changes instantly
begin;
  -- remove the supabase_realtime publication if it exists to recreate it
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.activities;

-- 7. Add some indexes for faster querying on the heatmap
CREATE INDEX IF NOT EXISTS idx_activities_user_created ON public.activities(user_id, created_at DESC);
