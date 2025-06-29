import { ListMusic } from "lucide-react";
import PlaylistModal from "@/components/PlaylistModal";
import PlaylistCard from "@/components/playlist/PlaylistCard";
import { Playlist } from "@/types/app";

interface UserPlaylistsProps {
  playlists: Playlist[];
}

const UserPlaylists = ({ playlists }: UserPlaylistsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h3 className="text-xl font-semibold text-white">My Playlists</h3>
        <PlaylistModal />
      </div>
      <div className="grid gap-4">
        {playlists.length > 0 ? playlists.map((playlist, index) => (
          <PlaylistCard key={playlist.id} playlist={playlist} index={index} />
        )) : (
          <div className="text-center py-8 text-white/70">
            <div className="animate-bounce mb-4">
              <ListMusic className="h-12 w-12 text-white/40 mx-auto" />
            </div>
            <p>No playlists created yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPlaylists;