-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENUMS (Strongly Typed Roles & Statuses)
create type public.app_role as enum ('Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'AI/ML Engineer', 'UI/UX Designer', 'Mobile Developer', 'DevOps Engineer', 'Product Manager', 'Data Scientist');
create type public.team_role as enum ('Leader', 'Member');
create type public.task_status as enum ('todo', 'in_progress', 'review', 'done');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');

-- PROFILES (Public profiles for hackers)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  headline text, -- "Building the next unicorn"
  primary_role public.app_role default 'Full Stack Developer',
  skills text[] default '{}', -- Array of tags: ['React', 'Python', 'TensorFlow']
  github_url text,
  linkedin_url text,
  portfolio_url text,
  xp_level text default 'Intermediate', -- 'Beginner', 'Intermediate', 'Pro'
  location text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- TEAMS
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  owner_id uuid references public.profiles(id) not null,
  status text default 'Building', -- 'Ideas', 'Building', 'Shipped', 'Archived'
  looking_for text[] default '{}', -- Skill tags team needs: ['Designer', 'Marketing']
  github_repo text,
  demo_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MEMBERSHIPS (Link Users <-> Teams)
create table public.memberships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  team_id uuid references public.teams(id) not null,
  role public.team_role default 'Member', -- 'Leader' has admin rights
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, team_id)
);

-- TASKS (Kanban)
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status public.task_status default 'todo',
  priority public.task_priority default 'medium',
  tags text[] default '{}', -- ['Bug', 'Feature', 'Frontend']
  team_id uuid references public.teams(id) not null,
  assignee_id uuid references public.profiles(id),
  deadline timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES (Chat)
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  author_id uuid references public.profiles(id) not null,
  team_id uuid references public.teams(id), -- Null means Global Community Chat
  attachments text[] default '{}', -- URLs to uploaded files
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DOCUMENTS (Team Wiki/Docs)
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) not null,
  title text not null,
  content text, -- Markdown content
  type text default 'general', -- 'requirements', 'api', 'brainstorm'
  last_edited_by uuid references public.profiles(id),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.memberships enable row level security;
alter table public.tasks enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;

-- POLICIES

-- Profiles: Public read, Self update
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Teams: Public read (for finding teams), Members/Owner write
create policy "Teams are viewable by everyone"
  on public.teams for select
  using ( true );

create policy "Team members can update team details"
  on public.teams for update
  using (
    auth.uid() in (
      select user_id from public.memberships where team_id = id
      and role = 'Leader'
    )
  );

create policy "Authenticated users can create teams"
  on public.teams for insert
  with check ( auth.role() = 'authenticated' );

-- Memberships: Members can view their teammates
create policy "Team members can view memberships"
  on public.memberships for select
  using (
    auth.uid() in (
      select user_id from public.memberships as m where m.team_id = team_id
    )
  );

create policy "Leaders can manage memberships"
  on public.memberships for all
  using (
    auth.uid() in (
      select user_id from public.memberships where team_id = team_id and role = 'Leader'
    )
  );
  
create policy "Users can join teams"
  on public.memberships for insert
  with check ( auth.uid() = user_id );

-- Tasks: Team members only
create policy "Team members can view tasks"
  on public.tasks for select
  using (
    auth.uid() in (
      select user_id from public.memberships where team_id = tasks.team_id
    )
  );

create policy "Team members can create/update tasks"
  on public.tasks for all
  using (
    auth.uid() in (
      select user_id from public.memberships where team_id = tasks.team_id
    )
  );

-- Messages: Team members can view team chats; Everyone can view community chats
create policy "Team members can view team messages"
  on public.messages for select
  using (
    team_id is null or
    auth.uid() in (
      select user_id from public.memberships where team_id = messages.team_id
    )
  );

create policy "Authenticated users can insert messages"
  on public.messages for insert
  with check (
    auth.role() = 'authenticated' and (
      team_id is null or
      auth.uid() in (
        select user_id from public.memberships where team_id = messages.team_id
      )
    )
  );

-- Documents: Team members only
create policy "Team members can view documents"
  on public.documents for select
  using (
    auth.uid() in (
      select user_id from public.memberships where team_id = documents.team_id
    )
  );

create policy "Team members can edit documents"
  on public.documents for all
  using (
    auth.uid() in (
      select user_id from public.memberships where team_id = documents.team_id
    )
  );

-- Functions
-- 1. Handle New User
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Archive Team Chat (Placeholder for Option B)
create or replace function public.archive_team_chat(target_team_id uuid)
returns void as $$
begin
  -- In a real implementation, this would trigger an Edge Function to:
  -- 1. Select all messages
  -- 2. Write to JSON in Storage
  -- 3. Delete from table
  -- For now, we just mark the team as 'Archived'.
  update public.teams set status = 'Archived' where id = target_team_id;
end;
$$ language plpgsql security definer;
-- 3. Community Feed (Posts)
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  author_id uuid references public.profiles(id) not null,
  tags text[] default '{}',
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.post_likes (
  post_id uuid references public.posts(id) not null,
  user_id uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) not null,
  author_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Notifications
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  message text not null,
  type text default 'info', -- 'info', 'success', 'warning', 'error'
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for New Tables
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;

-- Policies
-- Posts: Public read, Authenticated create
create policy "Everyone can read posts" on public.posts for select using (true);
create policy "Authenticated users can create posts" on public.posts for insert with check (auth.role() = 'authenticated');
create policy "Authors can delete own posts" on public.posts for delete using (auth.uid() = author_id);

-- Likes
create policy "Everyone can read likes" on public.post_likes for select using (true);
create policy "Authenticated users can like" on public.post_likes for insert with check (auth.role() = 'authenticated');
create policy "Users can unlike" on public.post_likes for delete using (auth.uid() = user_id);

-- Comments
create policy "Everyone can read comments" on public.comments for select using (true);
create policy "Authenticated users can comment" on public.comments for insert with check (auth.role() = 'authenticated');

-- Notifications: Users see only their own
create policy "Users can read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications" on public.notifications for insert with check (true); -- Ideally restricted to service_role, but for now allow authenticated to trigger (e.g. peer invites)
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
