// Shared application types
export interface Song {
  id: string;
  youtube_url: string;
  youtube_id: string;
  title: string;
  artist: string;
  genre: string;
  release_year?: number;
  thumbnail_url?: string;
  duration?: string;
  submitter_id: string;
  created_at: string;
  updated_at: string;
  submitter_username?: string;
  submitter_avatar?: string;
  average_rating: number;
  review_count: number;
  personal_note?: string;
}

export interface SongsStats {
  total_songs: number;
  total_artists: number;
  total_reviews: number;
  average_rating: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PlaylistWithSongs extends Playlist {
  songs: Array<{
    id: string;
    title: string;
    artist: string;
    youtube_id: string;
    thumbnail_url?: string;
    position: number;
  }>;
}

export interface Review {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  reviewer_id: string;
  reviewer_username: string;
  reviewer_avatar?: string;
  song_id: string;
  song_title?: string;
  song_artist?: string;
  upvote_count?: number;
  comment_count?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  username: string;
  songs_submitted: number;
  reviews_written: number;
  average_rating_given: number;
  following_count: number;
  followers_count: number;
}

export interface SubmittedSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  average_rating: number;
  review_count: number;
  created_at: string;
  youtube_id: string;
}

export interface UserReview {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  song: {
    id: string;
    title: string;
    artist: string;
    youtube_id: string;
  };
}

export interface SongData {
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
}

export interface YouTubeVideoResponse {
  items: Array<{
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        maxres?: { url: string };
        high?: { url: string };
        medium?: { url: string };
        default: { url: string };
      };
    };
    contentDetails: {
      duration: string;
    };
  }>;
}

// Define allowed genre values to match database enum
export type SongGenre = 'rock' | 'pop' | 'hip_hop' | 'electronic' | 'jazz' | 'classical' | 'country' | 'r_b' | 'indie' | 'alternative' | 'grunge' | 'metal' | 'folk' | 'blues' | 'reggae' | 'punk' | 'funk' | 'soul' | 'disco' | 'house' | 'techno' | 'dubstep' | 'ambient' | 'experimental' | 'other';