-- FIX MISSING COLUMNS IN COMMUNITY TABLES
-- Run this in your Supabase SQL Editor to ensure the schema matches the application code.

-- 1. ENHANCE POSTS TABLE
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS code_snippet text,
  ADD COLUMN IF NOT EXISTS code_language text,
  ADD COLUMN IF NOT EXISTS project_details jsonb DEFAULT '{}'::jsonb;

-- 2. ENHANCE COMMENTS TABLE
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE;

-- 3. REFRESH SCHEMA CACHE (Optional but recommended)
-- This happens automatically in Supabase usually, but running an arbitrary SELECT can sometimes trigger it.
SELECT * FROM public.posts LIMIT 1;
