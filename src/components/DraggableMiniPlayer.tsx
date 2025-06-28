import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, X, Loader2, Move, Minimize2, Maximize2 } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Link } from 'react-router-dom';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const DraggableMiniPlayer = () => {
  const { currentSong, isPlaying, setIsPlaying, setCurrentSong } = useAudioPlayer();
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [audioData, setAudioData] = useState<number[]>(new Array(12).fill(0));
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerReadyRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

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
    setAudioData(new Array(12).fill(0));
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

      startAudioVisualization();
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

  const startAudioVisualization = () => {
    const animate = () => {
      if (!isPlaying) {
        setAudioData(new Array(12).fill(0.1));
        return;
      }

      // Generate mock audio data for visualization
      const newAudioData = Array.from({ length: 12 }, (_, i) => {
        const base = Math.random() * 0.4 + 0.1;
        const pulse = Math.sin((Date.now() + i * 100) * 0.005) * 0.3;
        return Math.max(0.1, Math.min(1, base + pulse));
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
    setAudioData(new Array(12).fill(0.1));
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!widgetRef.current) return;
    
    setIsDragging(true);
    const rect = widgetRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep widget within viewport bounds
    const maxX = window.innerWidth - 320;
    const maxY = window.innerHeight - (isMinimized ? 60 : 200);
    
    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

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
    <div
      ref={widgetRef}
      className={`fixed z-50 bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl transition-all duration-300 ${
        isDragging ? 'cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? '280px' : '320px',
        height: isMinimized ? '60px' : 'auto'
      }}
    >
      {/* Header with drag handle */}
      <div 
        className="flex items-center justify-between p-2 border-b border-white/10 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <Move className="h-4 w-4 text-white/60" />
          <span className="text-white/80 text-xs font-medium">Now Playing</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
          >
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white/60 hover:text-red-400 hover:bg-white/10 p-1 h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Minimized view */}
      {isMinimized ? (
        <div className="flex items-center space-x-3 p-2">
          <div className="w-8 h-8 rounded overflow-hidden bg-white/10 flex-shrink-0">
            <img 
              src={getYouTubeThumbnail(currentSong.youtubeId)}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{currentSong.title}</p>
            <p className="text-white/60 text-xs truncate">{currentSong.artist}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            disabled={isLoading}
            className="text-white hover:text-purple-400 hover:bg-white/10 p-1 h-8 w-8 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        /* Full view */
        <div className="p-4 space-y-4">
          {/* Song Info */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-md overflow-hidden bg-white/10 flex-shrink-0">
              <img 
                src={getYouTubeThumbnail(currentSong.youtubeId)}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
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
          </div>

          {/* Audio Visualizer */}
          <div className="flex items-end justify-center space-x-1 h-8">
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

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3">
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
          </div>

          {/* Progress Bar */}
          {duration > 0 && !isLoading && (
            <div className="space-y-2">
              <div 
                className="h-2 bg-white/20 rounded-full cursor-pointer relative group"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-150"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '-6px' }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/60">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              disabled={isLoading}
              className="text-white/60 hover:text-white hover:bg-white/10 p-1"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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
        </div>
      )}
    </div>
  );
};

export default DraggableMiniPlayer;