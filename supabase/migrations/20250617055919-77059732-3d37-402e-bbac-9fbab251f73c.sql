
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create enum for song genres
CREATE TYPE public.song_genre AS ENUM ('rock', 'pop', 'hip_hop', 'electronic', 'jazz', 'classical', 'country', 'r_b', 'indie', 'alternative', 'grunge', 'metal', 'folk', 'blues', 'reggae', 'punk', 'funk', 'soul', 'disco', 'house', 'techno', 'dubstep', 'ambient', 'experimental', 'other');

-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, role)
);

-- Create songs table
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_url TEXT NOT NULL UNIQUE,
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre song_genre NOT NULL,
  release_year INTEGER,
  thumbnail_url TEXT,
  duration TEXT,
  submitter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(song_id, reviewer_id)
);

-- Create follows table for user following system
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  followed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(follower_id, followed_id),
  CHECK (follower_id != followed_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY created_at DESC 
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (public.get_current_user_role() = 'admin');

-- RLS Policies for songs
CREATE POLICY "Anyone can view songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert songs" ON public.songs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own songs" ON public.songs FOR UPDATE USING (auth.uid() = submitter_id);
CREATE POLICY "Users can delete their own songs or admins can delete any" ON public.songs FOR DELETE USING (auth.uid() = submitter_id OR public.get_current_user_role() = 'admin');

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = reviewer_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete their own reviews or admins can delete any" ON public.reviews FOR DELETE USING (auth.uid() = reviewer_id OR public.get_current_user_role() = 'admin');

-- RLS Policies for follows
CREATE POLICY "Users can view all follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_songs_genre ON public.songs(genre);
CREATE INDEX idx_songs_submitter ON public.songs(submitter_id);
CREATE INDEX idx_songs_created_at ON public.songs(created_at DESC);
CREATE INDEX idx_reviews_song_id ON public.reviews(song_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_followed ON public.follows(followed_id);

-- Create view for songs with aggregated data
CREATE VIEW public.songs_with_stats AS
SELECT 
  s.*,
  p.username as submitter_username,
  p.avatar_url as submitter_avatar,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as review_count
FROM public.songs s
LEFT JOIN public.profiles p ON s.submitter_id = p.id
LEFT JOIN public.reviews r ON s.id = r.song_id
GROUP BY s.id, p.username, p.avatar_url;

-- Create view for user stats
CREATE VIEW public.user_stats AS
SELECT 
  p.id,
  p.username,
  COUNT(DISTINCT s.id) as songs_submitted,
  COUNT(DISTINCT r.id) as reviews_written,
  COALESCE(AVG(r.rating), 0) as average_rating_given,
  COUNT(DISTINCT f1.followed_id) as following_count,
  COUNT(DISTINCT f2.follower_id) as followers_count
FROM public.profiles p
LEFT JOIN public.songs s ON p.id = s.submitter_id
LEFT JOIN public.reviews r ON p.id = r.reviewer_id
LEFT JOIN public.follows f1 ON p.id = f1.follower_id
LEFT JOIN public.follows f2 ON p.id = f2.followed_id
GROUP BY p.id, p.username;
