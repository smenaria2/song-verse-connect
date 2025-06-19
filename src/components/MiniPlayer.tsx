
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

interface MiniPlayerProps {
  youtubeId: string;
  title: string;
  artist: string;
  isPlaying: boolean;
  onPlayPause: () => void;
}

const MiniPlayer = ({ title, artist, isPlaying, onPlayPause }: MiniPlayerProps) => {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-lg p-3 space-y-2">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPlayPause}
          className="text-white hover:text-orange-400 hover:bg-white/10 p-1"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{title}</p>
          <p className="text-white/70 text-xs truncate">{artist}</p>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
