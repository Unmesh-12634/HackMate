
-- Ensure memberships.joined_at exists
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name = 'memberships' and column_name = 'joined_at') then
    alter table public.memberships add column joined_at timestamp with time zone default timezone('utc'::text, now()) not null;
  end if;
end $$;
