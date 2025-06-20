import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Search, Music, Star, Play, Clock, User, Home, Upload, UserCircle, Loader2, Plus, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSongs } from "@/hooks/useSongs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useSubmitReview, useReviews } from "@/hooks/useReviews";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import PlaylistViewer from "@/components/PlaylistViewer";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [reviews, setReviews] = useState<{[key: string]: {rating: number, text: string}}>({});
  const { user, signOut } = useAuth();
  const { data: songs = [], isLoading } = useSongs(searchTerm, selectedGenre);
  const { currentSong, isPlaying, playPause } = useAudioPlayer();
  const submitReview = useSubmitReview();

  const genres = ["All", "Hindustani Classical", "Cover/Album", "Bollywood Film Music", "Bhangra", "Sufi/Qawwali", "Indian Folk", "Indie/Indian Pop", "Devotional", "Fusion", "Western"];

  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleSongPlay = (song: any) => {
    playPause({
      id: song.id,
      youtubeId: song.youtube_id,
      title: song.title,
      artist: song.artist
    });
  };

  const handleReviewSubmit = async (songId: string) => {
    const review = reviews[songId];
    if (!review || review.rating === 0) return;

    try {
      await submitReview.mutateAsync({
        song_id: songId,
        rating: review.rating,
        review_text: review.text || undefined
      });
      
      // Clear the review form
      setReviews(prev => {
        const newReviews = { ...prev };
        delete newReviews[songId];
        return newReviews;
      });
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      // The error handling is already done in the hook with toast
    }
  };

  const handleRatingChange = (songId: string, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [songId]: { ...prev[songId], rating }
    }));
  };

  const handleReviewTextChange = (songId: string, text: string) => {
    setReviews(prev => ({
      ...prev,
      [songId]: { ...prev[songId], text, rating: prev[songId]?.rating || 0 }
    }));
  };

  // Song review component for each song
  const SongReviews = ({ songId }: { songId: string }) => {
    const { data: songReviews = [] } = useReviews(songId);
    const displayReviews = songReviews.slice(0, 3);

    if (displayReviews.length === 0) {
      return (
        <div className="text-center py-2 text-white/50 text-xs">
          No reviews yet
        </div>
      );
    }

    return (
      <Carousel className="w-full max-w-xs mx-auto">
        <CarouselContent>
          {displayReviews.map((review) => (
            <CarouselItem key={review.id}>
              <Card className="bg-white/5 border-white/10 p-2">
                <div className="text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                    ))}
                    <span className="text-white/70 ml-1">{review.reviewer_username}</span>
                  </div>
                  {review.review_text && (
                    <p className="text-white/60 text-xs line-clamp-2">{review.review_text}</p>
                  )}
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {displayReviews.length > 1 && (
          <>
            <CarouselPrevious className="left-0 h-6 w-6 bg-white/10 border-white/20 text-white hover:bg-white/20" />
            <CarouselNext className="right-0 h-6 w-6 bg-white/10 border-white/20 text-white hover:bg-white/20" />
          </>
        )}
      </Carousel>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Music className="h-8 w-8 text-orange-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-2xl font-bold text-white">Song Monk</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors">
                <Home className="h-4 w-4" />
                <span>Browse</span>
              </Link>
              <Link to="/submit" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Submit Song</span>
              </Link>
              {user && <PlaylistViewer />}
              <Link to="/profile" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors">
                <UserCircle className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <span className="text-white text-sm">Welcome, {user.email}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={signOut} 
                    className="border-orange-500/50 bg-orange-600/20 text-orange-300 hover:bg-orange-600/30 hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-white border-white/30 hover:bg-orange-600/20 hover:border-orange-400 hover:text-orange-400"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden bg-black/30 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-around">
              <Link to="/" className="flex flex-col items-center space-y-1 text-orange-400 hover:text-orange-300 transition-colors">
                <Home className="h-5 w-5" />
                <span className="text-xs">Browse</span>
              </Link>
              <Link to="/submit" className="flex flex-col items-center space-y-1 text-white hover:text-orange-400 transition-colors">
                <Upload className="h-5 w-5" />
                <span className="text-xs">Submit</span>
              </Link>
              <PlaylistViewer 
                trigger={
                  <div className="flex flex-col items-center space-y-1 text-white hover:text-orange-400 transition-colors cursor-pointer">
                    <Music className="h-5 w-5" />
                    <span className="text-xs">Playlists</span>
                  </div>
                }
              />
              <Link to="/profile" className="flex flex-col items-center space-y-1 text-white hover:text-orange-400 transition-colors">
                <UserCircle className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 pb-24">
        <div className="text-center mb-12">
          <div className="mb-6 animate-in fade-in-0 duration-1000">
            <div className="relative inline-block">
              <Music className="h-20 w-20 text-orange-400 mx-auto" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-5xl font-bold text-white mb-4 animate-in slide-in-from-bottom-4 duration-1000 delay-200">
            Discover & Review <span className="text-orange-400">Sacred Music</span>
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-1000 delay-400">
            Share your favorite YouTube songs, discover new music, and connect with fellow music enthusiasts through reviews and ratings.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-in slide-in-from-bottom-4 duration-1000 delay-600">
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

          {/* Genre Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 animate-in slide-in-from-bottom-4 duration-1000 delay-800">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "secondary"}
                size="sm"
                onClick={() => setSelectedGenre(genre)}
                className={`${
                  selectedGenre === genre
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
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
          <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 animate-in slide-in-from-left-4 duration-1000 delay-1000">
            <CardContent className="p-6 text-center">
              <Music className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white">{songs.length}</h3>
              <p className="text-white/70">Songs Available</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 animate-in slide-in-from-bottom-4 duration-1000 delay-1200">
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
          <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 animate-in slide-in-from-right-4 duration-1000 delay-1400">
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
              <Loader2 className="h-12 w-12 text-orange-400 mx-auto animate-spin" />
              <p className="text-white/70 mt-4">Loading songs...</p>
            </div>
          ) : songs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song, index) => (
                <Card 
                  key={song.id} 
                  className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-300 group animate-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="relative mb-3 overflow-hidden rounded-lg">
                      <img
                        src={song.thumbnail_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop"}
                        alt={song.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleSongPlay(song)}
                          className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full transition-colors"
                        >
                          <Play className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Link to={`/song/${song.id}`}>
                          <h4 className="text-lg font-semibold text-white truncate hover:text-orange-400 transition-colors">{song.title}</h4>
                        </Link>
                        <p className="text-white/70 text-sm">{song.artist}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-orange-600/20 text-orange-300 border-orange-600/30 text-xs">
                          {formatGenre(song.genre)}
                        </Badge>
                        {song.duration && (
                          <div className="flex items-center text-white/60 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {song.duration}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(song.average_rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-400"
                              }`}
                            />
                          ))}
                          <span className="text-white/70 text-xs ml-1">
                            {song.average_rating.toFixed(1)} ({song.review_count})
                          </span>
                        </div>
                        {user && (
                          <AddToPlaylistModal 
                            songId={song.id} 
                            songTitle={song.title}
                            trigger={
                              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 p-1">
                                <Plus className="h-3 w-3" />
                              </Button>
                            }
                          />
                        )}
                      </div>

                      <p className="text-white/60 text-xs">
                        by <span className="text-orange-400">{song.submitter_username || 'Unknown'}</span>
                      </p>

                      {/* Reviews Section */}
                      <div className="mt-3">
                        <SongReviews songId={song.id} />
                      </div>

                      {/* Compact Quick Review Form */}
                      {user && (
                        <div className="mt-3 p-2 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/80 text-xs font-medium">Quick Review</span>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  onClick={() => handleRatingChange(song.id, rating)}
                                  className="hover:scale-110 transition-transform"
                                >
                                  <Star
                                    className={`h-3 w-3 ${
                                      rating <= (reviews[song.id]?.rating || 0)
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-400 hover:text-yellow-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <Textarea
                            placeholder="Write your review..."
                            value={reviews[song.id]?.text || ''}
                            onChange={(e) => handleReviewTextChange(song.id, e.target.value)}
                            className="w-full h-12 bg-white/10 border-white/20 text-white text-xs placeholder-white/50 resize-none mb-2"
                          />
                          <Button
                            onClick={() => handleReviewSubmit(song.id)}
                            disabled={!reviews[song.id]?.rating || submitReview.isPending}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-6 px-2"
                          >
                            {submitReview.isPending ? "Submitting..." : "Submit"}
                          </Button>
                        </div>
                      )}
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
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3">
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
