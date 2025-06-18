
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  return useQuery({
    queryKey: ['songs', searchTerm, selectedGenre],
    queryFn: async () => {
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
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching songs:', error);
        throw error;
      }
      
      return data as Song[];
    }
  });
};

export const useSubmitSong = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('songs')
        .insert({
          ...songData,
          submitter_id: userData.user.id
        })
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
