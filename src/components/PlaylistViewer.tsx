
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { usePlaylistWithSongs, useRemoveSongFromPlaylist, useAddSongToPlaylist } from "@/hooks/usePlaylists";
import { useSongs } from "@/hooks/useSongs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Play, Trash2, Plus, Search, Share, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PlaylistViewerProps {
  playlistId: string;
  playlistName: string;
  isPublic?: boolean;
  trigger?: React.ReactNode;
}

const PlaylistViewer = ({ playlistId, playlistName, isPublic, trigger }: PlaylistViewerProps) => {
  const [open, setOpen] = useState(false);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  
  const { data: playlist } = usePlaylistWithSongs(playlistId);
  const { data: allSongs = [] } = useSongs();
  const removeSongFromPlaylist = useRemoveSongFromPlaylist();
  const addSongToPlaylist = useAddSongToPlaylist();
  const { playPause } = useAudioPlayer();
  const { toast } = useToast();

  const handleRemoveSong = async (songId: string) => {
    await removeSongFromPlaylist.mutateAsync({ playlistId, songId });
  };

  const handleAddExistingSong = async (songId: string) => {
    await addSongToPlaylist.mutateAsync({ playlistId, songId });
  };

  const handleSharePlaylist = () => {
    if (isPublic) {
      const shareUrl = `${window.location.origin}/playlist/${playlistId}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Playlist link copied to clipboard"
      });
    }
  };

  const filteredSongs = allSongs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlaySong = (song: any) => {
    playPause({
      id: song.id,
      youtubeId: song.youtube_id,
      title: song.title,
      artist: song.artist
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30">
            View Playlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-white/20 text-white max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{playlistName}</DialogTitle>
            <div className="flex items-center space-x-2">
              {isPublic && (
                <Button
                  onClick={handleSharePlaylist}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              <Button
                onClick={() => setShowAddSongs(!showAddSongs)}
                variant="outline"
                size="sm"
                className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Songs
              </Button>
            </div>
          </div>
        </DialogHeader>

        {showAddSongs && (
          <div className="border-t border-white/20 pt-4 space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Search existing songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {filteredSongs.map((song) => (
                  <div key={song.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                    <div>
                      <p className="text-white font-medium">{song.title}</p>
                      <p className="text-white/70 text-sm">{song.artist}</p>
                    </div>
                    <Button
                      onClick={() => handleAddExistingSong(song.id)}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                      disabled={addSongToPlaylist.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {playlist?.songs?.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <p>No songs in this playlist yet.</p>
              </div>
            ) : (
              playlist?.songs?.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-3 rounded bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{song.title}</h3>
                    <p className="text-white/70">{song.artist}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handlePlaySong(song)}
                      variant="outline"
                      size="sm"
                      className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleRemoveSong(song.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 bg-red-600/20 text-red-300 hover:bg-red-600/30"
                      disabled={removeSongFromPlaylist.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistViewer;
