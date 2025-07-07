/*
  # Add personal note field to songs table

  1. Changes
    - Add `personal_note` column to songs table
    - Allow users to add optional notes when submitting songs
    - Display notes on song detail pages

  2. Security
    - Notes are optional and can be updated by song submitter
    - Text length validation (max 1000 characters)
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

-- Update the songs_with_stats view to include personal_note
CREATE OR REPLACE VIEW songs_with_stats AS
SELECT 
  s.*,
  p.username as submitter_username,
  p.avatar_url as submitter_avatar,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as review_count
FROM songs s
LEFT JOIN profiles p ON s.submitter_id = p.id
LEFT JOIN reviews r ON s.id = r.song_id
GROUP BY s.id, p.username, p.avatar_url;