
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface MiniPlayerProps {
  youtubeId: string;
  title: string;
  artist: string;
}

const MiniPlayer = ({ youtubeId, title, artist }: MiniPlayerProps) => {
  const { isPlaying, setIsPlaying, currentSong, setCurrentSong } = useAudioPlayer();
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [youtubeId]);

  // Update player when song changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(youtubeId);
      if (isPlaying) {
        playerRef.current.playVideo();
      }
    }
  }, [youtubeId]);

  // Sync with global playing state
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying && currentSong?.youtubeId === youtubeId) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, currentSong?.youtubeId, youtubeId]);

  const initializePlayer = () => {
    if ((window as any).YT && (window as any).YT.Player) {
      playerRef.current = new (window as any).YT.Player(`youtube-player-${youtubeId}`, {
        height: '0',
        width: '0',
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }
  };

  const onPlayerReady = (event: any) => {
    setDuration(event.target.getDuration());
    event.target.setVolume(volume[0]);
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === (window as any).YT?.PlayerState?.PLAYING) {
      startTimeUpdate();
    } else {
      stopTimeUpdate();
    }
  };

  const startTimeUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
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
      if (isPlaying && currentSong?.youtubeId === youtubeId) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        // Set this as the current song
        setCurrentSong({
          id: youtubeId,
          youtubeId,
          title,
          artist
        });
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume[0]);
    }
  };

  const handleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (newTime: number[]) => {
    if (playerRef.current) {
      playerRef.current.seekTo(newTime[0], true);
      setCurrentTime(newTime[0]);
    }
  };

  const handleClose = () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    setIsPlaying(false);
    setCurrentSong(null);
    setIsVisible(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Only show if this is the current song and it's supposed to be visible
  if (!isVisible || !currentSong || currentSong.youtubeId !== youtubeId) {
    return <div id={`youtube-player-${youtubeId}`} style={{ display: 'none' }}></div>;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/20 p-3 space-y-2 z-50">
      <div id={`youtube-player-${youtubeId}`} style={{ display: 'none' }}></div>
      
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlayPause}
          className="text-white hover:text-orange-400 p-1 hover:bg-white/10"
        >
          {isPlaying && currentSong?.youtubeId === youtubeId ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{title}</p>
          <p className="text-white/70 text-xs truncate">{artist}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMute}
            className="text-white hover:text-orange-400 p-1 hover:bg-white/10"
          >
            {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          </Button>
          
          <div className="w-16">
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-white hover:text-red-400 p-1 hover:bg-white/10"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {duration > 0 && (
        <div className="flex items-center space-x-2 text-xs text-white/70">
          <span>{formatTime(currentTime)}</span>
          <div className="flex-1">
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={duration}
              step={1}
              className="w-full"
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
};

export default MiniPlayer;
