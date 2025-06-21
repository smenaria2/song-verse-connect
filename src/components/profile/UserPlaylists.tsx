
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListMusic, Play } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePlaylistWithSongs } from "@/hooks/usePlaylists";
import PlaylistModal from "@/components/PlaylistModal";
import PlaylistViewer from "@/components/PlaylistViewer";

interface UserPlaylistsProps {
  playlists: any[];
}

const UserPlaylists = ({ playlists }: UserPlaylistsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h3 className="text-xl font-semibold text-white">My Playlists</h3>
        <PlaylistModal />
      </div>
      <div className="grid gap-4">
        {playlists.length > 0 ? playlists.map((playlist, index) => (
          <PlaylistCard key={playlist.id} playlist={playlist} index={index} />
        )) : (
          <div className="text-center py-8 text-white/70">
            <div className="animate-bounce mb-4">
              <ListMusic className="h-12 w-12 text-white/40 mx-auto" />
            </div>
            <p>No playlists created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PlaylistCard = ({ playlist, index }: { playlist: any; index: number }) => {
  const { data: playlistWithSongs } = usePlaylistWithSongs(playlist.id);
  const { playPause } = useAudioPlayer();

  const handlePlayPlaylist = () => {
    if (playlistWithSongs?.songs?.length) {
      const firstSong = playlistWithSongs.songs[0];
      playPause({
        id: firstSong.id,
        youtubeId: firstSong.youtube_id,
        title: firstSong.title,
        artist: firstSong.artist
      });
    }
  };

  return (
    <Card 
      className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 animate-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="text-lg font-semibold text-white truncate">{playlist.name}</h3>
            {playlist.description && (
              <p className="text-white/70 text-sm truncate">{playlist.description}</p>
            )}
            <div className="flex items-center flex-wrap space-x-4 gap-y-2">
              <span className="text-white/60 text-sm">
                {playlistWithSongs?.songs?.length || 0} songs
              </span>
              {playlist.is_public && (
                <Badge variant="secondary" className="bg-green-600/20 text-green-300">
                  Public
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end space-x-2 md:ml-4">
            <div className="flex items-center space-x-2">
              <PlaylistViewer
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                  >
                    <ListMusic className="h-4 w-4 mr-2" />
                    View
                  </Button>
                }
              />
              {playlistWithSongs?.songs?.length > 0 && (
                <Button
                  onClick={handlePlayPlaylist}
                  variant="outline"
                  size="sm"
                  className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white"
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-right text-white/60 text-sm ml-4">
              <p>Created</p>
              <p>{new Date(playlist.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPlaylists;
