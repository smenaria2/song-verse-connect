import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useSecurityValidation } from './useSecurityValidation';
import { extractYouTubeId } from '@/utils/youtube/helpers';
import { genreMapping } from '@/constants/genres';
import { Song, SongsStats, SongGenre } from '@/types/app';

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
    initialPageParam: 0,
    // Remove the enabled condition so songs load for everyone
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
      personal_note?: string;
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
        submitter_id: userData.user.id,
        personal_note: songData.personal_note?.trim() || null
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