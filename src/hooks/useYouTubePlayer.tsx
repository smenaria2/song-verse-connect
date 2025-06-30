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

  // Load YouTube API - FIX: Correct URL and use HTTPS
  const loadYouTubeAPI = useCallback(() => {
    // Only load the script if it hasn't been loaded yet AND YT API is not already available
    if (apiLoadedRef.current || (window.YT && window.YT.Player)) return;

    apiLoadedRef.current = true;
    const tag = document.createElement('script');
    // FIXED: Changed script URL to the correct one (https)
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;

    // Ensure the script is inserted correctly
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
        // This error can occur if the player is already destroyed or not fully initialized, safe to ignore
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
  }, [onPlayingChange]); // Added onPlayingChange to dependencies

  // Player event handlers
  const onPlayerReady = useCallback((event: any) => {
    console.log('Player ready');
    playerReadyRef.current = true;
    setIsLoading(false);

    try {
      const videoDuration = event.target.getDuration();
      setDuration(videoDuration);
      event.target.setVolume(volume[0]);

      // IMPORTANT AUTOPLAY FIX/ADJUSTMENT:
      // Removed automatic playVideo() call here.
      // Autoplay is strictly enforced on desktop browsers and often requires direct user interaction.
      // The `handlePlayPause` function (triggered by a user click) should be the primary entry point for playing.
      // If `isPlaying` is true *from an earlier user interaction* on the previous song, we'll let handlePlayPause handle it.
      // If a song is selected without a play interaction, it should just load and be ready.
      if (isPlaying) {
         // If `isPlaying` is true here, it means the app's state indicates playback should resume.
         // However, due to autoplay policies, `playVideo()` might still be blocked.
         // The `onPlayingChange` in `onPlayerStateChange` will correct `isPlaying` if playback doesn't start.
         // No need for a setTimeout here; if it's going to play, it should try immediately.
         // playerRef.current.playVideo(); // <-- Removed this, as it's often blocked unless from user gesture
      }


    } catch (error) {
      console.error('Player ready error:', error);
    }
  }, [volume, isPlaying]); // isPlaying is still a dependency, but its direct use for `playVideo` is removed here

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
        // When a video is CUED, it's ready to play but not yet playing.
        // This is a good state to set isLoading to false if it's still true.
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Player state change error:', error);
    }
  }, [onPlayingChange, startTimeUpdate, stopTimeUpdate]); // Added startTimeUpdate, stopTimeUpdate to dependencies

  const onPlayerError = useCallback((event: any) => {
    console.error('YouTube player error:', event.data);
    // Error codes:
    // 2 – The request contains an invalid parameter value.
    // 5 – The requested content cannot be played in an HTML5 player or another error related to the HTML5 player.
    // 100 – The video requested was not found.
    // 101 or 150 – The owner of the requested video does not allow it to be played in embedded players.
    setIsLoading(false);
    onPlayingChange(false);
    // Optionally, add more specific error handling, e.g., show a message to the user.
    alert(`Youtubeer Error: Code ${event.data}. This video might not be available or playable.`);
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
          // This can happen if playerRef.current becomes null during the interval
          console.log('Time update error (player might be unmounted/destroyed):', error);
          stopTimeUpdate(); // Stop interval if player is gone
        }
      }
    }, 500);
  }, [isDragging]); // Added stopTimeUpdate to dependencies to avoid lint warning

  const stopTimeUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Initialize player
  const initializePlayer = useCallback(() => {
    if (!youtubeId) {
      console.log('No YouTube ID provided, skipping player initialization.');
      cleanupPlayer(); // Ensure player is cleaned if no ID
      return;
    }

    // Ensure YT object is available before attempting to create player
    if (!window.YT || !window.YT.Player) {
      console.warn('YouTube API not fully loaded yet when trying to initialize player.');
      return; // Will be called again when window.onYouTubeIframeAPIReady fires
    }

    // Destroy existing player if present to prevent memory leaks and ghost players
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Error destroying previous player:', error);
      }
      playerRef.current = null;
    }

    console.log('Initializing YouTube player for:', youtubeId);
    setIsLoading(true); // Set loading while new player initializes

    let playerContainer = document.getElementById('youtube-player-container');
    if (!playerContainer) {
      playerContainer = document.createElement('div');
      playerContainer.id = 'youtube-player-container';
      playerContainer.style.display = 'none'; // Keep it hidden
      document.body.appendChild(playerContainer);
    }

    try {
      playerRef.current = new window.YT.Player('youtube-player-container', {
        height: '0',
        width: '0',
        videoId: youtubeId,
        playerVars: {
          autoplay: 0, // Explicitly set autoplay to 0 to respect policies
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin, // Important for security and API calls
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


  // Control functions
  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) {
      console.log('Player not ready for play/pause, attempting to initialize.');
      // If player isn't ready but a play/pause action is attempted,
      // and we have a youtubeId, try to initialize it.
      if (youtubeId && window.YT && window.YT.Player) {
          initializePlayer();
      }
      // Set isLoading true to reflect that we are waiting for player
      setIsLoading(true);
      return;
    }

    try {
      if (isPlaying) {
        console.log('Pausing video');
        playerRef.current.pauseVideo();
        stopTimeUpdate(); // Ensure time updates stop on pause
      } else {
        console.log('Playing video');
        playerRef.current.playVideo();
        // The onPlayerStateChange will set isPlaying to true and start time updates
        // once the player actually begins playing (YT.PlayerState.PLAYING).
        // This is important because `playVideo()` might be asynchronous or blocked.
      }
    } catch (error) {
      console.error('Play/pause error:', error);
      setIsLoading(false); // If there's an error, stop loading state
    }
  }, [isPlaying, youtubeId, initializePlayer, stopTimeUpdate]); // Added initializePlayer, stopTimeUpdate

  const handleVolumeChange = useCallback((newVolume: number[]) => {
    setVolume(newVolume);
    if (playerRef.current && playerReadyRef.current) {
      try {
        playerRef.current.setVolume(newVolume[0]);
        // Sync mute state if volume is set to 0 or unmuted
        if (newVolume[0] === 0) {
          setIsMuted(true);
        } else if (isMuted) {
          setIsMuted(false);
        }
      } catch (error) {
        console.error('Volume change error:', error);
      }
    }
  }, [isMuted]); // isMuted added to dependencies

  const handleMute = useCallback(() => {
    if (!playerRef.current || !playerReadyRef.current) return;

    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
        // Restore volume if it was muted and not 0, otherwise set to a default (e.g., 50)
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
  }, [isMuted, volume]); // volume added to dependencies

  const handleSeekChange = useCallback((newTime: number[]) => {
    setIsDragging(true);
    setDragTime(newTime[0]);
    // setCurrentTime(newTime[0]); // Don't update currentTime immediately, let dragTime handle visual
  }, []);

  const handleSeekCommit = useCallback((newTime: number[]) => {
    if (!playerRef.current || !playerReadyRef.current) {
      setIsDragging(false);
      return;
    }

    try {
      const seekTime = newTime[0];
      playerRef.current.seekTo(seekTime, true); // `true` for allowSeekAhead
      setCurrentTime(seekTime); // Update current time after commit
      setDragTime(0); // Reset drag time
      setIsDragging(false);
    } catch (error) {
      console.error('Seek error:', error);
      setIsDragging(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    // Load API only once, at component mount if YT is not already available
    if (!apiLoadedRef.current && !(window.YT && window.YT.Player)) {
      loadYouTubeAPI();
    }

    // Set up global onYouTubeIframeAPIReady if not already defined
    // This allows the API to inform us when it's ready.
    // Using a ref to prevent re-assignment on every render if possible.
    if (!window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady = () => {
        console.log('Global onYouTubeIframeAPIReady fired!');
        // When the API is ready, check if we have a song and initialize the player
        // if the current youtubeId exists and a player instance is not already present.
        if (youtubeId && !playerRef.current) {
          initializePlayer();
        }
      };
    }

    return () => {
      // Cleanup interval on unmount
      stopTimeUpdate();
    };
  }, [loadYouTubeAPI, initializePlayer, youtubeId, stopTimeUpdate]); // Added initializePlayer, youtubeId, stopTimeUpdate to dependencies


  useEffect(() => {
    if (!youtubeId) {
      cleanupPlayer();
      return;
    }

    console.log('Attempting to load song:', youtubeId);
    setIsLoading(true);
    playerReadyRef.current = false;

    // Check if YT API is already loaded and ready
    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      // If API not ready, initialize it via the global callback when it becomes ready.
      // The `onYouTubeIframeAPIReady` handler from the previous effect will call `initializePlayer`.
      // This path is less common if `loadYouTubeAPI` runs early enough.
      console.log('YouTube API not yet loaded, waiting for onYouTubeIframeAPIReady...');
    }

    return () => {
      cleanupPlayer();
    };
  }, [youtubeId, initializePlayer, cleanupPlayer]); // Dependencies revised

  // Effect to handle play/pause state changes from `useAudioPlayer`
  useEffect(() => {
      if (!playerRef.current || !playerReadyRef.current) return;

      if (isPlaying) {
          console.log('External isPlaying set to true, attempting to play video.');
          try {
              playerRef.current.playVideo();
          } catch (error) {
              console.error('Failed to play video on isPlaying change:', error);
          }
      } else {
          console.log('External isPlaying set to false, attempting to pause video.');
          try {
              playerRef.current.pauseVideo();
          } catch (error) {
              console.error('Failed to pause video on isPlaying change:', error);
          }
      }
  }, [isPlaying]); // Only depends on isPlaying

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