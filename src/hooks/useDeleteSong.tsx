import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useDeleteSong = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (songId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user can delete this song
      const { data: canDelete, error: checkError } = await supabase
        .rpc('can_delete_song', { song_id: songId });

      if (checkError) {
        throw new Error('Failed to check deletion permissions');
      }

      if (!canDelete) {
        throw new Error('You cannot delete this song. Songs with reviews cannot be deleted unless you are an admin.');
      }

      // Delete the song
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId);

      if (error) {
        throw error;
      }

      return songId;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['user-songs'] });
      toast({
        title: "Success!",
        description: "Song deleted successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete song",
        variant: "destructive"
      });
    }
  });
};

export const useCanDeleteSong = (songId: string) => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user || !songId) return false;

      const { data, error } = await supabase
        .rpc('can_delete_song', { song_id: songId });

      if (error) {
        console.error('Error checking delete permission:', error);
        return false;
      }

      return data;
    }
  });
};