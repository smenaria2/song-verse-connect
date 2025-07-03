import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Song } from "@/types/app";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useDeleteSong } from "@/hooks/useDeleteSong";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import SongReviewSection from "@/components/home/SongReviewSection";
import { formatGenre } from "@/utils/formatters/genre";
import { getYouTubeThumbnail } from "@/utils/youtube/helpers";

interface SongCardProps {
  song: Song;
  showReviewSection?: boolean;
  index?: number;
}

const SongCard = ({ song, showReviewSection = false, index = 0 }: SongCardProps) => {
  const { playPause, currentSong, isPlaying } = useAudioPlayer();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const deleteSong = useDeleteSong();

  const handleSongPlay = () => {
    console.log('SongCard: Play button clicked for song:', song.title);
    playPause({
      id: song.id,
      youtubeId: song.youtube_id,
      title: song.title,
      artist: song.artist
    });
  };

  const handleDeleteSong = async () => {
    const confirmMessage = isAdmin 
      ? `Are you sure you want to delete "${song.title}"? This action cannot be undone.`
      : `Are you sure you want to delete "${song.title}"? You can only delete songs that have no reviews.`;
      
    if (window.confirm(confirmMessage)) {
      deleteSong.mutate(song.id);
    }
  };

  // Show delete button if user owns the song or is admin
  const canShowDeleteButton = user && (song.submitter_id === user.id || isAdmin);

  // Check if this song is currently playing
  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  return (
    <Card 
      key={song.id}
      className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 animate-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          {/* Song Thumbnail */}
          <div className="relative aspect-video rounded-md overflow-hidden">
            <img 
              src={song.thumbnail_url || getYouTubeThumbnail(song.youtube_id)}
              alt={`${song.title} thumbnail`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getYouTubeThumbnail(song.youtube_id);
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button
                onClick={handleSongPlay}
                size="sm"
                className={`${
                  isCurrentlyPlaying 
                    ? 'bg-green-600/80 hover:bg-green-700' 
                    : 'bg-purple-600/80 hover:bg-purple-700'
                } text-white shadow-lg`}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
            {/* Playing indicator */}
            {isCurrentlyPlaying && (
              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Playing
              </div>
            )}
          </div>
          
          {/* Song Info */}
          <Link to={`/song/${song.id}`} className="flex-1">
            <div className="space-y-2">
              <h3 className="text-sm md:text-lg font-semibold text-white hover:text-purple-400 transition-colors text-break line-clamp-2">{song.title}</h3>
              <p className="text-white/70 text-xs md:text-sm text-break truncate">{song.artist}</p>
              <div className="flex items-center flex-wrap space-x-2 gap-y-1">
                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 text-xs">
                  {formatGenre(song.genre)}
                </Badge>
                <div className="flex items-center text-white/60 text-xs">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  {song.average_rating.toFixed(1)} ({song.review_count})
                </div>
              </div>
            </div>
          </Link>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2 flex-1">
              <AddToPlaylistModal songId={song.id} songTitle={song.title} />
              <Button
                onClick={handleSongPlay}
                variant="outline"
                size="sm"
                className={`${
                  isCurrentlyPlaying
                    ? 'border-green-500/50 bg-green-600/20 text-green-300 hover:bg-green-600/30'
                    : 'border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white'
                } flex-1`}
              >
                <Play className="h-4 w-4 mr-2" />
                {isCurrentlyPlaying ? 'Playing' : 'Play'}
              </Button>
            </div>
            
            {/* Delete Button */}
            {canShowDeleteButton && (
              <Button
                onClick={handleDeleteSong}
                variant="outline"
                size="sm"
                className="border-red-500/50 bg-red-600/20 text-red-300 hover:bg-red-600/30 hover:text-white"
                disabled={deleteSong.isPending}
                title={isAdmin ? "Delete song (Admin)" : "Delete song (no reviews only)"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Review Section */}
          {showReviewSection && <SongReviewSection song={song} />}
        </div>
      </CardContent>
    </Card>
  );
};

export default SongCard;