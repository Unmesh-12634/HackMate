-- =========================================================================================
-- HACKMATE 2026: PHASE 11 - CONTEXTUAL CHAT INTERACTIONS
-- =========================================================================================

-- 1. Extend the direct_messages table
ALTER TABLE public.direct_messages
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- 2. Create an RPC function to safely toggle emoji reactions
-- Since multiple people could react at once, doing a read-modify-write on the client could cause race conditions.
-- This function securely updates the JSONB block on the server side.

CREATE OR REPLACE FUNCTION toggle_direct_message_reaction(
    msg_id UUID,
    emoji TEXT,
    reactor_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_reactions JSONB;
    user_array JSONB;
    user_index INT;
BEGIN
    -- Get current reactions or initialize empty
    SELECT COALESCE(reactions, '{}'::jsonb) INTO current_reactions
    FROM public.direct_messages
    WHERE id = msg_id;

    -- If the emoji doesn't exist yet, initialize it as empty array
    IF NOT current_reactions ? emoji THEN
        current_reactions := jsonb_set(current_reactions, ARRAY[emoji], '[]'::jsonb);
    END IF;

    -- Extract the array for this specific emoji
    user_array := current_reactions -> emoji;

    -- Check if the user is already in the array
    SELECT position - 1 INTO user_index
    FROM jsonb_array_elements_text(user_array) WITH ORDINALITY arr(val, position)
    WHERE val = reactor_id::text;

    IF user_index IS NOT NULL THEN
        -- User exists -> TOGGLE OFF (Remove them)
        user_array := user_array - user_index;
    ELSE
        -- User doesn't exist -> TOGGLE ON (Add them)
        user_array := user_array || jsonb_build_array(reactor_id::text);
    END IF;

    -- Clean up: If no one has this reaction anymore, remove the emoji key entirely
    IF jsonb_array_length(user_array) = 0 THEN
        current_reactions := current_reactions - emoji;
    ELSE
        -- Otherwise update the key with the new array
        current_reactions := jsonb_set(current_reactions, ARRAY[emoji], user_array);
    END IF;

    -- Save back to DB
    UPDATE public.direct_messages
    SET reactions = current_reactions
    WHERE id = msg_id;
END;
$$;
