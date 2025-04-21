-- Drop existing policies if they exist
drop policy if exists "Allow select for all" on public_videos;
drop policy if exists "Allow insert for admins" on public_videos;
drop policy if exists "Allow delete for admins" on public_videos;
drop policy if exists "Allow all operations for admins" on public_videos;

-- Ensure RLS is enabled
alter table public_videos enable row level security;

-- Create policies
create policy "Allow select for all"
  on public_videos for select
  to authenticated, anon
  using (true);

create policy "Allow all for service role"
  on public_videos for all
  to service_role
  using (true)
  with check (true);

create policy "Allow all operations for admins"
  on public_videos for all
  to authenticated
  using (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  )
  with check (
    exists (
      select 1
      from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  ); 