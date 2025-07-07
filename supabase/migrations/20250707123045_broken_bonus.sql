/*
  # Add personal note to songs

  1. Changes
    - Add personal_note column to songs table (max 1000 characters)
    - Update songs_with_stats view to include personal_note

  2. Security
    - Add length constraint for personal_note
    - Maintain existing RLS policies
*/

-- Add personal_note column to songs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'personal_note'
  ) THEN
    ALTER TABLE songs ADD COLUMN personal_note text CHECK (length(personal_note) <= 1000);
  END IF;
END $$;

-- Drop the existing view first to avoid column conflicts
DROP VIEW IF EXISTS songs_with_stats;

-- Recreate the songs_with_stats view to include personal_note
CREATE VIEW songs_with_stats AS
SELECT 
  s.id,
  s.youtube_url,
  s.youtube_id,
  s.title,
  s.artist,
  s.genre,
  s.release_year,
  s.thumbnail_url,
  s.duration,
  s.submitter_id,
  s.created_at,
  s.updated_at,
  s.personal_note,
  p.username as submitter_username,
  p.avatar_url as submitter_avatar,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as review_count
FROM songs s
LEFT JOIN profiles p ON s.submitter_id = p.id
LEFT JOIN reviews r ON s.id = r.song_id
GROUP BY s.id, s.youtube_url, s.youtube_id, s.title, s.artist, s.genre, s.release_year, s.thumbnail_url, s.duration, s.submitter_id, s.created_at, s.updated_at, s.personal_note, p.username, p.avatar_url;