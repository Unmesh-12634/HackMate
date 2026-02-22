-- MASTER COMMUNITY SETUP (Idempotent)
-- Run this in your Supabase SQL Editor to set up the entire social ecosystem.

-- 0. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 1. BASE TABLES (If they don't exist)
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  author_id uuid references public.profiles(id) not null,
  type text default 'text', -- 'text', 'code', 'project'
  code_snippet text,
  code_language text,
  project_details jsonb default '{}'::jsonb,
  tags text[] default '{}',
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.post_likes (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.comments(id) on delete cascade, -- For replies
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info', -- 'info', 'success', 'warning', 'error'
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.direct_messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  author_id uuid references public.profiles(id) not null,
  team_id uuid references public.teams(id), -- Null means Global Community Chat
  attachments text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.followers (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

-- 2. RLS ENABLING
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;
alter table public.direct_messages enable row level security;
alter table public.followers enable row level security;

-- 3. POLICIES (Using DO blocks to avoid "already exists" errors)
do $$
begin
    -- Posts
    if not exists (select 1 from pg_policies where policyname = 'Everyone can read posts') then
        create policy "Everyone can read posts" on public.posts for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Authenticated users can create posts') then
        create policy "Authenticated users can create posts" on public.posts for insert with check (auth.role() = 'authenticated');
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Authors can delete own posts') then
        create policy "Authors can delete own posts" on public.posts for delete using (auth.uid() = author_id);
    end if;

    -- Likes
    if not exists (select 1 from pg_policies where policyname = 'Everyone can read likes') then
        create policy "Everyone can read likes" on public.post_likes for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Authenticated users can like') then
        create policy "Authenticated users can like" on public.post_likes for insert with check (auth.role() = 'authenticated');
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can unlike') then
        create policy "Users can unlike" on public.post_likes for delete using (auth.uid() = user_id);
    end if;

    -- Comments
    if not exists (select 1 from pg_policies where policyname = 'Everyone can read comments') then
        create policy "Everyone can read comments" on public.comments for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Authenticated users can comment') then
        create policy "Authenticated users can comment" on public.comments for insert with check (auth.role() = 'authenticated');
    end if;

    -- Notifications
    if not exists (select 1 from pg_policies where policyname = 'Users can read own notifications') then
        create policy "Users can read own notifications" on public.notifications for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'System can insert notifications') then
        create policy "System can insert notifications" on public.notifications for insert with check (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can update own notifications') then
        create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
    end if;

    -- Direct Messages
    if not exists (select 1 from pg_policies where policyname = 'Users can view their own messages') then
        create policy "Users can view their own messages" on public.direct_messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can send direct messages') then
        create policy "Users can send direct messages" on public.direct_messages for insert with check (auth.uid() = sender_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can mark messages as read') then
        create policy "Users can mark messages as read" on public.direct_messages for update using (auth.uid() = receiver_id);
    end if;

    -- Followers
    if not exists (select 1 from pg_policies where policyname = 'Everyone can read followers') then
        create policy "Everyone can read followers" on public.followers for select using (true);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can follow others') then
        create policy "Users can follow others" on public.followers for insert with check (auth.uid() = follower_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Users can unfollow') then
        create policy "Users can unfollow" on public.followers for delete using (auth.uid() = follower_id);
    end if;

    -- Messages
    if not exists (select 1 from pg_policies where policyname = 'Team members can view team messages') then
        create policy "Team members can view team messages" on public.messages for select using (team_id is null or auth.uid() in (select user_id from public.memberships where team_id = messages.team_id));
    end if;
    if not exists (select 1 from pg_policies where policyname = 'Authenticated users can insert messages') then
        create policy "Authenticated users can insert messages" on public.messages for insert with check (auth.role() = 'authenticated');
    end if;
end $$;

-- 4. INDEXES
create index if not exists idx_posts_author on public.posts(author_id);
create index if not exists idx_comments_post on public.comments(post_id);
create index if not exists idx_comments_parent on public.comments(parent_id);
create index if not exists idx_dm_receiver on public.direct_messages(receiver_id);
create index if not exists idx_dm_sender on public.direct_messages(sender_id);
create index if not exists idx_likes_post on public.post_likes(post_id);

-- 5. REALTIME (Publication cleanup and recreation)
begin;
  -- Try to add tables to existing publication, or create it if missing
  do $$
  begin
    if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
      create publication supabase_realtime;
    end if;
  end $$;
  
  alter publication supabase_realtime add table public.messages;
  alter publication supabase_realtime add table public.posts;
  alter publication supabase_realtime add table public.comments;
  alter publication supabase_realtime add table public.post_likes;
  alter publication supabase_realtime add table public.direct_messages;
  alter publication supabase_realtime add table public.followers;
  alter publication supabase_realtime add table public.notifications;
commit;
