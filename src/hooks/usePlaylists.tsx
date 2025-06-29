import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';
import { Playlist, PlaylistWithSongs } from '@/types/app';

export const usePlaylists = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['playlists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Playlist[];
    },
    enabled: !!user
  });
};

export const usePlaylistWithSongs = (playlistId: string) => {
  return useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async () => {
      const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();
      
      if (playlistError) throw playlistError;

      const { data: playlistSongs, error: songsError } = await supabase
        .from('playlist_songs')
        .select(`
          position,
          songs!inner(
            id,
            title,
            artist,
            youtube_id,
            thumbnail_url
          )
        `)
        .eq('playlist_id', playlistId)
        .order('position');
      
      if (songsError) throw songsError;

      const songs = playlistSongs.map(ps => ({
        ...(ps.songs as any),
        position: ps.position
      }));

      return {
        ...playlist,
        songs
      } as PlaylistWithSongs;
    },
    enabled: !!playlistId
  });
};

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (playlistData: { name: string; description?: string; is_public?: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('playlists')
        .insert({
          ...playlistData,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast({
        title: "Success!",
        description: "Playlist created successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create playlist",
        variant: "destructive"
      });
    }
  });
};

export const useAddSongToPlaylist = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
      // Check if song already exists in playlist
      const { data: existingSong } = await supabase
        .from('playlist_songs')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('song_id', songId)
        .maybeSingle();

      if (existingSong) {
        throw new Error('Song already exists in this playlist');
      }

      // Get the current max position in the playlist
      const { data: maxPos } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = maxPos && maxPos.length > 0 ? maxPos[0].position + 1 : 0;

      const { data, error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: songId,
          position: nextPosition
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist'] });
      toast({
        title: "Success!",
        description: "Song added to playlist!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add song to playlist",
        variant: "destructive"
      });
    }
  });
};

export const useRemoveSongFromPlaylist = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist'] });
      toast({
        title: "Success!",
        description: "Song removed from playlist!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove song from playlist",
        variant: "destructive"
      });
    }
  });
};