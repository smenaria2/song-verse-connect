import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlaylists, useAddSongToPlaylist } from "@/hooks/usePlaylists";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ListMusic, Check } from "lucide-react";

interface AddToPlaylistModalProps {
  songId: string;
  songTitle: string;
  trigger?: React.ReactNode;
}

const AddToPlaylistModal = ({ songId, songTitle, trigger }: AddToPlaylistModalProps) => {
  const [open, setOpen] = useState(false);
  const { data: playlists = [] } = usePlaylists();
  const addSongToPlaylist = useAddSongToPlaylist();

  // Fetch playlists that already contain this song
  const { data: playlistsWithSong = [] } = useQuery({
    queryKey: ['playlist-songs', songId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('playlist_songs')
        .select('playlist_id')
        .eq('song_id', songId);
      
      if (error) throw error;
      return data.map(item => item.playlist_id);
    },
    enabled: open && !!songId,
  });

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await addSongToPlaylist.mutateAsync({ playlistId, songId });
      setOpen(false);
    } catch (error: any) {
      // Error handling is done in the hook with toast
      console.error('Failed to add song to playlist:', error);
    }
  };

  const isSongInPlaylist = (playlistId: string) => {
    return playlistsWithSong.includes(playlistId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add to Playlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>Add "{songTitle}" to Playlist</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2">
            {playlists.length === 0 ? (
              <div className="text-center py-4 text-white/60">
                <ListMusic className="h-8 w-8 mx-auto mb-2" />
                <p>No playlists found. Create one first!</p>
              </div>
            ) : (
              playlists.map((playlist) => {
                const isAlreadyAdded = isSongInPlaylist(playlist.id);
                
                return (
                  <Button
                    key={playlist.id}
                    variant="ghost"
                    className={`w-full justify-start text-white ${
                      isAlreadyAdded 
                        ? 'opacity-50 cursor-not-allowed bg-green-600/20 text-green-300' 
                        : 'hover:bg-purple-600/20 hover:text-purple-300'
                    }`}
                    onClick={() => !isAlreadyAdded && handleAddToPlaylist(playlist.id)}
                    disabled={addSongToPlaylist.isPending || isAlreadyAdded}
                  >
                    {isAlreadyAdded ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <ListMusic className="h-4 w-4 mr-2" />
                    )}
                    {playlist.name}
                    {playlist.is_public && <span className="ml-2 text-xs text-purple-400">(Public)</span>}
                    {isAlreadyAdded && <span className="ml-2 text-xs text-green-400">(Already Added)</span>}
                  </Button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistModal;