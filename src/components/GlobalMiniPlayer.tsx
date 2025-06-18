
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import MiniPlayer from './MiniPlayer';

const GlobalMiniPlayer = () => {
  const { currentSong } = useAudioPlayer();

  if (!currentSong) {
    return null;
  }

  return (
    <MiniPlayer
      youtubeId={currentSong.youtubeId}
      title={currentSong.title}
      artist={currentSong.artist}
    />
  );
};

export default GlobalMiniPlayer;
