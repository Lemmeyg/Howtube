-- Create public_video table
create table if not exists public.public_video (
    id uuid default gen_random_uuid() primary key,
    youtube_url text not null,
    status text not null default 'pending',
    metadata jsonb,
    transcription jsonb,
    processed_content jsonb,
    error_message text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS but allow public read access
alter table public.public_video enable row level security;

-- Create policy for public read access
create policy "Allow public read access"
    on public.public_video for select
    to anon
    using (true);

-- Create policy for admin write access
create policy "Only admins can modify public videos"
    on public.public_video for all
    using (
        auth.uid() in (
            select id from public.profiles where is_admin = true
        )
    );

-- Create function to update updated_at timestamp
create or replace function public.handle_public_video_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_public_video_updated_at
    before update on public.public_video
    for each row
    execute procedure public.handle_public_video_updated_at();

-- Create function to copy videos to public_video
create or replace function copy_to_public_video(video_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    -- Insert selected videos into public_video
    insert into public_video (
        youtube_url,
        status,
        metadata,
        transcription,
        processed_content,
        error_message,
        created_at,
        updated_at
    )
    select 
        v.youtube_url,
        v.status,
        v.metadata,
        v.transcription,
        v.processed_content,
        v.error_message,
        v.created_at,
        v.updated_at
    from videos v
    where v.id = any(video_ids)
    and v.status = 'completed'
    and not exists (
        select 1 
        from public_video pv 
        where pv.youtube_url = v.youtube_url
    );
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function copy_to_public_video(uuid[]) to authenticated; 