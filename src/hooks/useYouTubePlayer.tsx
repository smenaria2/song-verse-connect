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
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerReadyRef = useRef(false);
  const apiLoadedRef = useRef(false);
  const retryCountRef = useRef(0);
  const isInitializingRef = useRef(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
      console.log('Mobile device detected:', isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced user interaction detection for mobile
  useEffect(() => {
    const handleFirstInteraction = (event: Event) => {
      console.log('User interaction detected:', event.type);
      setHasUserInteracted(true);
      setPlaybackError(null);
      
      // Remove all interaction listeners
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('touchend', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
    };

    if (!hasUserInteracted) {
      // Add multiple interaction listeners for mobile
      document.addEventListener('click', handleFirstInteraction, { passive: true });
      document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
      document.addEventListener('touchend', handleFirstInteraction, { passive: true });
      document.addEventListener('keydown', handleFirstInteraction, { passive: true });
      document.addEventListener('scroll', handleFirstInteraction, { passive: true });
    }

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('touchend', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
    };
  }, [hasUserInteracted]);

  // Load YouTube API
  const loadYouTubeAPI = useCallback(() => {
    if (apiLoadedRef.current || window.YT) return;
    
    console.log('Loading YouTube API...');
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
    retryCountRef.current = 0;
    isInitializingRef.current = false;
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setIsDragging(false);
    setDragTime(0);
    setPlaybackError(null);
  }, []);

  // Player event handlers
  const onPlayerReady = useCallback((event: any) => {
    console.log('Player ready for mobile:', isMobile);
    playerReadyRef.current = true;
    isInitializingRef.current = false;
    setIsLoading(false);
    
    try {
      const videoDuration = event.target.getDuration();
      setDuration(videoDuration);
      event.target.setVolume(volume[0]);
      
      // Mobile-specific setup
      if (isMobile) {
        // Set quality to auto for better mobile performance
        try {
          event.target.setPlaybackQuality('auto');
        } catch (error) {
          console.log('Could not set playback quality:', error);
        }
      }
      
      // If isPlaying is true and user has interacted, start playing
      if (isPlaying && hasUserInteracted) {
        console.log('Player ready and should be playing - starting playback');
        setTimeout(() => {
          try {
            event.target.playVideo();
          } catch (error) {
            console.error('Auto-play after ready error:', error);
            setPlaybackError('Playback failed. Please try tapping play again.');
          }
        }, isMobile ? 500 : 200);
      }
    } catch (error) {
      console.error('Player ready error:', error);
      setPlaybackError('Player initialization failed.');
    }
  }, [volume, hasUserInteracted, isMobile, isPlaying]);

  const onPlayerStateChange = useCallback((event: any) => {
    console.log('Player state changed:', event.data, 'Mobile:', isMobile);
    
    try {
      const playerState = event.data;
      
      if (playerState === window.YT.PlayerState.PLAYING) {
        onPlayingChange(true);
        setIsLoading(false);
        setPlaybackError(null);
        retryCountRef.current = 0;
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
      } else if (playerState === window.YT.PlayerState.CUED) {
        setIsLoading(false);
        // If isPlaying is true and user has interacted, start playing
        if (isPlaying && hasUserInteracted) {
          console.log('Video cued and should be playing - starting playback');
          setTimeout(() => {
            try {
              event.target.playVideo();
            } catch (error) {
              console.error('Auto-play after cue error:', error);
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Player state change error:', error);
    }
  }, [onPlayingChange, isMobile, hasUserInteracted, isPlaying]);

  const onPlayerError = useCallback((event: any) => {
    console.error('YouTube player error:', event.data, 'Mobile:', isMobile);
    setIsLoading(false);
    onPlayingChange(false);
    
    const errorMessages = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found or private',
      101: 'Video not available in your region',
      150: 'Video not available in your region'
    };
    
    const errorMessage = errorMessages[event.data as keyof typeof errorMessages] || 'Playback error occurred';
    
    if (isMobile) {
      setPlaybackError(`${errorMessage}. Try refreshing the page.`);
    } else {
      setPlaybackError(errorMessage);
    }
  }, [onPlayingChange, isMobile]);

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
    }, isMobile ? 1000 : 500); // Slower updates on mobile for better performance
  }, [isDragging, isMobile]);

  const stopTimeUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initialize player with mobile optimizations
  const initializePlayer = useCallback(() => {
    if (!youtubeId || !window.YT || !window.YT.Player || isInitializingRef.current) {
      console.log('Cannot initialize player - missing dependencies or already initializing');
      return;
    }

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.log('Error destroying previous player:', error);
      }
    }

    console.log('Initializing YouTube player for mobile:', isMobile, 'Video:', youtubeId);
    isInitializingRef.current = true;

    let playerContainer = document.getElementById('youtube-player-container');
    if (!playerContainer) {
      playerContainer = document.createElement('div');
      playerContainer.id = 'youtube-player-container';
      // Mobile-optimized hiding
      playerContainer.style.position = 'fixed';
      playerContainer.style.left = '-9999px';
      playerContainer.style.top = '-9999px';
      playerContainer.style.width = '1px';
      playerContainer.style.height = '1px';
      playerContainer.style.opacity = '0';
      playerContainer.style.pointerEvents = 'none';
      playerContainer.style.zIndex = '-1';
      document.body.appendChild(playerContainer);
    }

    try {
      const playerVars = {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        origin: window.location.origin,
        enablejsapi: 1,
        html5: 1,
        iv_load_policy: 3,
        cc_load_policy: 0,
        showinfo: 0,
        // Mobile-specific optimizations
        ...(isMobile && {
          quality: 'auto',
          vq: 'auto',
          // Force HTML5 player on mobile
          html5: 1,
          // Disable annotations
          iv_load_policy: 3,
          // Optimize for mobile bandwidth
          start: 0
        })
      };

      playerRef.current = new window.YT.Player('youtube-player-container', {
        height: '1',
        width: '1',
        videoId: youtubeId,
        playerVars,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error);
      setIsLoading(false);
      isInitializingRef.current = false;
      setPlaybackError('Failed to initialize player');
    }
  }, [youtubeId, onPlayerReady, onPlayerStateChange, onPlayerError, isMobile]);

  // NEW: Effect to sync isPlaying prop with YouTube player state
  useEffect(() => {
    if (!playerRef.current || !playerReadyRef.current || !hasUserInteracted) {
      return;
    }

    console.log('Syncing player state - isPlaying:', isPlaying);

    try {
      if (isPlaying) {
        console.log('Starting playback via effect');
        playerRef.current.playVideo();
      } else {
        console.log('Pausing playback via effect');
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      console.error('Error syncing player state:', error);
      setPlaybackError('Playback control failed');
    }
  }, [isPlaying, hasUserInteracted]);

  // Simplified play/pause handler - only toggles state
  const handlePlayPause = useCallback(() => {
    console.log('Play/Pause clicked', { 
      isPlaying, 
      playerReady: playerReadyRef.current,
      hasUserInteracted,
      isMobile,
      isInitializing: isInitializingRef.current
    });

    // Check for user interaction requirement
    if (!hasUserInteracted) {
      setPlaybackError('Please tap anywhere first to enable audio playback');
      return;
    }

    if (!playerRef.current || isInitializingRef.current) {
      console.log('Player not available or still initializing');
      setPlaybackError('Player not ready');
      return;
    }

    setPlaybackError(null);

    // Simply toggle the playing state - the effect above will handle the actual play/pause
    console.log('Toggling isPlaying from', isPlaying, 'to', !isPlaying);
    onPlayingChange(!isPlaying);
  }, [isPlaying, hasUserInteracted, isMobile, onPlayingChange]);

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

  // Clear error when user interacts
  const clearError = useCallback(() => {
    setPlaybackError(null);
    retryCountRef.current = 0;
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

    console.log('Loading song for mobile:', isMobile, 'Video:', youtubeId);
    setIsLoading(true);
    setPlaybackError(null);
    playerReadyRef.current = false;
    retryCountRef.current = 0;
    isInitializingRef.current = false;

    if (window.YT && window.YT.Player) {
      // Add delay for mobile to ensure proper initialization
      const initDelay = isMobile ? 300 : 100;
      setTimeout(() => {
        initializePlayer();
      }, initDelay);
    } else {
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API ready for mobile:', isMobile);
        const initDelay = isMobile ? 500 : 200;
        setTimeout(() => {
          initializePlayer();
        }, initDelay);
      };
    }

    return () => {
      cleanupPlayer();
    };
  }, [youtubeId, initializePlayer, cleanupPlayer, isMobile]);

  return {
    // State
    volume,
    isMuted,
    currentTime: isDragging ? dragTime : currentTime,
    duration,
    isLoading,
    hasUserInteracted,
    playbackError,
    isMobile,
    
    // Controls
    handlePlayPause,
    handleVolumeChange,
    handleMute,
    handleSeekChange,
    handleSeekCommit,
    clearError,
    
    // Utilities
    formatTime,
    cleanupPlayer
  };
};