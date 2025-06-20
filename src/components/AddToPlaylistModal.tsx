
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlaylists, useAddSongToPlaylist } from "@/hooks/usePlaylists";
import { Plus, ListMusic } from "lucide-react";

interface AddToPlaylistModalProps {
  songId: string;
  songTitle: string;
  trigger?: React.ReactNode;
}

const AddToPlaylistModal = ({ songId, songTitle, trigger }: AddToPlaylistModalProps) => {
  const [open, setOpen] = useState(false);
  const { data: playlists = [] } = usePlaylists();
  const addSongToPlaylist = useAddSongToPlaylist();

  const handleAddToPlaylist = async (playlistId: string) => {
    await addSongToPlaylist.mutateAsync({ playlistId, songId });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
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
              playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  disabled={addSongToPlaylist.isPending}
                >
                  <ListMusic className="h-4 w-4 mr-2" />
                  {playlist.name}
                  {playlist.is_public && <span className="ml-2 text-xs text-purple-400">(Public)</span>}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPlaylistModal;
