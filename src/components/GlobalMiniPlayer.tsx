import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, X, Loader2, SkipBack, SkipForward, AlertCircle } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { Link } from 'react-router-dom';
import { getYouTubeThumbnail } from '@/utils/youtube/helpers';

const GlobalMiniPlayer = () => {
  const { currentSong, isPlaying, setIsPlaying, setCurrentSong } = useAudioPlayer();

  const {
    volume,
    isMuted,
    currentTime,
    duration,
    isLoading,
    hasUserInteracted,
    playbackError,
    isMobile,
    handlePlayPause,
    handleVolumeChange,
    handleMute,
    handleSeekChange,
    handleSeekCommit,
    formatTime,
    cleanupPlayer,
    clearError
  } = useYouTubePlayer({
    youtubeId: currentSong?.youtubeId,
    isPlaying,
    onPlayingChange: setIsPlaying
  });

  const handleClose = () => {
    console.log('Closing player');
    cleanupPlayer();
    setCurrentSong(null);
    setIsPlaying(false);
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/20 z-50 shadow-2xl">
      <div className="container mx-auto px-3 py-2">
        {/* Error Display */}
        {playbackError && (
          <div className="mb-2 p-2 bg-red-600/20 border border-red-600/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                <p className="text-red-200 text-xs">{playbackError}</p>
              </div>
              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 p-1 h-auto"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* User Interaction Prompt for Mobile */}
        {!hasUserInteracted && isMobile && (
          <div className="mb-2 p-2 bg-blue-600/20 border border-blue-600/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
              <p className="text-blue-200 text-xs">Tap anywhere to enable audio playback</p>
            </div>
          </div>
        )}

        {/* Mobile Layout - MADE MUCH SMALLER */}
        <div className="block md:hidden">
          <div className="space-y-1">
            {/* Song Info Row - Much smaller padding and elements */}
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white/10 flex-shrink-0">
                <img 
                  src={getYouTubeThumbnail(currentSong.youtubeId)}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-2 w-2 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/song/${currentSong.id}`}
                  className="block hover:text-purple-400 transition-colors"
                >
                  <p className="text-white text-xs font-medium truncate hover:underline">
                    {currentSong.title}
                  </p>
                </Link>
                <p className="text-white/70 text-xs truncate">{currentSong.artist}</p>
              </div>

              {/* Controls in same row - much smaller buttons */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Button
                  onClick={handlePlayPause}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="text-white hover:text-purple-400 hover:bg-white/10 p-1 bg-white/10 rounded-full min-h-[24px] min-w-[24px]"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>

                <Button
                  onClick={handleMute}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="text-white hover:text-purple-400 hover:bg-white/10 p-1 min-h-[24px] min-w-[24px]"
                >
                  {isMuted || volume[0] === 0 ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>

                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-red-400 hover:bg-white/10 p-1 flex-shrink-0 min-h-[24px] min-w-[24px]"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Progress Bar Row - Only show if duration available, much smaller */}
            {duration > 0 && !isLoading && (
              <div className="flex items-center space-x-1 text-xs text-white/70">
                <span className="w-6 text-right font-mono text-xs">{formatTime(currentTime)}</span>
                <div className="flex-1">
                  <Slider
                    value={[currentTime]}
                    onValueChange={handleSeekChange}
                    onValueCommit={handleSeekCommit}
                    max={duration}
                    step={0.1}
                    className="w-full cursor-pointer mini-player-slider"
                  />
                </div>
                <span className="w-6 font-mono text-xs">{formatTime(duration)}</span>
              </div>
            )}

            {/* Volume Control - Very compact */}
            <div className="flex items-center justify-center space-x-1 px-1">
              <div className="flex-1 max-w-16">
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full mini-player-slider"
                  disabled={isLoading}
                />
              </div>
              <span className="text-white/60 text-xs w-4 text-center">{volume[0]}</span>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Keep existing size */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Song Info */}
          <div className="flex items-center space-x-3 w-80 flex-shrink-0">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/10">
              <img 
                src={getYouTubeThumbnail(currentSong.youtubeId)}
                alt={currentSong.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <Link 
                to={`/song/${currentSong.id}`}
                className="block hover:text-purple-400 transition-colors"
              >
                <p className="text-white text-sm font-medium truncate hover:underline">
                  {currentSong.title}
                </p>
              </Link>
              <p className="text-white/70 text-xs truncate">{currentSong.artist}</p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10 p-2"
              disabled
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              disabled={isLoading}
              className="text-white hover:text-purple-400 hover:bg-white/10 p-2 bg-white/10 rounded-full"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10 p-2"
              disabled
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar and Time */}
          <div className="flex-1 min-w-0">
            {duration > 0 && !isLoading && (
              <div className="flex items-center space-x-3 text-xs text-white/70">
                <span className="w-12 text-right font-mono">{formatTime(currentTime)}</span>
                <div className="flex-1 relative">
                  <Slider
                    value={[currentTime]}
                    onValueChange={handleSeekChange}
                    onValueCommit={handleSeekCommit}
                    max={duration}
                    step={0.1}
                    className="w-full cursor-pointer mini-player-slider"
                  />
                </div>
                <span className="w-12 font-mono">{formatTime(duration)}</span>
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 w-32 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              disabled={isLoading}
              className="text-white hover:text-purple-400 hover:bg-white/10 p-2"
            >
              {isMuted || volume[0] === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1">
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full mini-player-slider"
                disabled={isLoading}
              />
            </div>
          </div>
          
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:text-red-400 hover:bg-white/10 p-2 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalMiniPlayer;