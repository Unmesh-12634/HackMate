
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve('.env');
let env = {};
try {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });
} catch (e) {
    console.log("Could not read .env file");
}

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyTrigger() {
    console.log("Applying Status Notification Trigger...");

    // Read SQL file
    const sqlPath = path.join('C:', 'Users', 'hp', '.gemini', 'antigravity', 'brain', '13cb7bb9-c842-4f8a-883b-45361c1a3713', 'add_status_notification_trigger.sql');
    // Need to fix path for JS run, windows path might be tricky with backslashes in JS string if not escaped, but path.join helps.
    // Actually, I can just copy the content here for simplicity/robustness since I know it.

    const sql = `
-- Function to notify on task status change
create or replace function public.notify_task_status_change()
returns trigger as $$
declare
  _team_name text;
begin
  -- Only proceed if status actually changed
  if (old.status = new.status) then
    return new;
  end if;

  -- Get team name for context
  select name into _team_name from public.teams where id = new.team_id;

  -- Notify Assignee (if exists)
  if (new.assignee_id is not null) then
    insert into public.notifications (user_id, title, message, type)
    values (
      new.assignee_id,
      'Mission Update',
      'Task "' || new.title || '" moved to ' || upper(replace(new.status::text, '_', ' ')) || ' in ' || coalesce(_team_name, 'Unknown Unit'),
      'info'
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_task_status_change_notification on public.tasks;

create trigger on_task_status_change_notification
  after update on public.tasks
  for each row execute procedure public.notify_task_status_change();
  `;

    // We need to use rpc or just raw query if possible. Supabase JS client doesn't support raw SQL execution directly on client usually unless we use a function.
    // But wait, I have been using checks before?
    // Actually, for DDL/Triggers, I usually need the SERVICE_KEY or run in dashboard.
    // I only have ANON_KEY.
    // ANON_KEY cannot create triggers.
    // So I CANNOT run this script.
    // I must tell the user to run it.
    console.log("⚠️ Cannot apply trigger with Anon Key. Please run 'add_status_notification_trigger.sql' in Supabase Dashboard.");
}

applyTrigger();
