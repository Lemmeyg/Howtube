-- Create public_videos table
create table if not exists public.public_videos (
    id uuid default gen_random_uuid() primary key,
    video_id uuid references public.videos(id) on delete cascade not null,
    featured boolean default false,
    display_order integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for better query performance
create index if not exists idx_public_videos_featured on public_videos(featured);
create index if not exists idx_public_videos_display_order on public_videos(display_order);

-- Enable RLS but allow public read access
alter table public.public_videos enable row level security;

-- Create policy for public read access
create policy "Allow public read access"
    on public.public_videos for select
    to anon
    using (true);

-- Create policy for admin write access
create policy "Only admins can modify public videos"
    on public.public_videos for all
    using (
        auth.uid() in (
            select id from public.profiles where is_admin = true
        )
    );

-- Create function to update updated_at timestamp
create or replace function public.handle_public_videos_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_public_videos_updated_at
    before update on public.public_videos
    for each row
    execute procedure public.handle_public_videos_updated_at(); 