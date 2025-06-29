import { Music } from "lucide-react";
import SongCard from "@/components/song/SongCard";
import { SubmittedSong } from "@/types/app";

interface SubmittedSongsProps {
  songs: SubmittedSong[];
}

const SubmittedSongs = ({ songs }: SubmittedSongsProps) => {
  if (songs.length === 0) {
    return (
      <div className="text-center py-8 text-white/70">
        <div className="animate-bounce mb-4">
          <Music className="h-12 w-12 text-white/40 mx-auto" />
        </div>
        <p>No songs submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {songs.map((song, index) => (
        <SongCard 
          key={song.id} 
          song={song as any} 
          showReviewSection={false}
          index={index}
        />
      ))}
    </div>
  );
};

export default SubmittedSongs;