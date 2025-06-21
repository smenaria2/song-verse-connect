import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePlaylists, useCreatePlaylist, usePlaylistWithSongs, useRemoveSongFromPlaylist, useAddSongToPlaylist } from "@/hooks/usePlaylists";
import { useSongs } from "@/hooks/useSongs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Plus, ListMusic, Play, Search, Trash2, Share, Copy, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlaylistViewerProps {
  trigger?: React.ReactNode;
}

const PlaylistViewer = ({ trigger }: PlaylistViewerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [newPlaylistIsPublic, setNewPlaylistIsPublic] = useState(false);
  
  const { data: playlists = [] } = usePlaylists();
  const songsQuery = useSongs(searchTerm, "All");
  const { data: currentPlaylist } = usePlaylistWithSongs(selectedPlaylist || "");
  const createPlaylist = useCreatePlaylist();
  const removeSongFromPlaylist = useRemoveSongFromPlaylist();
  const addSongToPlaylist = useAddSongToPlaylist();
  const { playPause } = useAudioPlayer();
  const { toast } = useToast();

  // Extract all songs from the infinite query pages
  const allSongs = songsQuery.data?.pages?.flat() || [];

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    await createPlaylist.mutateAsync({
      name: newPlaylistName.trim(),
      description: newPlaylistDescription.trim() || undefined,
      is_public: newPlaylistIsPublic
    });

    setNewPlaylistName("");
    setNewPlaylistDescription("");
    setNewPlaylistIsPublic(false);
    setShowCreateForm(false);
  };

  const handleRemoveSong = async (songId: string) => {
    if (!selectedPlaylist) return;
    await removeSongFromPlaylist.mutateAsync({
      playlistId: selectedPlaylist,
      songId
    });
  };

  const handleAddSong = async (songId: string) => {
    if (!selectedPlaylist) return;
    try {
      await addSongToPlaylist.mutateAsync({
        playlistId: selectedPlaylist,
        songId
      });
    } catch (error: any) {
      // Error handling is done in the hook
      console.error('Failed to add song:', error);
    }
  };

  const handleSongPlay = (song: any) => {
    playPause({
      id: song.id,
      youtubeId: song.youtube_id,
      title: song.title,
      artist: song.artist
    });
  };

  const handleSharePlaylist = (playlist: any) => {
    if (playlist.is_public) {
      const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Playlist link copied to clipboard"
      });
    } else {
      toast({
        title: "Private Playlist",
        description: "Make playlist public to share",
        variant: "destructive"
      });
    }
  };

  const filteredSongs = allSongs.filter(song => 
    !currentPlaylist?.songs.some(playlistSong => playlistSong.id === song.id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0">
            <ListMusic className="h-4 w-4 mr-2" />
            My Playlists
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-black/90 border-white/20 text-white max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>My Playlists</span>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </DialogTitle>
        </DialogHeader>

        {showCreateForm ? (
          <form onSubmit={handleCreatePlaylist} className="space-y-4">
            <div>
              <Label htmlFor="name">Playlist Name</Label>
              <Input
                id="name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="My Playlist"
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                placeholder="Describe your playlist..."
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={newPlaylistIsPublic}
                onCheckedChange={setNewPlaylistIsPublic}
              />
              <Label htmlFor="public">Make playlist public</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createPlaylist.isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {createPlaylist.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        ) : selectedPlaylist ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{currentPlaylist?.name}</h3>
                {currentPlaylist?.description && (
                  <p className="text-white/70 text-sm">{currentPlaylist.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={currentPlaylist?.is_public ? "default" : "secondary"}>
                    {currentPlaylist?.is_public ? "Public" : "Private"}
                  </Badge>
                  <span className="text-white/60 text-sm">
                    {currentPlaylist?.songs.length || 0} songs
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {currentPlaylist?.is_public && (
                  <Button
                    onClick={() => handleSharePlaylist(currentPlaylist)}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
                <Button
                  onClick={() => setShowAddSongs(true)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Songs
                </Button>
                <Button
                  onClick={() => setSelectedPlaylist(null)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Back
                </Button>
              </div>
            </div>

            {showAddSongs ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium">Add Songs to Playlist</h4>
                  <Button
                    onClick={() => setShowAddSongs(false)}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Done
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search for songs to add..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
                  />
                </div>
                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {filteredSongs.length === 0 ? (
                      <div className="text-center py-4 text-white/60">
                        <Music className="h-8 w-8 mx-auto mb-2" />
                        <p>No songs available to add</p>
                      </div>
                    ) : (
                      filteredSongs.map((song) => (
                        <Card key={song.id} className="bg-white/5 border-white/10">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={song.thumbnail_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"}
                                  alt={song.title}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div>
                                  <h5 className="text-white font-medium text-sm">{song.title}</h5>
                                  <p className="text-white/70 text-xs">{song.artist}</p>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleAddSong(song.id)}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={addSongToPlaylist.isPending}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {currentPlaylist?.songs.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      <ListMusic className="h-12 w-12 mx-auto mb-4" />
                      <p>No songs in this playlist yet</p>
                    </div>
                  ) : (
                    currentPlaylist?.songs.map((song) => (
                      <Card key={song.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                src={song.thumbnail_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop"}
                                alt={song.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <h5 className="text-white font-medium text-sm">{song.title}</h5>
                                <p className="text-white/70 text-xs">{song.artist}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSongPlay(song)}
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleRemoveSong(song.id)}
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-600/20"
                                disabled={removeSongFromPlaylist.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {playlists.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <ListMusic className="h-12 w-12 mx-auto mb-4" />
                  <p>No playlists yet. Create your first one!</p>
                </div>
              ) : (
                playlists.map((playlist) => (
                  <Card 
                    key={playlist.id} 
                    className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setSelectedPlaylist(playlist.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{playlist.name}</h4>
                          {playlist.description && (
                            <p className="text-white/70 text-sm mt-1">{playlist.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={playlist.is_public ? "default" : "secondary"} className="text-xs">
                              {playlist.is_public ? "Public" : "Private"}
                            </Badge>
                            <span className="text-white/60 text-xs">
                              Created {new Date(playlist.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {playlist.is_public && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSharePlaylist(playlist);
                              }}
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          )}
                          <ListMusic className="h-5 w-5 text-white/60" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistViewer;
