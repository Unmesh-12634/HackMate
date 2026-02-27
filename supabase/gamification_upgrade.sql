-- =============================================================================
-- Advanced Gamification & Reputation Upgrade
-- Adds XP, Tasks Completed, and Badges to the memberships table
-- Run in Supabase SQL Editor
-- =============================================================================

-- 1. Add XP tracker (integer, defaults to 0)
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0;

-- 2. Add tasks completed counter (integer, defaults to 0)
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS tasks_completed INT DEFAULT 0;

-- 3. Add badges array (JSONB, defaults to empty array)
-- Schema: ['First Blood', 'The Cleaner', etc.]
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- 4. Grant update access to authenticated users
GRANT UPDATE (xp, tasks_completed, badges) ON memberships TO authenticated;

-- =============================================================================
-- Verification:
-- SELECT id, user_id, team_id, xp, tasks_completed, badges FROM memberships LIMIT 5;
-- =============================================================================
