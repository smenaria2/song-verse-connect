import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Play, Trash2, Pause, MessageSquare, User } from "lucide-react";
import { Song } from "@/types/app";
import { formatGenre } from "@/utils/formatters/genre";
import { formatDate } from "@/utils/formatters/date";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useDeleteSong } from "@/hooks/useDeleteSong";
import { useNavigate } from "react-router-dom";
import ShareButton from "@/components/common/ShareButton";
import { getYouTubeThumbnail } from "@/utils/youtube/helpers";

interface SongDetailsDisplayProps {
  song: Song;
}

const SongDetailsDisplay = ({ song }: SongDetailsDisplayProps) => {
  const { playPause, currentSong, isPlaying } = useAudioPlayer();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const deleteSong = useDeleteSong();
  const navigate = useNavigate();
  
  const shareUrl = `${window.location.origin}/song/${song.id}`;
  const shareTitle = `${song.title} by ${song.artist}`;
  const shareDescription = `Check out this amazing song on Song Monk! Rated ${song.average_rating.toFixed(1)}/5 by ${song.review_count} reviewers. ${song.review_count > 0 ? 'Join the conversation and share your thoughts!' : 'Be the first to review this song!'}`;
  
  // Enhanced metadata for better social sharing
  const shareMetadata = {
    url: shareUrl,
    title: shareTitle,
    description: shareDescription,
    image: song.thumbnail_url || getYouTubeThumbnail(song.youtube_id),
    type: 'music.song',
    site_name: 'Song Monk',
    artist: song.artist,
    duration: song.duration,
    genre: formatGenre(song.genre)
  };

  const handlePlaySong = () => {
    console.log('SongDetailsDisplay: Play button clicked for song:', song.title);
    playPause({
      id: song.id,
      youtubeId: song.youtube_id,
      title: song.title,
      artist: song.artist
    });
  };

  const handleDeleteSong = async () => {
    const confirmMessage = isAdmin 
      ? `Are you sure you want to delete "${song.title}"? This action cannot be undone and will remove all associated reviews and data.`
      : `Are you sure you want to delete "${song.title}"? You can only delete songs that have no reviews.`;
      
    if (window.confirm(confirmMessage)) {
      deleteSong.mutate(song.id, {
        onSuccess: () => {
          navigate('/');
        }
      });
    }
  };

  // Show delete button if user owns the song or is admin
  const canShowDeleteButton = user && (song.submitter_id === user.id || isAdmin);

  // Check if this song is currently playing
  const isCurrentSong = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md animate-in slide-in-from-top-4 duration-1000">
      <CardContent className="p-4 md:p-8">
        {/* Enhanced meta tags for social sharing */}
        <div style={{ display: 'none' }}>
          <meta property="og:url" content={shareMetadata.url} />
          <meta property="og:type" content={shareMetadata.type} />
          <meta property="og:title" content={shareMetadata.title} />
          <meta property="og:description" content={shareMetadata.description} />
          <meta property="og:image" content={shareMetadata.image} />
          <meta property="og:site_name" content={shareMetadata.site_name} />
          <meta property="music:musician" content={shareMetadata.artist} />
          <meta property="music:duration" content={shareMetadata.duration} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={shareMetadata.title} />
          <meta name="twitter:description" content={shareMetadata.description} />
          <meta name="twitter:image" content={shareMetadata.image} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* YouTube Player */}
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${song.youtube_id}?rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          </div>

          {/* Song Info */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 md:mb-2 space-y-3 md:space-y-0">
                {/* Mobile: Title takes full width, smaller font */}
                <h1 className="text-xl md:text-3xl font-bold text-white leading-tight md:flex-1 break-words">
                  {song.title}
                </h1>
                {/* Mobile: Action buttons below title */}
                <div className="md:ml-4 flex justify-end space-x-2">
                  <ShareButton
                    url={shareMetadata.url}
                    title={shareMetadata.title}
                    description={shareMetadata.description}
                    image={shareMetadata.image}
                    className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                    size="sm"
                  />
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
              </div>
              <p className="text-lg md:text-xl text-white/80 mb-3 md:mb-4 break-words">{song.artist}</p>
              
              <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                <Badge variant="secondary" className="bg-orange-600/20 text-orange-300 border-orange-600/30 text-xs">
                  {formatGenre(song.genre)}
                </Badge>
                {song.duration && (
                  <div className="flex items-center text-white/60 text-xs md:text-sm">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    {song.duration}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 md:space-x-4 mb-3 md:mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 md:h-5 md:w-5 ${
                        i < Math.floor(song.average_rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                  ))}
                  <span className="text-white/70 ml-2 text-sm md:text-base">
                    {song.average_rating.toFixed(1)} ({song.review_count} reviews)
                  </span>
                </div>
              </div>

              {/* Enhanced Play Button with better visibility and current state */}
              <div className="mb-4">
                <Button
                  onClick={handlePlaySong}
                  className={`${
                    isCurrentlyPlaying
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                  } text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 border-2 ${
                    isCurrentlyPlaying
                      ? 'border-green-400/30 hover:border-green-300/50'
                      : 'border-purple-400/30 hover:border-purple-300/50'
                  } backdrop-blur-sm`}
                  size="lg"
                  style={{
                    color: '#ffffff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    fontSize: '16px',
                    fontWeight: '700'
                  }}
                >
                  {isCurrentlyPlaying ? (
                    <>
                      <Pause className="h-6 w-6 mr-3 text-white drop-shadow-lg" />
                      <span className="text-white font-bold tracking-wide">Playing in Mini Player</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-6 w-6 mr-3 text-white drop-shadow-lg" />
                      <span className="text-white font-bold tracking-wide">Play in Mini Player</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Personal Note Section */}
              {song.personal_note && (
                <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 text-purple-400 mr-2" />
                    <h3 className="text-white font-medium text-sm">Personal Note from Submitter</h3>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                    {song.personal_note}
                  </p>
                </div>
              )}

              <div className="text-sm md:text-base space-y-1">
                <div className="flex items-center text-white/60">
                  <User className="h-4 w-4 mr-2" />
                  <span>
                    Submitted by <span className="text-orange-400">{song.submitter_username || 'Unknown'}</span>
                    {isAdmin && song.submitter_id === user?.id && (
                      <span className="ml-2 text-purple-400 text-xs">(You)</span>
                    )}
                  </span>
                </div>
                <p className="text-white/60 text-xs md:text-sm ml-6">
                  {formatDate(song.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongDetailsDisplay;