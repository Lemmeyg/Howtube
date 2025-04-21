-- Drop the old function if it exists
drop function if exists update_public_videos(uuid[]);

-- First ensure the public_videos table has all necessary columns
create table if not exists public_videos (
  id uuid primary key default uuid_generate_v4(),
  video_id uuid references videos(id) not null,
  title text,
  description text,
  youtube_url text,
  display_order integer default 0,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(video_id)
);

-- Create function to sync selected videos to public_videos
create or replace function sync_public_videos(selected_video_ids uuid[])
returns setof public_videos
language plpgsql
security definer
set search_path = public
as $$
begin
  -- First, remove any videos that are no longer selected
  delete from public_videos
  where video_id is not null 
  and video_id != all(selected_video_ids);

  -- Then insert or update selected videos
  return query
  insert into public_videos (
    video_id,
    title,
    description,
    youtube_url,
    display_order
  )
  select 
    v.id as video_id,
    v.processed_content->>'title' as title,
    v.processed_content->>'description' as description,
    v.youtube_url,
    row_number() over (order by v.created_at) - 1 as display_order
  from videos v
  where v.id = any(selected_video_ids)
  and v.status = 'completed'
  and not exists (
    select 1 
    from public_videos pv 
    where pv.video_id = v.id
  )
  on conflict (video_id) 
  do update set
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    youtube_url = EXCLUDED.youtube_url,
    updated_at = now()
  returning *;
end;
$$;

-- Grant necessary permissions
grant execute on function sync_public_videos(uuid[]) to authenticated;

-- Update RLS policies
drop policy if exists "Allow select for all" on public_videos;
drop policy if exists "Allow all operations for admins" on public_videos;

alter table public_videos enable row level security;

-- Anyone can view public videos
create policy "Allow select for all"
  on public_videos for select
  to authenticated, anon
  using (true);

-- Only admins can modify public videos
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
  ); 