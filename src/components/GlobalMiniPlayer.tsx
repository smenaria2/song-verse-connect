import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, X, Loader2, SkipBack, SkipForward } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Link } from 'react-router-dom';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const GlobalMiniPlayer = () => {
  const { currentSong, isPlaying, setIsPlaying, setCurrentSong } = useAudioPlayer();
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerReadyRef = useRef(false);
  const apiLoadedRef = useRef(false);

  // Load YouTube API on component mount
  useEffect(() => {
    if (!apiLoadedRef.current && !window.YT) {
      loadYouTubeAPI();
    }
  }, []);

  useEffect(() => {
    if (!currentSong) {
      cleanupPlayer();
      return;
    }

    console.log('Loading song:', currentSong.title, 'YouTube ID:', currentSong.youtubeId);
    setIsLoading(true);
    playerReadyRef.current = false;

    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      // Wait for API to load
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
        initializePlayer();
      };
    }

    return () => {
      cleanupPlayer();
    };
  }, [currentSong?.youtubeId]);

  const loadYouTubeAPI = () => {
    if (apiLoadedRef.current) return;
    
    apiLoadedRef.current = true;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API loaded and ready');
      if (currentSong) {
        initializePlayer();
      }
    };
  };

  const cleanupPlayer = () => {
    console.log('Cleaning up player');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (error) {
        console.log('Player cleanup error (safe to ignore):', error);
      }
      playerRef.current = null;
    }
    
    playerReadyRef.current = false;
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setIsDragging(false);
    setDragTime(0);
  };

  const initializePlayer = () => {
    if (!currentSong || !window.YT || !window.YT.Player) {
      console.log('Cannot initialize player - missing dependencies');
      return;
    }

    // Cleanup existing player first
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.log('Error destroying previous player:', error);
      }
    }

    console.log('Initializing YouTube player for:', currentSong.youtubeId);

    // Create a hidden div for the player
    let playerContainer = document.getElementById('youtube-player-container');
    if (!playerContainer) {
      playerContainer = document.createElement('div');
      playerContainer.id = 'youtube-player-container';
      playerContainer.style.display = 'none';
      document.body.appendChild(playerContainer);
    }

    try {
      playerRef.current = new window.YT.Player('youtube-player-container', {
        height: '0',
        width: '0',
        videoId: currentSong.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error);
      setIsLoading(false);
    }
  };

  const onPlayerReady = (event: any) => {
    console.log('Player ready');
    playerReadyRef.current = true;
    setIsLoading(false);
    
    try {
      const videoDuration = event.target.getDuration();
      setDuration(videoDuration);
      event.target.setVolume(volume[0]);
      
      // Auto-play if the audio player state indicates it should be playing
      if (isPlaying) {
        setTimeout(() => {
          event.target.playVideo();
        }, 100);
      }
    } catch (error) {
      console.error('Player ready error:', error);
    }
  };

  const onPlayerStateChange = (event: any) => {
    console.log('Player state changed:', event.data);
    
    try {
      const playerState = event.data;
      
      if (playerState === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true);
        setIsLoading(false);
        startTimeUpdate();
      } else if (playerState === window.YT.PlayerState.PAUSED) {
        setIsPlaying(false);
        stopTimeUpdate();
      } else if (playerState === window.YT.PlayerState.BUFFERING) {
        setIsLoading(true);
      } else if (playerState === window.YT.PlayerState.ENDED) {
        setIsPlaying(false);
        setCurrentTime(0);
        stopTimeUpdate();
      }
    } catch (error) {
      console.error('Player state change error:', error);
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube player error:', event.data);
    setIsLoading(false);
    setIsPlaying(false);
  };

  const startTimeUpdate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerReadyRef.current && !isDragging) {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (error) {
          console.log('Time update error:', error);
        }
      }
    }, 500);
  };

  const stopTimeUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handlePlayPause = () => {
    if (!playerRef.current || !playerReadyRef.current) {
      console.log('Player not ready');
      return;
    }

    try {
      if (isPlaying) {
        console.log('Pausing video');
        playerRef.current.pauseVideo();
      } else {
        console.log('Playing video');
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Play/pause error:', error);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (playerRef.current && playerReadyRef.current) {
      try {
        playerRef.current.setVolume(newVolume[0]);
        if (newVolume[0] === 0) {
          setIsMuted(true);
        } else if (isMuted) {
          setIsMuted(false);
        }
      } catch (error) {
        console.error('Volume change error:', error);
      }
    }
  };

  const handleMute = () => {
    if (!playerRef.current || !playerReadyRef.current) return;

    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Mute error:', error);
    }
  };

  const handleSeekChange = (newTime: number[]) => {
    setIsDragging(true);
    setDragTime(newTime[0]);
    setCurrentTime(newTime[0]);
  };

  const handleSeekCommit = (newTime: number[]) => {
    if (!playerRef.current || !playerReadyRef.current) {
      setIsDragging(false);
      return;
    }

    try {
      const seekTime = newTime[0];
      playerRef.current.seekTo(seekTime, true);
      setCurrentTime(seekTime);
      setDragTime(0);
      setIsDragging(false);
    } catch (error) {
      console.error('Seek error:', error);
      setIsDragging(false);
    }
  };

  const handleClose = () => {
    console.log('Closing player');
    
    if (playerRef.current && playerReadyRef.current) {
      try {
        playerRef.current.stopVideo();
      } catch (error) {
        console.error('Stop error:', error);
      }
    }
    
    cleanupPlayer();
    setCurrentSong(null);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  if (!currentSong) return null;

  const displayTime = isDragging ? dragTime : currentTime;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/20 z-50 shadow-2xl">
      <div className="container mx-auto px-3 py-3">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="space-y-3">
            {/* Song Info Row */}
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
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
              
              <div className="flex-1 min-w-0">
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

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:text-red-400 hover:bg-white/10 p-2 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar Row */}
            {duration > 0 && !isLoading && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs text-white/70">
                  <span className="w-10 text-right font-mono">{formatTime(displayTime)}</span>
                  <div className="flex-1">
                    <Slider
                      value={[displayTime]}
                      onValueChange={handleSeekChange}
                      onValueCommit={handleSeekCommit}
                      max={duration}
                      step={0.1}
                      className="w-full cursor-pointer"
                    />
                  </div>
                  <span className="w-10 font-mono">{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Controls Row */}
            <div className="flex items-center justify-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 p-2"
                disabled
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={handlePlayPause}
                disabled={isLoading}
                className="text-white hover:text-purple-400 hover:bg-white/10 p-3 bg-white/10 rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10 p-2"
                disabled
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
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
                <span className="w-12 text-right font-mono">{formatTime(displayTime)}</span>
                <div className="flex-1 relative">
                  <Slider
                    value={[displayTime]}
                    onValueChange={handleSeekChange}
                    onValueCommit={handleSeekCommit}
                    max={duration}
                    step={0.1}
                    className="w-full cursor-pointer"
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
                className="w-full"
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