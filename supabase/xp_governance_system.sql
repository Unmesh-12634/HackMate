-- =============================================================================
-- XP GOVERNANCE SYSTEM (v1.0) - OPTION A: TRIGGER-STRICT
-- =============================================================================
-- This script implements automated XP rewards and penalties enforced by DB triggers.
-- It ensures that XP is only granted for on-time performance and fixed badge values.
-- =============================================================================

-- 1. GOVERNANCE CONFIGURATION TABLE
-- Stores fixed XP values to avoid hardcoding in functions.
CREATE TABLE IF NOT EXISTS public.governance_config (
    key TEXT PRIMARY KEY,
    value INT NOT NULL,
    description TEXT
);

INSERT INTO public.governance_config (key, value, description) VALUES
('task_on_time_xp', 50, 'XP awarded for completing a task before the deadline'),
('task_late_penalty_xp', 30, 'XP deducted for completing a task after the deadline'),
('team_project_on_time_xp', 500, 'XP awarded to all team members if project is shipped on time'),
('team_project_late_penalty_xp', 200, 'XP deducted from all team members if project is shipped late')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. BADGE DEFINITIONS TABLE
-- Fixed XP values for each badge.
CREATE TABLE IF NOT EXISTS public.badge_definitions (
    name TEXT PRIMARY KEY,
    xp_reward INT NOT NULL
);

INSERT INTO public.badge_definitions (name, xp_reward) VALUES
('First Blood', 100),
('The Cleaner', 150),
('GitHub Pro', 200),
('Rapid Responder', 100),
('Documentarian', 120),
('Bug Hunter', 180)
ON CONFLICT (name) DO UPDATE SET xp_reward = EXCLUDED.xp_reward;

-- 3. SCHEMA UPDATES
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS project_deadline TIMESTAMP WITH TIME ZONE;

-- 4. HELPER FUNCTION: GET CONFIG VALUE
CREATE OR REPLACE FUNCTION public.get_gov_xp(p_key TEXT)
RETURNS INT AS $$
BEGIN
    RETURN (SELECT value FROM public.governance_config WHERE key = p_key);
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. TASK XP TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_task_xp_governance()
RETURNS TRIGGER AS $$
DECLARE
    v_xp_change INT;
BEGIN
    -- Only trigger when task moves to 'done'
    IF (NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done')) THEN
        -- Check if deadline exists and was met
        IF (NEW.deadline IS NULL OR NOW() <= NEW.deadline) THEN
            v_xp_change := public.get_gov_xp('task_on_time_xp');
        ELSE
            v_xp_change := -public.get_gov_xp('task_late_penalty_xp');
        END IF;

        -- Apply XP change to the assignee's membership in the specific team
        IF (NEW.assignee_id IS NOT NULL) THEN
            UPDATE public.memberships 
            SET xp = xp + v_xp_change,
                tasks_completed = tasks_completed + CASE WHEN v_xp_change > 0 THEN 1 ELSE 0 END
            WHERE user_id = NEW.assignee_id AND team_id = NEW.team_id;
            
            -- Log Notification
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (
                NEW.assignee_id, 
                CASE WHEN v_xp_change > 0 THEN 'XP Gained!' ELSE 'XP Penalty' END,
                CASE WHEN v_xp_change > 0 
                     THEN 'You gained ' || v_xp_change || ' XP for completing "' || NEW.title || '" on time.'
                     ELSE 'You lost ' || ABS(v_xp_change) || ' XP for completing "' || NEW.title || '" late.'
                END,
                CASE WHEN v_xp_change > 0 THEN 'success' ELSE 'error' END
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. BADGE XP TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_badge_xp_governance()
RETURNS TRIGGER AS $$
DECLARE
    v_badge TEXT;
    v_xp_reward INT;
BEGIN
    -- Check for newly added badges in the JSONB array
    -- Logic: For each element in NEW.badges that is NOT in OLD.badges...
    FOR v_badge IN 
        SELECT n.val 
        FROM jsonb_array_elements_text(NEW.badges) AS n(val)
        WHERE NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(COALESCE(OLD.badges, '[]'::jsonb)) AS o(val)
            WHERE o.val = n.val
        )
    LOOP
        -- Look up the reward for this badge
        SELECT xp_reward INTO v_xp_reward FROM public.badge_definitions WHERE name = v_badge;
        
        IF (v_xp_reward IS NOT NULL) THEN
            NEW.xp := NEW.xp + v_xp_reward;
            
            -- Log Notification
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (
                NEW.user_id, 
                'Badge Earned: ' || v_badge,
                'You earned the "' || v_badge || '" badge and gained ' || v_xp_reward || ' XP!',
                'success'
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. TEAM PROJECT COMPLETION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_team_project_xp_governance()
RETURNS TRIGGER AS $$
DECLARE
    v_xp_change INT;
BEGIN
    -- Only trigger when team status moves to 'Shipped'
    IF (NEW.status = 'Shipped' AND (OLD.status IS NULL OR OLD.status != 'Shipped')) THEN
        -- Check project deadline
        IF (NEW.project_deadline IS NULL OR NOW() <= NEW.project_deadline) THEN
            v_xp_change := public.get_gov_xp('team_project_on_time_xp');
        ELSE
            v_xp_change := -public.get_gov_xp('team_project_late_penalty_xp');
        END IF;

        -- Apply to all members
        UPDATE public.memberships 
        SET xp = xp + v_xp_change
        WHERE team_id = NEW.id;
        
        -- Notify all members
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT 
            user_id, 
            CASE WHEN v_xp_change > 0 THEN 'Project Shipped!' ELSE 'Project Late' END,
            CASE WHEN v_xp_change > 0 
                 THEN 'Team ' || NEW.name || ' finished on time! Everyone gained ' || v_xp_change || ' XP.'
                 ELSE 'Team ' || NEW.name || ' finished late. Everyone lost ' || ABS(v_xp_change) || ' XP.'
            END,
            CASE WHEN v_xp_change > 0 THEN 'success' ELSE 'error' END
        FROM public.memberships
        WHERE team_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CREATE TRIGGERS
DROP TRIGGER IF EXISTS tr_task_xp_governance ON public.tasks;
CREATE TRIGGER tr_task_xp_governance
    AFTER UPDATE OF status ON public.tasks
    FOR EACH ROW EXECUTE PROCEDURE public.handle_task_xp_governance();

DROP TRIGGER IF EXISTS tr_badge_xp_governance ON public.memberships;
CREATE TRIGGER tr_badge_xp_governance
    BEFORE UPDATE OF badges ON public.memberships
    FOR EACH ROW EXECUTE PROCEDURE public.handle_badge_xp_governance();

DROP TRIGGER IF EXISTS tr_team_project_xp_governance ON public.teams;
CREATE TRIGGER tr_team_project_xp_governance
    AFTER UPDATE OF status ON public.teams
    FOR EACH ROW EXECUTE PROCEDURE public.handle_team_project_xp_governance();

-- 9. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
