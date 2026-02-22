-- USER HISTORY / AUDIT LOGS (Personal)
create table public.user_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  team_id uuid references public.teams(id), -- Optional: Link to team if action was in a workspace
  action text not null, -- e.g. "Joined Team Alpha", "Completed Task: Sidebar fix"
  type text not null, -- 'task', 'team', 'doc', 'system'
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PERSONAL NOTES
create table public.personal_notes (    
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text,
  content text, -- Markdown
  is_favorite boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PERSONAL REMINDERS
create table public.personal_reminders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  due_at timestamp with time zone,
  is_completed boolean default false,
  priority text default 'medium', -- 'low', 'medium', 'high'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- USER MILESTONES (Achievements)
create table public.user_milestones (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  type text default 'achievement' -- 'certification', 'hackathon_win', 'task_master'
);

-- RLS
alter table public.user_history enable row level security;
alter table public.personal_notes enable row level security;
alter table public.personal_reminders enable row level security;
alter table public.user_milestones enable row level security;

-- Policies: Users see only their own
create policy "Users can view own history" on public.user_history for select using (auth.uid() = user_id);
create policy "System can insert history" on public.user_history for insert with check (true);
create policy "Users can view own notes" on public.personal_notes for select using (auth.uid() = user_id);
create policy "Users can manage own notes" on public.personal_notes for all using (auth.uid() = user_id);
create policy "Users can view own reminders" on public.personal_reminders for select using (auth.uid() = user_id);
create policy "Users can manage own reminders" on public.personal_reminders for all using (auth.uid() = user_id);
create policy "Users can view own milestones" on public.user_milestones for select using (auth.uid() = user_id);
create policy "Users can manage own milestones" on public.user_milestones for all using (auth.uid() = user_id);

-- EXTEND PROFILES FOR RANKING
alter table public.profiles add column if not exists reputation_points integer default 0;
alter table public.profiles add column if not exists prestige_rank text default 'Operative'; -- 'Operative', 'Specialist', 'Elite', 'Commander'
alter table public.profiles add column if not exists weekly_velocity integer[] default '{}'; -- Array of 7 integers for Mon-Sun tasks
