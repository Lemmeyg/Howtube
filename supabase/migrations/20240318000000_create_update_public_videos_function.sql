-- Create a function to update public videos in a transaction
create or replace function update_public_videos(video_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _count integer;
begin
  -- Start transaction
  truncate table public_videos;
  
  -- Insert new videos if any provided
  if array_length(video_ids, 1) > 0 then
    insert into public_videos (video_id, featured, display_order)
    select 
      vid,
      true,
      row_number() over () - 1
    from unnest(video_ids) as vid;

    get diagnostics _count = row_count;
  end if;

  -- Return success
  return;
exception
  when others then
    raise exception 'Error updating public videos: %', SQLERRM;
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function update_public_videos(uuid[]) to authenticated; 