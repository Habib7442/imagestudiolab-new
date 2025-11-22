-- Function to toggle upvote safely
create or replace function toggle_banana_upvote(post_id_input uuid)
returns void
language plpgsql
security definer
as $$
declare
  user_id_val uuid;
begin
  -- Get current user ID
  user_id_val := auth.uid();
  if user_id_val is null then
    raise exception 'Not authenticated';
  end if;

  -- Check if upvote exists
  if exists (select 1 from public.banana_upvotes where user_id = user_id_val and post_id = post_id_input) then
    -- Remove upvote
    delete from public.banana_upvotes where user_id = user_id_val and post_id = post_id_input;
    -- Decrement count
    update public.banana_posts 
    set upvotes_count = greatest(0, upvotes_count - 1)
    where id = post_id_input;
  else
    -- Add upvote
    insert into public.banana_upvotes (user_id, post_id) values (user_id_val, post_id_input);
    -- Increment count
    update public.banana_posts 
    set upvotes_count = upvotes_count + 1
    where id = post_id_input;
  end if;
end;
$$;

-- Sync existing counts (Run this to fix any discrepancies)
update public.banana_posts 
set upvotes_count = (
  select count(*) 
  from public.banana_upvotes 
  where post_id = public.banana_posts.id
);
