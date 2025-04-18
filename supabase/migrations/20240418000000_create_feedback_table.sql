-- Create the feedback table
create table public.feedback (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    email text not null,
    username text not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.feedback enable row level security;

-- Create policies
create policy "Users can view their own feedback"
    on public.feedback for select
    using (auth.uid() = user_id);

create policy "Users can insert their own feedback"
    on public.feedback for insert
    with check (auth.uid() = user_id);

-- Grant access to authenticated users
grant select, insert on public.feedback to authenticated; 