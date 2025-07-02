/*
  # Admin System and Enhanced Deletion Permissions

  1. New Features
    - Make smenaria2@gmail.com an admin
    - Allow users to delete their own songs (if no reviews)
    - Allow admins to delete any song or review
    - Add delete buttons to UI components

  2. Security
    - RLS policies updated for admin privileges
    - Proper checks for song deletion (no reviews)
    - Admin role assignment
*/

-- First, let's make sure the admin user exists and assign admin role
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get the user ID for the admin email
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'smenaria2@gmail.com';
    
    -- If user exists, ensure they have admin role
    IF admin_user_id IS NOT NULL THEN
        -- Insert admin role if it doesn't exist
        INSERT INTO user_roles (user_id, role)
        VALUES (admin_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Also ensure they have a profile
        INSERT INTO profiles (id, username)
        VALUES (admin_user_id, 'Admin')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- Update songs table policies to allow deletion by owner (if no reviews) or admin
DROP POLICY IF EXISTS "Users can delete their own songs or admins can delete any" ON songs;

CREATE POLICY "Users can delete their own songs (no reviews) or admins can delete any"
  ON songs
  FOR DELETE
  TO public
  USING (
    (auth.uid() = submitter_id AND NOT EXISTS (
      SELECT 1 FROM reviews WHERE song_id = songs.id
    )) OR 
    get_current_user_role() = 'admin'::user_role
  );

-- Update reviews table policies to allow admin deletion
DROP POLICY IF EXISTS "Users can delete their own reviews or admins can delete any" ON reviews;

CREATE POLICY "Users can delete their own reviews or admins can delete any"
  ON reviews
  FOR DELETE
  TO public
  USING (
    auth.uid() = reviewer_id OR 
    get_current_user_role() = 'admin'::user_role
  );

-- Create a function to check if a song can be deleted by current user
CREATE OR REPLACE FUNCTION can_delete_song(song_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    song_submitter_id uuid;
    review_count integer;
    current_user_id uuid;
    user_role user_role;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get user role
    user_role := get_current_user_role();
    
    -- Admins can delete any song
    IF user_role = 'admin' THEN
        RETURN true;
    END IF;
    
    -- Get song details
    SELECT submitter_id INTO song_submitter_id
    FROM songs
    WHERE id = song_id;
    
    -- Check if user owns the song
    IF song_submitter_id != current_user_id THEN
        RETURN false;
    END IF;
    
    -- Check if song has reviews
    SELECT COUNT(*) INTO review_count
    FROM reviews
    WHERE song_id = can_delete_song.song_id;
    
    -- Can only delete if no reviews
    RETURN review_count = 0;
END;
$$;