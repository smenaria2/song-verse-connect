
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music, Search, Filter, Play, Star, User, Upload, UserCircle, LogOut, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSongs } from "@/hooks/useSongs";
import { useAuth } from "@/hooks/useAuth";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  youtube_id: string;
  youtube_url: string;
  thumbnail_url?: string;
  submitter_username: string;
  submitter_avatar?: string;
  average_rating: number;
  review_count: number;
  created_at: string;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const { data: songs, isLoading, error } = useSongs();
  const { user, signOut } = useAuth();

  const filteredSongs = songs?.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce mb-4">
            <Music className="h-16 w-16 text-white/40 mx-auto" />
          </div>
          <p className="text-white">Failed to load songs. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Song Monk</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/submit" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Submit Song</span>
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                    <UserCircle className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Discover Amazing
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Music</span>
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Share your favorite songs, discover new music, and connect with fellow music lovers in our vibrant community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/submit">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  <Upload className="h-5 w-5 mr-2" />
                  Submit Your Song
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                <Music className="h-5 w-5 mr-2" />
                Browse Music
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <Input
                placeholder="Search songs or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-white appearance-none min-w-[150px]"
              >
                <option value="">All Genres</option>
                <option value="rock">Rock</option>
                <option value="pop">Pop</option>
                <option value="hip_hop">Hip Hop</option>
                <option value="electronic">Electronic</option>
                <option value="jazz">Jazz</option>
                <option value="classical">Classical</option>
                <option value="country">Country</option>
                <option value="r_b">R&B</option>
                <option value="indie">Indie</option>
                <option value="alternative">Alternative</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Songs Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-purple-400 mx-auto animate-spin" />
              <p className="text-white/70 mt-4">Loading songs...</p>
            </div>
          ) : filteredSongs && filteredSongs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSongs.map((song, index) => (
                <SongCard key={song.id} song={song} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-bounce mb-4">
                <Music className="h-16 w-16 text-white/40 mx-auto" />
              </div>
              <p className="text-white/70 text-lg">No songs found. Be the first to submit a song!</p>
              <Link to="/submit" className="inline-block mt-4">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Song
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const SongCard = ({ song, index }: { song: Song; index: number }) => {
  const { setCurrentSong, setIsPlaying } = useAudioPlayer();

  const handlePlay = () => {
    setCurrentSong({
      id: song.id,
      youtubeId: song.youtube_id,
      title: song.title,
      artist: song.artist
    });
    setIsPlaying(true);
  };

  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card 
      className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 group animate-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link to={`/song/${song.id}`}>
              <CardTitle className="text-lg font-semibold text-white hover:text-purple-400 transition-colors cursor-pointer line-clamp-2">
                {song.title}
              </CardTitle>
            </Link>
            <p className="text-white/70 mt-1">{song.artist}</p>
          </div>
          <Button
            onClick={handlePlay}
            variant="ghost"
            size="sm"
            className="text-white hover:text-purple-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
            {formatGenre(song.genre)}
          </Badge>
          <div className="flex items-center text-white/60">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            {song.average_rating > 0 ? song.average_rating.toFixed(1) : 'N/A'} ({song.review_count})
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={song.submitter_avatar || ""} alt={song.submitter_username} />
              <AvatarFallback className="text-xs">{song.submitter_username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/70">{song.submitter_username}</span>
          </div>
          <span className="text-sm text-white/60">{formatDate(song.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default Index;
