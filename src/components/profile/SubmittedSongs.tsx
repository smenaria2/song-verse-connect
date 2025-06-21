
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";

interface SubmittedSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  average_rating: number;
  review_count: number;
  created_at: string;
  youtube_id: string;
}

interface SubmittedSongsProps {
  songs: SubmittedSong[];
}

const SubmittedSongs = ({ songs }: SubmittedSongsProps) => {
  const { playPause } = useAudioPlayer();

  const handleSongPlay = (song: SubmittedSong) => {
    playPause({
      id: song.id,
      youtubeId: song.youtube_id,
      title: song.title,
      artist: song.artist
    });
  };

  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (songs.length === 0) {
    return (
      <div className="text-center py-8 text-white/70">
        <div className="animate-bounce mb-4">
          <Music className="h-12 w-12 text-white/40 mx-auto" />
        </div>
        <p>No songs submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {songs.map((song, index) => (
        <Card 
          key={song.id}
          className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 animate-in slide-in-from-left-4"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
              <Link to={`/song/${song.id}`} className="flex-1 min-w-0">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white hover:text-purple-400 transition-colors truncate">{song.title}</h3>
                  <p className="text-white/70 truncate">{song.artist}</p>
                  <div className="flex items-center flex-wrap space-x-4 gap-y-2">
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                      {formatGenre(song.genre)}
                    </Badge>
                    <div className="flex items-center text-white/60 text-sm">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {song.average_rating.toFixed(1)} ({song.review_count} reviews)
                    </div>
                  </div>
                </div>
              </Link>
              <div className="flex items-center justify-between md:justify-end space-x-2 md:ml-4">
                <div className="flex items-center space-x-2">
                  <AddToPlaylistModal songId={song.id} songTitle={song.title} />
                  <Button
                    onClick={() => handleSongPlay(song)}
                    variant="outline"
                    size="sm"
                    className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right text-white/60 text-sm ml-4">
                  <p>Submitted</p>
                  <p>{formatDate(song.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubmittedSongs;
