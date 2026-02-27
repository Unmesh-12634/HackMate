-- MISSION DEBRIEF & XP ENGINE UPGRADES

-- 1. Extend Teams Table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS mission_goal TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_mission_name TEXT DEFAULT 'Initial Deployment';

-- 2. Create Mission Archives Table (Option C: Neural Branching)
CREATE TABLE IF NOT EXISTS public.mission_archives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    mission_name TEXT NOT NULL,
    mission_goal TEXT,
    deadline TIMESTAMPTZ,
    completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    final_stats JSONB DEFAULT '{}'::jsonb, -- Store snapshot of tasks/members/performance
    leader_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on archives
ALTER TABLE public.mission_archives ENABLE ROW LEVEL SECURITY;

-- Archives Policy: Team members only
CREATE POLICY "Team members can view mission archives" 
ON public.mission_archives FOR SELECT 
USING (
    auth.uid() IN (
        SELECT user_id FROM public.memberships WHERE team_id = mission_archives.team_id
    )
);

-- 3. Extend Profiles for Robust XP Tracking
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;

-- 4. Function to recalculate level based on XP (Simple Leveling Logic)
CREATE OR REPLACE FUNCTION public.calculate_level(xp INT)
RETURNS INT AS $$
BEGIN
    RETURN floor(sqrt(xp / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to auto-update level when total_xp changes
CREATE OR REPLACE FUNCTION public.sync_profile_level()
RETURNS TRIGGER AS $$
BEGIN
    NEW.level := public.calculate_level(NEW.total_xp);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_xp_update
BEFORE UPDATE OF total_xp ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.sync_profile_level();

-- 5. Helper function for Leader to finalize mission
-- This can be called via rpc() from the frontend
CREATE OR REPLACE FUNCTION public.finalize_team_mission(
    t_id UUID, 
    m_name TEXT, 
    m_goal TEXT, 
    m_stats JSONB, 
    l_summary TEXT
)
RETURNS VOID AS $$
DECLARE
    team_record RECORD;
BEGIN
    -- 1. Get current team data
    SELECT * INTO team_record FROM public.teams WHERE id = t_id;
    
    -- 2. Archive current mission
    INSERT INTO public.mission_archives (
        team_id, mission_name, mission_goal, deadline, completed_at, final_stats, leader_summary
    ) VALUES (
        t_id, team_record.current_mission_name, team_record.mission_goal, team_record.deadline, now(), m_stats, l_summary
    );
    
    -- 3. Update team status
    UPDATE public.teams 
    SET 
        status = 'Shipped',
        completed_at = now()
    WHERE id = t_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
