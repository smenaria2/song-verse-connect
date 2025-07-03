import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AudioPlayerContextType {
  currentSong: {
    id: string;
    youtubeId: string;
    title: string;
    artist: string;
  } | null;
  isPlaying: boolean;
  setCurrentSong: (song: { id: string; youtubeId: string; title: string; artist: string } | null) => void;
  setIsPlaying: (playing: boolean) => void;
  playPause: (song: { id: string; youtubeId: string; title: string; artist: string }) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<{
    id: string;
    youtubeId: string;
    title: string;
    artist: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playPause = (song: { id: string; youtubeId: string; title: string; artist: string }) => {
    console.log('AudioPlayer: playPause called', {
      newSong: song.title,
      currentSong: currentSong?.title,
      isPlaying,
      isSameSong: currentSong?.id === song.id
    });

    if (currentSong?.id === song.id) {
      // Same song - toggle play/pause
      console.log('AudioPlayer: Toggling play/pause for same song');
      setIsPlaying(!isPlaying);
    } else {
      // Different song - switch and play
      console.log('AudioPlayer: Switching to new song and playing');
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log('AudioPlayer: State changed', {
      currentSong: currentSong?.title,
      isPlaying
    });
  }, [currentSong, isPlaying]);

  return (
    <AudioPlayerContext.Provider value={{
      currentSong,
      isPlaying,
      setCurrentSong,
      setIsPlaying,
      playPause
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};