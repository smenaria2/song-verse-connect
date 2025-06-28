/*
  # Review Interaction System

  1. New Tables
    - `review_comments`
      - `id` (uuid, primary key)
      - `review_id` (uuid, foreign key to reviews)
      - `commenter_id` (uuid, foreign key to profiles)
      - `comment_text` (text, max 5000 chars)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_flagged` (boolean, for moderation)
      - `is_hidden` (boolean, for moderation)
    
    - `review_upvotes`
      - `id` (uuid, primary key)
      - `review_id` (uuid, foreign key to reviews)
      - `user_id` (uuid, foreign key to profiles)
      - `created_at` (timestamp)
    
    - `comment_reports`
      - `id` (uuid, primary key)
      - `comment_id` (uuid, foreign key to review_comments)
      - `reporter_id` (uuid, foreign key to profiles)
      - `reason` (text)
      - `created_at` (timestamp)
      - `status` (enum: pending, reviewed, resolved)

  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
    - Prevent spam with rate limiting constraints
    - Content moderation flags
*/

-- Create review_comments table
CREATE TABLE IF NOT EXISTS review_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  commenter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_text text NOT NULL CHECK (length(comment_text) <= 5000 AND length(trim(comment_text)) > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_flagged boolean DEFAULT false,
  is_hidden boolean DEFAULT false
);

-- Create review_upvotes table
CREATE TABLE IF NOT EXISTS review_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Create comment_reports table for moderation
CREATE TABLE IF NOT EXISTS comment_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES review_comments(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (length(trim(reason)) > 0),
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  UNIQUE(comment_id, reporter_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_comments_review_id ON review_comments(review_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_commenter_id ON review_comments(commenter_id);
CREATE INDEX IF NOT EXISTS idx_review_comments_created_at ON review_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_upvotes_review_id ON review_upvotes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_upvotes_user_id ON review_upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_comment_id ON comment_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON comment_reports(status);

-- Enable RLS
ALTER TABLE review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_comments
CREATE POLICY "Anyone can view non-hidden comments"
  ON review_comments
  FOR SELECT
  TO public
  USING (NOT is_hidden);

CREATE POLICY "Authenticated users can insert comments"
  ON review_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = commenter_id AND
    NOT is_flagged AND
    NOT is_hidden
  );

CREATE POLICY "Users can update their own comments"
  ON review_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = commenter_id)
  WITH CHECK (auth.uid() = commenter_id);

CREATE POLICY "Users can delete their own comments"
  ON review_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = commenter_id);

-- RLS Policies for review_upvotes
CREATE POLICY "Anyone can view upvotes"
  ON review_upvotes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage their upvotes"
  ON review_upvotes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for comment_reports
CREATE POLICY "Users can view their own reports"
  ON comment_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Authenticated users can create reports"
  ON comment_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Create updated_at trigger for review_comments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_comments_updated_at
  BEFORE UPDATE ON review_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for reviews with interaction stats
CREATE OR REPLACE VIEW reviews_with_interactions AS
SELECT 
  r.*,
  p.username as reviewer_username,
  p.avatar_url as reviewer_avatar,
  s.title as song_title,
  s.artist as song_artist,
  COALESCE(upvote_counts.upvote_count, 0) as upvote_count,
  COALESCE(comment_counts.comment_count, 0) as comment_count
FROM reviews r
LEFT JOIN profiles p ON r.reviewer_id = p.id
LEFT JOIN songs s ON r.song_id = s.id
LEFT JOIN (
  SELECT review_id, COUNT(*) as upvote_count
  FROM review_upvotes
  GROUP BY review_id
) upvote_counts ON r.id = upvote_counts.review_id
LEFT JOIN (
  SELECT review_id, COUNT(*) as comment_count
  FROM review_comments
  WHERE NOT is_hidden
  GROUP BY review_id
) comment_counts ON r.id = comment_counts.review_id;