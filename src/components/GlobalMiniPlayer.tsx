
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

const GlobalMiniPlayer = () => {
  const { currentSong, isPlaying, setIsPlaying, setCurrentSong } = useAudioPlayer();
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentSong) {
      cleanupPlayer();
      return;
    }

    // Load YouTube IFrame API
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      (window as any).onYouTubeIframeAPIReady = () => {
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
  };

  const initializePlayer = () => {
    if (!currentSong || !(window as any).YT || !(window as any).YT.Player) return;

    // Cleanup existing player first
    cleanupPlayer();

    // Create a unique container for this player instance
    const playerId = `youtube-player-${currentSong.id}-${Date.now()}`;
    
    try {
      playerRef.current = new (window as any).YT.Player(playerId, {
        height: '0',
        width: '0',
        videoId: currentSong.youtubeId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: (error: any) => {
            console.log('YouTube player error:', error);
          },
        },
      });
    } catch (error) {
      console.log('Failed to initialize YouTube player:', error);
    }
  };

  const onPlayerReady = (event: any) => {
    try {
      setDuration(event.target.getDuration());
      event.target.setVolume(volume[0]);
      if (isPlaying) {
        event.target.playVideo();
      }
    } catch (error) {
      console.log('Player ready error:', error);
    }
  };

  const onPlayerStateChange = (event: any) => {
    try {
      if (event.data === (window as any).YT?.PlayerState?.PLAYING) {
        setIsPlaying(true);
        startTimeUpdate();
      } else if (event.data === (window as any).YT?.PlayerState?.PAUSED) {
        setIsPlaying(false);
        stopTimeUpdate();
      }
    } catch (error) {
      console.log('Player state change error:', error);
    }
  };

  const startTimeUpdate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          setCurrentTime(playerRef.current.getCurrentTime());
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
    if (playerRef.current) {
      try {
        if (isPlaying) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      } catch (error) {
        console.log('Play/pause error:', error);
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(newVolume[0]);
      } catch (error) {
        console.log('Volume change error:', error);
      }
    }
  };

  const handleMute = () => {
    if (playerRef.current) {
      try {
        if (isMuted) {
          playerRef.current.unMute();
        } else {
          playerRef.current.mute();
        }
        setIsMuted(!isMuted);
      } catch (error) {
        console.log('Mute error:', error);
      }
    }
  };

  const handleSeek = (newTime: number[]) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(newTime[0], true);
        setCurrentTime(newTime[0]);
      } catch (error) {
        console.log('Seek error:', error);
      }
    }
  };

  const handleClose = () => {
    if (playerRef.current) {
      try {
        playerRef.current.pauseVideo();
      } catch (error) {
        console.log('Close error:', error);
      }
    }
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
    <>
      <div 
        ref={playerContainerRef}
        id={`youtube-player-${currentSong.id}-${Date.now()}`} 
        style={{ display: 'none' }}
      ></div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/20 p-4 z-50">
        <div className="container mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="text-white hover:text-orange-400 hover:bg-white/10"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentSong.title}</p>
              <p className="text-white/70 text-xs truncate">{currentSong.artist}</p>
            </div>
            
            <div className="hidden md:flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMute}
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
                />
              </div>
            </div>

            {duration > 0 && (
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
    </>
  );
};

export default GlobalMiniPlayer;
