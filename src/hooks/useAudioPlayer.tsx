
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

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
