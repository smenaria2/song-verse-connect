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
  const [audioData, setAudioData] = useState<number[]>(new Array(20).fill(0));
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerReadyRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

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
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
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
    setAudioData(new Array(20).fill(0));
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

      // Initialize audio visualizer
      initializeAudioVisualizer();
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
        startAudioVisualization();
      } else if (playerState === window.YT.PlayerState.PAUSED) {
        setIsPlaying(false);
        stopTimeUpdate();
        stopAudioVisualization();
      } else if (playerState === window.YT.PlayerState.BUFFERING) {
        setIsLoading(true);
      } else if (playerState === window.YT.PlayerState.ENDED) {
        setIsPlaying(false);
        setCurrentTime(0);
        stopTimeUpdate();
        stopAudioVisualization();
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

  const initializeAudioVisualizer = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
      }
    } catch (error) {
      console.log('Audio visualizer initialization failed:', error);
    }
  };

  const startAudioVisualization = () => {
    if (!analyserRef.current) return;

    const animate = () => {
      if (!isPlaying) return;

      // Generate mock audio data for visualization since we can't access YouTube's audio directly
      const newAudioData = Array.from({ length: 20 }, () => {
        const base = Math.random() * 0.3;
        const pulse = Math.sin(Date.now() * 0.01) * 0.2;
        return Math.max(0.1, base + pulse);
      });

      setAudioData(newAudioData);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopAudioVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setAudioData(new Array(20).fill(0.1));
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

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeekEnd = (newTime: number[]) => {
    setIsDragging(false);
    if (!playerRef.current || !playerReadyRef.current) return;

    try {
      playerRef.current.seekTo(newTime[0], true);
      setCurrentTime(newTime[0]);
    } catch (error) {
      console.error('Seek error:', error);
    }
  };

  const handleSeekChange = (newTime: number[]) => {
    if (isDragging) {
      setCurrentTime(newTime[0]);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !playerReadyRef.current || duration === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    try {
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (error) {
      console.error('Progress click error:', error);
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

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/20 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center space-x-4">
          {/* Song Info with Thumbnail */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-white/10">
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

          {/* Audio Visualizer */}
          <div className="hidden md:flex items-end space-x-1 h-8 flex-shrink-0">
            {audioData.map((height, index) => (
              <div
                key={index}
                className="bg-gradient-to-t from-purple-600 to-purple-400 rounded-sm transition-all duration-150"
                style={{
                  width: '3px',
                  height: `${Math.max(2, height * 24)}px`,
                  opacity: isPlaying ? 0.8 : 0.3
                }}
              />
            ))}
          </div>

          {/* Playback Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-purple-400 hover:bg-white/10 p-2"
              disabled
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              disabled={isLoading}
              className="text-white hover:text-purple-400 hover:bg-white/10 p-2"
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
              className="text-white hover:text-purple-400 hover:bg-white/10 p-2"
              disabled
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar and Time */}
          <div className="flex-1 min-w-0">
            {duration > 0 && !isLoading && (
              <div className="flex items-center space-x-2 text-xs text-white/70">
                <span className="whitespace-nowrap">{formatTime(currentTime)}</span>
                <div 
                  className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer relative group"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-150"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  <div 
                    className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                    style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-6px' }}
                  />
                </div>
                <span className="whitespace-nowrap">{formatTime(duration)}</span>
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              disabled={isLoading}
              className="text-white hover:text-purple-400 hover:bg-white/10 p-2"
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