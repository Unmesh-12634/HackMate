-- DIRECT MESSAGES (Intel Relay)
create table public.direct_messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) not null,
  receiver_id uuid references public.profiles(id) not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENHANCE POSTS WITH LIKES/COMMENTS SYNC
-- (Existing tables: posts, post_likes, comments are in schema.sql)

-- RLS for Direct Messages
alter table public.direct_messages enable row level security;

create policy "Users can view their own sent/received messages"
  on public.direct_messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send direct messages"
  on public.direct_messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can mark messages as read"
  on public.direct_messages for update
  using (auth.uid() = receiver_id);

-- NOTIFICATIONS FOR SOCIAL ACTIONS
-- (Existing table: notifications is in schema.sql)

-- INDEXES FOR PERFORMANCE
create index if not exists idx_dm_receiver on public.direct_messages(receiver_id);
create index if not exists idx_dm_sender on public.direct_messages(sender_id);
create index if not exists idx_comments_post on public.comments(post_id);
create index if not exists idx_likes_post on public.post_likes(post_id);

-- FOLLOWERS SYSTEM
create table public.followers (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

alter table public.followers enable row level security;

create policy "Everyone can read followers"
  on public.followers for select
  using (true);

create policy "Users can follow others"
  on public.followers for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.followers for delete
  using (auth.uid() = follower_id);

-- ADD REPLIES TO COMMENTS
alter table public.comments
  add column if not exists parent_id uuid references public.comments(id) on delete cascade;

  