import { useState, useRef, useEffect, useCallback } from 'react';
import { formatTime } from '@/utils/formatters/time';

interface UseYouTubePlayerProps {
  youtubeId?: string;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
}

export const useYouTubePlayer = ({ youtubeId, isPlaying, onPlayingChange }: UseYouTubePlayerProps) => {
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

  // Load YouTube API
  const loadYouTubeAPI = useCallback(() => {
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
  }, []);

  // Cleanup player
  const cleanupPlayer = useCallback(() => {
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
  }, []);

  // Player event handlers
  const onPlayerReady = useCallback((event: any) => {
    console.log('Player ready');
    playerReadyRef.current = true;
    setIsLoading(false);
    
    try {
      const videoDuration = event.target.getDuration();
      setDuration(videoDuration);
      event.target.setVolume(volume[0]);
      
      if (isPlaying) {
        setTimeout(() => {
          event.target.playVideo();
        }, 100);
      }
    } catch (error) {
      console.error('Player ready error:', error);
    }
  }, [volume, isPlaying]);

  const onPlayerStateChange = useCallback((event: any) => {
    console.log('Player state changed:', event.data);
    
    try {
      const playerState = event.data;
      
      if (playerState === window.YT.PlayerState.PLAYING) {
        onPlayingChange(true);
        setIsLoading(false);
        startTimeUpdate();
      } else if (playerState === window.YT.PlayerState.PAUSED) {
        onPlayingChange(false);
        stopTimeUpdate();
      } else if (playerState === window.YT.PlayerState.BUFFERING) {
        setIsLoading(true);
      } else if (playerState === window.YT.PlayerState.ENDED) {
        onPlayingChange(false);
        setCurrentTime(0);
        stopTimeUpdate();
      }
    } catch (error) {
      console.error('Player state change error:', error);
    }
  }, [onPlayingChange]);

  const onPlayerError = useCallback((event: any) => {
    console.error('YouTube player error:', event.data);
    setIsLoading(false);
    onPlayingChange(false);
  }, [onPlayingChange]);

  // Time update functions
  const startTimeUpdate = useCallback(() => {
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
  }, [isDragging]);

  const stopTimeUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initialize player
  const initializePlayer = useCallback(() => {
    if (!youtubeId || !window.YT || !window.YT.Player) {
      console.log('Cannot initialize player - missing dependencies');
      return;
    }

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.log('Error destroying previous player:', error);
      }
    }

    console.log('Initializing YouTube player for:', youtubeId);

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
        videoId: youtubeId,
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
  }, [youtubeId, onPlayerReady, onPlayerStateChange, onPlayerError]);

  // Control functions
  const handlePlayPause = useCallback(() => {
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
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume: number[]) => {
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
  }, [isMuted]);

  const handleMute = useCallback(() => {
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
  }, [isMuted]);

  const handleSeekChange = useCallback((newTime: number[]) => {
    setIsDragging(true);
    setDragTime(newTime[0]);
    setCurrentTime(newTime[0]);
  }, []);

  const handleSeekCommit = useCallback((newTime: number[]) => {
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
  }, []);

  // Effects
  useEffect(() => {
    if (!apiLoadedRef.current && !window.YT) {
      loadYouTubeAPI();
    }
  }, [loadYouTubeAPI]);

  useEffect(() => {
    if (!youtubeId) {
      cleanupPlayer();
      return;
    }

    console.log('Loading song:', youtubeId);
    setIsLoading(true);
    playerReadyRef.current = false;

    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready');
        initializePlayer();
      };
    }

    return () => {
      cleanupPlayer();
    };
  }, [youtubeId, initializePlayer, cleanupPlayer]);

  return {
    // State
    volume,
    isMuted,
    currentTime: isDragging ? dragTime : currentTime,
    duration,
    isLoading,
    
    // Controls
    handlePlayPause,
    handleVolumeChange,
    handleMute,
    handleSeekChange,
    handleSeekCommit,
    
    // Utilities
    formatTime,
    cleanupPlayer
  };
};