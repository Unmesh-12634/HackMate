-- supabase/team_github_upgrades.sql
-- Add JSONB array column to store multiple GitHub repositories linked to a team

ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS github_repos JSONB DEFAULT '[]'::jsonb;

-- Optional: If you want to migrate existing single repos to the new array column implicitly:
-- UPDATE public.teams SET github_repos = jsonb_build_array(github_repo) WHERE github_repo IS NOT NULL;
    