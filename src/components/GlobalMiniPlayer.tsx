
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, X, Loader2 } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

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
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerReadyRef = useRef(false);

  useEffect(() => {
    if (!currentSong) {
      cleanupPlayer();
      return;
    }

    console.log('Loading song:', currentSong.title, 'YouTube ID:', currentSong.youtubeId);
    setIsLoading(true);
    playerReadyRef.current = false;

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      cleanupPlayer();
    };
  }, [currentSong?.youtubeId]);

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
  };

  const initializePlayer = () => {
    if (!currentSong || !window.YT || !window.YT.Player) {
      console.log('Cannot initialize player - missing dependencies');
      return;
    }

    // Cleanup existing player first
    cleanupPlayer();

    console.log('Initializing YouTube player for:', currentSong.youtubeId);

    // Create a hidden div for the player
    const playerContainer = document.createElement('div');
    playerContainer.id = `youtube-player-${Date.now()}`;
    playerContainer.style.display = 'none';
    document.body.appendChild(playerContainer);

    try {
      playerRef.current = new window.YT.Player(playerContainer.id, {
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
      
      if (isPlaying) {
        event.target.playVideo();
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
      if (playerRef.current && playerReadyRef.current) {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (error) {
          console.log('Time update error:', error);
        }
      }
    }, 1000);
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
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Mute error:', error);
    }
  };

  const handleSeek = (newTime: number[]) => {
    if (!playerRef.current || !playerReadyRef.current) return;

    try {
      playerRef.current.seekTo(newTime[0], true);
      setCurrentTime(newTime[0]);
    } catch (error) {
      console.error('Seek error:', error);
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
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/20 p-4 z-50">
      <div className="container mx-auto">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            disabled={isLoading}
            className="text-white hover:text-orange-400 hover:bg-white/10"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{currentSong.title}</p>
            <p className="text-white/70 text-xs truncate">{currentSong.artist}</p>
            {isLoading && (
              <p className="text-orange-400 text-xs">Loading...</p>
            )}
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              disabled={isLoading}
              className="text-white hover:text-orange-400 hover:bg-white/10"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <div className="w-20">
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

          {duration > 0 && !isLoading && (
            <div className="hidden sm:flex items-center space-x-2 text-xs text-white/70 min-w-0">
              <span className="whitespace-nowrap">{formatTime(currentTime)}</span>
              <div className="w-24 md:w-32">
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  max={duration}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="whitespace-nowrap">{formatTime(duration)}</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:text-orange-400 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GlobalMiniPlayer;
