-- BOUNTY MATRIX SCHEMA (v1)
-- This table tracks missions/tasks that users can claim for XP and ranking progression.

CREATE TABLE IF NOT EXISTS public.bounties (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    type text DEFAULT 'mission' CHECK (type IN ('hack', 'design', 'research', 'bug', 'mission')),
    difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'legendary')),
    reward_xp integer DEFAULT 50,
    status text DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'completed', 'failed')),
    claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
    github_issue_url text,
    deadline timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;

-- 1. ADVISOR: Viewable by everyone
DROP POLICY IF EXISTS "Bounties are viewable by everyone" ON public.bounties;
CREATE POLICY "Bounties are viewable by everyone" ON public.bounties
    FOR SELECT USING (true);

-- 2. OPERATIVE: Users can create bounties (if they are team leaders or staff eventually)
-- For now, allow any authenticated user to create (will refine with team roles later)
DROP POLICY IF EXISTS "Authenticated users can create bounties" ON public.bounties;
CREATE POLICY "Authenticated users can create bounties" ON public.bounties
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. TACTICAL: Claiming a bounty
DROP POLICY IF EXISTS "Users can claim open bounties" ON public.bounties;
CREATE POLICY "Users can claim open bounties" ON public.bounties
    FOR UPDATE 
    USING (status = 'open')
    WITH CHECK (auth.uid() IS NOT NULL);

-- 4. COMMAND: Bounty creators can update/complete their own bounties
DROP POLICY IF EXISTS "Creators can manage their own bounties" ON public.bounties;
CREATE POLICY "Creators can manage their own bounties" ON public.bounties
    FOR UPDATE
    USING (auth.uid() = created_by);

-- REFRESH SCHEMA
NOTIFY pgrst, 'reload schema';
