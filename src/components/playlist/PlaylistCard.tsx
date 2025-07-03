import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListMusic, Play, Pause } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { usePlaylistWithSongs } from "@/hooks/usePlaylists";
import ShareButton from "@/components/common/ShareButton";
import { Playlist } from "@/types/app";

interface PlaylistCardProps {
  playlist: Playlist;
  index?: number;
}

const PlaylistCard = ({ playlist, index = 0 }: PlaylistCardProps) => {
  const { data: playlistWithSongs } = usePlaylistWithSongs(playlist.id);
  const { playPause, currentSong, isPlaying } = useAudioPlayer();

  const handlePlayPlaylist = () => {
    if (playlistWithSongs?.songs?.length) {
      const firstSong = playlistWithSongs.songs[0];
      console.log('PlaylistCard: Playing first song from playlist:', firstSong.title);
      playPause({
        id: firstSong.id,
        youtubeId: firstSong.youtube_id,
        title: firstSong.title,
        artist: firstSong.artist
      });
    }
  };

  const shareUrl = `${window.location.origin}/playlist/${playlist.id}`;
  const shareTitle = playlist.name;
  const shareDescription = `Check out this ${playlist.is_public ? 'public' : ''} playlist: ${playlist.name}${playlist.description ? ` - ${playlist.description}` : ''}`;

  // Check if any song from this playlist is currently playing
  const isPlaylistSongPlaying = playlistWithSongs?.songs?.some(song => 
    currentSong?.id === song.id && isPlaying
  );

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
              {isPlaylistSongPlaying && (
                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                  Playing
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end space-x-2 md:ml-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
              >
                <ListMusic className="h-4 w-4 mr-2" />
                View
              </Button>
              {playlistWithSongs?.songs?.length > 0 && (
                <Button
                  onClick={handlePlayPlaylist}
                  variant="outline"
                  size="sm"
                  className={`${
                    isPlaylistSongPlaying
                      ? 'border-green-500/50 bg-green-600/20 text-green-300 hover:bg-green-600/30'
                      : 'border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white'
                  }`}
                >
                  {isPlaylistSongPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              )}
              {playlist.is_public && (
                <ShareButton
                  url={shareUrl}
                  title={shareTitle}
                  description={shareDescription}
                  className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                />
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

export default PlaylistCard;