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
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerReadyRef = useRef(false);
  const apiLoadedRef = useRef(false);
  const pendingPlayRef = useRef(false);

  // Detect user interaction for autoplay policy
  useEffect(() => {
    const handleFirstInteraction = () => {
      setHasUserInteracted(true);
      setPlaybackError(null);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    if (!hasUserInteracted) {
      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);
      document.addEventListener('touchstart', handleFirstInteraction);
    }

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [hasUserInteracted]);

  // Load YouTube API
  const loadYouTubeAPI = useCallback(() => {
    if (apiLoadedRef.current || window.YT) return;
    
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
    pendingPlayRef.current = false;
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setIsDragging(false);
    setDragTime(0);
    setPlaybackError(null);
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
      
      // Handle pending play request
      if (pendingPlayRef.current && hasUserInteracted) {
        console.log('Executing pending play request');
        setTimeout(() => {
          try {
            event.target.playVideo();
            pendingPlayRef.current = false;
          } catch (error) {
            console.error('Pending play error:', error);
            setPlaybackError('Playback failed. Please try clicking play again.');
          }
        }, 100);
      }
    } catch (error) {
      console.error('Player ready error:', error);
      setPlaybackError('Player initialization failed.');
    }
  }, [volume, hasUserInteracted]);

  const onPlayerStateChange = useCallback((event: any) => {
    console.log('Player state changed:', event.data);
    
    try {
      const playerState = event.data;
      
      if (playerState === window.YT.PlayerState.PLAYING) {
        onPlayingChange(true);
        setIsLoading(false);
        setPlaybackError(null);
        pendingPlayRef.current = false;
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
      }
    } catch (error) {
      console.error('Player state change error:', error);
    }
  }, [onPlayingChange]);

  const onPlayerError = useCallback((event: any) => {
    console.error('YouTube player error:', event.data);
    setIsLoading(false);
    onPlayingChange(false);
    
    const errorMessages = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found or private',
      101: 'Video not available in your country',
      150: 'Video not available in your country'
    };
    
    const errorMessage = errorMessages[event.data as keyof typeof errorMessages] || 'Playback error occurred';
    setPlaybackError(errorMessage);
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
      // Better hiding method for desktop compatibility
      playerContainer.style.position = 'absolute';
      playerContainer.style.left = '-9999px';
      playerContainer.style.width = '1px';
      playerContainer.style.height = '1px';
      playerContainer.style.opacity = '0';
      playerContainer.style.pointerEvents = 'none';
      document.body.appendChild(playerContainer);
    }

    try {
      playerRef.current = new window.YT.Player('youtube-player-container', {
        height: '1',
        width: '1',
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
          enablejsapi: 1,
          html5: 1,
          // Additional params for better compatibility
          iv_load_policy: 3,
          cc_load_policy: 0,
          showinfo: 0,
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
      setPlaybackError('Failed to initialize player');
    }
  }, [youtubeId, onPlayerReady, onPlayerStateChange, onPlayerError]);

  // Control functions
  const handlePlayPause = useCallback(() => {
    console.log('Play/Pause clicked', { 
      isPlaying, 
      playerReady: playerReadyRef.current,
      hasUserInteracted,
      isMobile: navigator.userAgent.includes('Mobile'),
      userAgent: navigator.userAgent
    });

    // Check for user interaction requirement
    if (!hasUserInteracted) {
      setPlaybackError('Please click anywhere first to enable audio playback');
      return;
    }

    if (!playerRef.current) {
      console.log('Player not available');
      setPlaybackError('Player not ready');
      return;
    }

    if (!playerReadyRef.current) {
      console.log('Player not ready, storing play request');
      pendingPlayRef.current = !isPlaying;
      return;
    }

    setPlaybackError(null);

    try {
      if (isPlaying) {
        console.log('Pausing video');
        playerRef.current.pauseVideo();
      } else {
        console.log('Playing video');
        
        // Different approaches for desktop vs mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          playerRef.current.playVideo();
        } else {
          // Desktop: More careful approach
          try {
            const playPromise = playerRef.current.playVideo();
            
            // Handle promise-based play (newer browsers)
            if (playPromise && typeof playPromise.catch === 'function') {
              playPromise.catch((error: any) => {
                console.error('Desktop play promise failed:', error);
                setPlaybackError('Playback blocked. Please ensure audio is allowed in your browser.');
              });
            }
            
            // Fallback check after a short delay
            setTimeout(() => {
              try {
                const state = playerRef.current?.getPlayerState();
                if (state !== window.YT?.PlayerState?.PLAYING && state !== window.YT?.PlayerState?.BUFFERING) {
                  console.log('Play may have failed, trying again...');
                  playerRef.current?.playVideo();
                }
              } catch (fallbackError) {
                console.log('Fallback play check error:', fallbackError);
              }
            }, 500);
          } catch (desktopError) {
            console.error('Desktop play error:', desktopError);
            setPlaybackError('Playback failed. Try refreshing the page.');
          }
        }
      }
    } catch (error) {
      console.error('Play/pause error:', error);
      setPlaybackError('Playback control failed');
    }
  }, [isPlaying, hasUserInteracted]);

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
    setPlaybackError(null);
    playerReadyRef.current = false;
    pendingPlayRef.current = false;

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
    hasUserInteracted,
    playbackError,
    
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