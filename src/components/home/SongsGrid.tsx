
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Song } from "@/hooks/useSongs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import { InfiniteData } from "@tanstack/react-query";

interface SongsGridProps {
  data?: InfiniteData<Song[], unknown>;
  isLoading: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const SongsGrid = ({ data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage }: SongsGridProps) => {
  const { playPause } = useAudioPlayer();

  const handleSongPlay = (song: Song) => {
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

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
        {isLoading ? (
          <>
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-md animate-pulse">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="aspect-video bg-gray-600 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : data?.pages ? (
          data.pages.map((page) =>
            page.map((song) => (
              <Card key={song.id} className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300">
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
                          onClick={() => handleSongPlay(song)}
                          size="sm"
                          className="bg-purple-600/80 hover:bg-purple-700 text-white"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
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
                      <AddToPlaylistModal songId={song.id} songTitle={song.title} />
                      <Button
                        onClick={() => handleSongPlay(song)}
                        variant="outline"
                        size="sm"
                        className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        ) : null}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="text-center mt-8">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading More...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default SongsGrid;
