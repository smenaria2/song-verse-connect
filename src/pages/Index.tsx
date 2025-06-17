
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Music, Star, Play, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSongs } from "@/hooks/useSongs";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const { user, signOut } = useAuth();
  const { data: songs = [], isLoading } = useSongs(searchTerm, selectedGenre);

  const genres = ["All", "Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", "Grunge", "Alternative", "Indie", "Bollywood"];

  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">SongScope</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-white hover:text-purple-400 transition-colors">Browse</Link>
              <Link to="/submit" className="text-white hover:text-purple-400 transition-colors">Submit Song</Link>
              <Link to="/profile" className="text-white hover:text-purple-400 transition-colors">Profile</Link>
            </nav>
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <span className="text-white text-sm">Welcome, {user.email}</span>
                  <Button variant="outline" size="sm" onClick={signOut} className="text-white border-white/20 hover:bg-white/10">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Discover & Review <span className="text-purple-400">Amazing Music</span>
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Share your favorite YouTube songs, discover new music, and connect with fellow music enthusiasts through reviews and ratings.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for songs, artists, or genres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white/20 transition-all"
              />
            </div>
          </div>

          {/* Genre Filter - Fixed to match screenshot */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
                className={`${
                  selectedGenre === genre
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-white/20 text-white hover:bg-white/30 border-0"
                } transition-all rounded-full px-4 py-2`}
              >
                {genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/10 border-white/20 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <Music className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">{songs.length}</h3>
              <p className="text-white/70">Songs Available</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <User className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">
                {user ? "Welcome!" : "Join Now"}
              </h3>
              <p className="text-white/70">
                {user ? "Start Exploring" : "Create Account"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">
                {songs.reduce((sum, song) => sum + song.review_count, 0)}
              </h3>
              <p className="text-white/70">Total Reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Songs List */}
        <section>
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            {songs.length > 0 ? "Available Songs" : "No Songs Found"}
          </h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-400 border-t-transparent mx-auto"></div>
              <p className="text-white/70 mt-4">Loading songs...</p>
            </div>
          ) : songs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song) => (
                <Card key={song.id} className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <img
                        src={song.thumbnail_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"}
                        alt={song.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-lg font-semibold text-white truncate">{song.title}</h4>
                        <p className="text-white/70">{song.artist}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-600/30">
                          {formatGenre(song.genre)}
                        </Badge>
                        {song.duration && (
                          <div className="flex items-center text-white/60 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            {song.duration}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(song.average_rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-400"
                              }`}
                            />
                          ))}
                          <span className="text-white/70 text-sm ml-2">
                            {song.average_rating.toFixed(1)} ({song.review_count} reviews)
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-white/60 text-sm">
                        Submitted by <span className="text-purple-400">{song.submitter_username || 'Unknown'}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <p className="text-white/70 text-lg">No songs found. Be the first to submit one!</p>
            </div>
          )}
        </section>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link to={user ? "/submit" : "/auth"}>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
              <Music className="h-5 w-5 mr-2" />
              {user ? "Submit Your First Song" : "Join to Submit Songs"}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
