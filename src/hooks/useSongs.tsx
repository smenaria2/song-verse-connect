
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useSecurityValidation } from './useSecurityValidation';
import { extractYouTubeId } from '@/utils/validation';

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
}

export interface SongsStats {
  total_songs: number;
  total_artists: number;
  total_reviews: number;
  average_rating: number;
}

// Define allowed genre values to match database enum - updated to match actual DB schema
type SongGenre = 'rock' | 'pop' | 'hip_hop' | 'electronic' | 'jazz' | 'classical' | 'country' | 'r_b' | 'indie' | 'alternative' | 'grunge' | 'metal' | 'folk' | 'blues' | 'reggae' | 'punk' | 'funk' | 'soul' | 'disco' | 'house' | 'techno' | 'dubstep' | 'ambient' | 'experimental' | 'other';

// Map display genres to database enum values - updated to match DB schema
const genreMapping: { [key: string]: SongGenre } = {
  'All': 'other', // This won't be used in filtering
  'Rock': 'rock',
  'Pop': 'pop',
  'Hip Hop': 'hip_hop',
  'Electronic': 'electronic',
  'Jazz': 'jazz',
  'Classical': 'classical',
  'Grunge': 'grunge',
  'Alternative': 'alternative',
  'Indie': 'indie',
  'Folk': 'folk',
  'Experimental': 'experimental',
  'Hindustani Classical': 'classical',
  'Cover/Album': 'other',
  'Bollywood Film Music': 'other',
  'Bhangra': 'folk',
  'Sufi/Qawwali': 'other',
  'Indian Folk': 'folk',
  'Indie/Indian Pop': 'indie',
  'Devotional': 'other',
  'Fusion': 'experimental',
  'Western': 'other'
};

export const useSongs = (searchTerm = '', selectedGenre = 'All') => {
  return useInfiniteQuery({
    queryKey: ['songs', searchTerm, selectedGenre],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase.from('songs_with_stats').select('*');
      
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,artist.ilike.%${searchTerm}%`);
      }
      
      if (selectedGenre !== 'All') {
        const dbGenre = genreMapping[selectedGenre];
        if (dbGenre) {
          query = query.eq('genre', dbGenre);
        }
      }
      
      query = query.order('created_at', { ascending: false });
      query = query.range(pageParam * 20, (pageParam + 1) * 20 - 1);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching songs:', error);
        throw error;
      }
      
      return data as Song[];
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length : undefined;
    },
    initialPageParam: 0
  });
};

export const useSongsStats = () => {
  return useQuery({
    queryKey: ['songs-stats'],
    queryFn: async () => {
      // Get total songs
      const { count: totalSongs } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true });

      // Get total artists (distinct)
      const { data: artistsData } = await supabase
        .from('songs')
        .select('artist');
      
      const uniqueArtists = new Set(artistsData?.map(song => song.artist) || []).size;

      // Get total reviews
      const { count: totalReviews } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      // Get average rating
      const { data: avgData } = await supabase
        .from('reviews')
        .select('rating');
      
      const avgRating = avgData?.length 
        ? avgData.reduce((sum, review) => sum + review.rating, 0) / avgData.length
        : 0;

      return {
        total_songs: totalSongs || 0,
        total_artists: uniqueArtists,
        total_reviews: totalReviews || 0,
        average_rating: avgRating
      } as SongsStats;
    }
  });
};

export const useSubmitSong = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { validateSongSubmission } = useSecurityValidation();
  
  return useMutation({
    mutationFn: async (songData: {
      youtube_url: string;
      youtube_id: string;
      title: string;
      artist: string;
      genre: SongGenre;
      thumbnail_url?: string;
      duration?: string;
    }) => {
      // Validate and sanitize input
      const validatedData = validateSongSubmission({
        youtube_url: songData.youtube_url,
        title: songData.title,
        artist: songData.artist,
      });
      
      if (!validatedData) {
        throw new Error('Validation failed');
      }

      // Extract and validate YouTube ID
      const extractedId = extractYouTubeId(songData.youtube_url);
      if (!extractedId) {
        throw new Error('Invalid YouTube URL');
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const finalSongData = {
        ...songData,
        title: validatedData.title,
        artist: validatedData.artist,
        youtube_id: extractedId,
        submitter_id: userData.user.id
      };

      const { data, error } = await supabase
        .from('songs')
        .insert(finalSongData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast({
        title: "Success!",
        description: "Song submitted successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit song",
        variant: "destructive"
      });
    }
  });
};
