import { useState, useRef, useEffect, useCallback } from 'react';
import { formatTime } from '@/utils/formatters/time';

interface UseYouTubePlayerProps {
  youtubeId?: string;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
}

// Declare YT global type for TypeScript
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
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

  // --- Time update functions (Declared FIRST to avoid ReferenceError) ---
  const stopTimeUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimeUpdate = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current && playerReadyRef.current && !isDragging) {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (error) {
          // This can happen if playerRef.current becomes null during the interval
          console.log('Time update error (player might be unmounted/destroyed):', error);
          stopTimeUpdate(); // Stop interval if player is gone
        }
      }
    }, 500);
  }, [isDragging, stopTimeUpdate]); // Added stopTimeUpdate to dependencies

  // --- Cleanup player (Now has `stopTimeUpdate` available) ---
  const cleanupPlayer = useCallback(() => {
    console.log('Cleaning up player');
    stopTimeUpdate(); // Use the declared function
    
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (error) {
        console.warn('Player cleanup error (safe to ignore in some cases):', error);
      }
      playerRef.current = null;
    }

    playerReadyRef.current = false;
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setIsDragging(false);
    setDragTime(0);
    onPlayingChange(false); // Ensure isPlaying state is reset
  }, [onPlayingChange, stopTimeUpdate]); // Added stopTimeUpdate to dependencies


  // --- Load YouTube API ---
  const loadYouTubeAPI = useCallback(() => {
    if (apiLoadedRef.current || (window.YT && window.YT.Player)) return;

    apiLoadedRef.current = true;
    const tag = document.createElement('script');
    // FIXED: Changed script URL to the correct one (https)
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;

    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }
  }, []);

  // --- Player event handlers (Now has `startTimeUpdate` and `stopTimeUpdate` available) ---
  const onPlayerReady = useCallback((event: any) => {
    console.log('Player ready');
    playerReadyRef.current = true;
    setIsLoading(false);

    try {
      const videoDuration = event.target.getDuration();
      setDuration(videoDuration);
      event.target.setVolume(volume[0]);

      // IMPORTANT AUTOPLAY ADJUSTMENT:
      // Removed automatic playVideo() call here.
      // The `isPlaying` state from `useAudioPlayer` will be handled by a dedicated useEffect below,
      // which will trigger `handlePlayPause` (which then calls `playVideo`).
      // This ensures play attempts are always triggered by user action or explicit state change,
      // respecting browser autoplay policies.
    } catch (error) {
      console.error('Player ready error:', error);
    }
  }, [volume]); // isPlaying removed as a dependency since its direct use for `playVideo` is removed here

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
      } else if (playerState === window.YT.PlayerState.CUED) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Player state change error:', error);
    }
  }, [onPlayingChange, startTimeUpdate, stopTimeUpdate]); // Dependencies are correct now

  const onPlayerError = useCallback((event: any) => {
    console.error('YouTube player error:', event.data);
    setIsLoading(false);
    onPlayingChange(false);
    alert(`Youtubeer Error: Code ${event.data}. This video might not be available or playable.`);
  }, [onPlayingChange]);


  // --- Initialize player ---
  const initializePlayer = useCallback(() => {
    if (!youtubeId) {
      console.log('No YouTube ID provided, skipping player initialization.');
      cleanupPlayer();
      return;
    }

    if (!window.YT || !window.YT.Player) {
      console.warn('YouTube API not fully loaded yet when trying to initialize player.');
      return;
    }

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying previous player:', error);
      }
      playerRef.current = null;
    }

    console.log('Initializing YouTube player for:', youtubeId);
    setIsLoading(true);

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
      onPlayingChange(false);
    }
  }, [youtubeId, cleanupPlayer, onPlayerReady, onPlayerStateChange, onPlayerError, onPlayingChange]);

  // --- Control functions ---
  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) {
      console.log('Player not ready for play/pause, attempting to initialize.');
      if (youtubeId && window.YT && window.YT.Player) {
          initializePlayer();
      }
      setIsLoading(true);
      return;
    }

    try {
      if (isPlaying) {
        console.log('Pausing video');
        playerRef.current.pauseVideo();
        stopTimeUpdate();
      } else {
        console.log('Playing video');
        playerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Play/pause error:', error);
      setIsLoading(false);
    }
  }, [isPlaying, youtubeId, initializePlayer, stopTimeUpdate]);

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
        if (volume[0] === 0) {
          setVolume([50]);
          playerRef.current.setVolume(50);
        }
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Mute error:', error);
    }
  }, [isMuted, volume]);

  const handleSeekChange = useCallback((newTime: number[]) => {
    setIsDragging(true);
    setDragTime(newTime[0]);
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

  // --- Effects ---

  // Effect for initial API loading and onYouTubeIframeAPIReady global callback
  useEffect(() => {
    if (!apiLoadedRef.current && !(window.YT && window.YT.Player)) {
      loadYouTubeAPI();
    }

    // This handles the global callback from the YouTube API script.
    // It's assigned once to ensure any subsequent calls to the script
    // (if somehow reloaded) correctly trigger initialization.
    // Ensure this doesn't overwrite if another script also sets it.
    if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        console.log('Global onYouTubeIframeAPIReady fired!');
        // If there's a youtubeId, attempt to initialize the player.
        // This makes sure player initialization happens *after* the API is truly ready.
        if (youtubeId) { // Only attempt to init if a song is present
          initializePlayer();
        }
      };
    }
    
    // Cleanup on component unmount
    return () => {
      // It's generally not recommended to unset window.onYouTubeIframeAPIReady
      // as other parts of the app might rely on it.
      // cleanupPlayer() will be called from the other useEffect when youtubeId changes or component unmounts.
    };
  }, [loadYouTubeAPI, initializePlayer, youtubeId]);


  // Effect to manage player creation/destruction based on youtubeId changes
  useEffect(() => {
    if (!youtubeId) {
      cleanupPlayer();
      return;
    }

    console.log('youtubeId changed, attempting to load song:', youtubeId);
    setIsLoading(true);
    playerReadyRef.current = false; // Player is not ready for the new ID

    // If the YT API is already loaded, initialize player immediately.
    // Otherwise, `window.onYouTubeIframeAPIReady` will handle it when the API loads.
    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      console.log('YouTube API not yet loaded, waiting for onYouTubeIframeAPIReady for new song...');
      // Ensure that when the API does load, it tries to initialize the player
      // based on the *current* youtubeId. The `onYouTubeIframeAPIReady` handler
      // in the previous effect will take care of this.
    }

    // Cleanup when youtubeId changes or component unmounts
    return () => {
      cleanupPlayer();
    };
  }, [youtubeId, initializePlayer, cleanupPlayer]);


  // Effect to synchronize play/pause state from `isPlaying` prop
  useEffect(() => {
      // Do nothing if player is not yet ready or no current song
      if (!playerRef.current || !playerReadyRef.current || !youtubeId) {
          // If we are currently trying to play but player is not ready,
          // it likely means we are waiting for initialization.
          if (isPlaying && !playerRef.current && youtubeId) {
            console.log('isPlaying is true but player not ready, waiting for init.');
            setIsLoading(true); // Keep loading state if we expect to play
          }
          return;
      }

      // Only attempt to play/pause if the desired state is different from current player state
      // (This prevents endless loops if `onPlayingChange` itself triggers this effect)
      const currentPlayerState = playerRef.current.getPlayerState();
      const isActuallyPlaying = currentPlayerState === window.YT.PlayerState.PLAYING;
      const isActuallyPaused = currentPlayerState === window.YT.PlayerState.PAUSED;

      if (isPlaying && !isActuallyPlaying) {
          console.log('`isPlaying` prop is true, attempting to play video.');
          try {
              playerRef.current.playVideo();
          } catch (error) {
              console.error('Failed to play video on isPlaying prop change:', error);
          }
      } else if (!isPlaying && !isActuallyPaused) {
          console.log('`isPlaying` prop is false, attempting to pause video.');
          try {
              playerRef.current.pauseVideo();
          } catch (error) {
              console.error('Failed to pause video on isPlaying prop change:', error);
          }
      }
  }, [isPlaying, playerReadyRef, playerRef, youtubeId]);


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