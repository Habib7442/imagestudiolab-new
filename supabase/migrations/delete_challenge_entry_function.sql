-- RPC function for deleting challenge entries
CREATE OR REPLACE FUNCTION delete_challenge_entry(entry_id_input UUID)
RETURNS VOID AS $$
DECLARE
  user_id_input UUID;
  entry_user_id UUID;
BEGIN
  -- Get the current authenticated user
  user_id_input := auth.uid();
  
  -- Check if user is authenticated
  IF user_id_input IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: You must be logged in to delete entries';
  END IF;
  
  -- Get the entry's owner
  SELECT user_id INTO entry_user_id 
  FROM challenge_entries 
  WHERE id = entry_id_input;
  
  -- Check if entry exists
  IF entry_user_id IS NULL THEN
    RAISE EXCEPTION 'Entry not found';
  END IF;
  
  -- Check if the user owns the entry
  IF entry_user_id != user_id_input THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own entries';
  END IF;
  
  -- Delete the entry (cascade will handle related upvotes)
  DELETE FROM challenge_entries WHERE id = entry_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
