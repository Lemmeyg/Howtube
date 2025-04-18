-- Create videos table
create table if not exists public.videos (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    youtube_url text not null,
    status text not null default 'pending',
    metadata jsonb,
    transcription jsonb,
    processed_content jsonb,
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable real-time for the videos table
alter publication supabase_realtime add table public.videos;

-- Create RLS policies
alter table public.videos enable row level security;

create policy "Users can view their own videos"
    on public.videos for select
    using (auth.uid() = user_id);

create policy "Users can insert their own videos"
    on public.videos for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own videos"
    on public.videos for update
    using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_videos_updated_at
    before update on public.videos
    for each row
    execute procedure public.handle_updated_at(); 