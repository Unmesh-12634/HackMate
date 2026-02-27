-- =============================================================================
-- Task Management Upgrade
-- Adds review workflow, sub-tasks, and effort estimate to tasks table
-- Run in Supabase SQL Editor
-- =============================================================================

-- 1. Add review_assignee_id for the "Send for Review" feature
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS review_assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add subtasks as lightweight JSONB (no extra join needed)
-- Schema: [{ "id": "uuid", "title": "...", "done": false }]
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;

-- 3. Add estimated hours for effort tracking
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours INT DEFAULT NULL;

-- 4. Index for review assignments (useful for future review-dashboard queries)
CREATE INDEX IF NOT EXISTS tasks_review_assignee_idx ON tasks(review_assignee_id) WHERE review_assignee_id IS NOT NULL;

-- 5. Grant column access to authenticated users
GRANT UPDATE (review_assignee_id, subtasks, estimated_hours) ON tasks TO authenticated;

-- =============================================================================
-- Verification:
-- SELECT id, title, review_assignee_id, subtasks, estimated_hours FROM tasks LIMIT 5;
-- =============================================================================
