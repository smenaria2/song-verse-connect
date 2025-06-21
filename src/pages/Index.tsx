import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Star, Search, Music, Play, Loader2, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSongs, useSongsStats } from "@/hooks/useSongs";
import { useReviews } from "@/hooks/useReviews";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useToast } from "@/hooks/use-toast";
import { getRandomAvatarColor, getUserInitials } from "@/utils/profileUtils";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import Navigation from "@/components/Navigation";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSongs(searchTerm, genreFilter);
  const { data: stats, isLoading: isLoadingStats } = useSongsStats();
  const { data: recentReviews, isLoading: isLoadingReviews } = useReviews();
  const { playPause } = useAudioPlayer();
  const { toast } = useToast();

  // Get the 3 most recent songs for quick review
  const recentSongs = data?.pages.flatMap(page => page)
    .slice(0, 3) || [];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast({
        title: "Error",
        description: "Review text cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedSongId) {
      toast({
        title: "Error",
        description: "Please select a song to review.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId: selectedSongId,
          rating: rating,
          reviewText: reviewText,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      toast({
        title: "Success!",
        description: "Your review has been submitted."
      });
      setReviewText("");
      setRating(5);
      setSelectedSongId(null);
    } catch (error: any) {
      console.error('There was an error submitting the review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSongPlay = (song: any) => {
    playPause({
      id: song.id,
      youtubeId: song.youtube_id,
      title: song.title,
      artist: song.artist
    });
  };

  const formatGenre = (genre: string) => {
    return genre.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 w-full max-w-full overflow-x-hidden">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pb-24 w-full max-w-full">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-in slide-in-from-top-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-break">
            Discover Sacred Music
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto text-break">
            Share, review, and explore the most meaningful songs in your spiritual journey
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-top-4 card-responsive">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search" className="text-white/80 block text-sm font-medium mb-2">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="search"
                    id="search"
                    placeholder="Search for songs, artists..."
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="genre" className="text-white/80 block text-sm font-medium mb-2">
                  Genre
                </Label>
                <Select onValueChange={setGenreFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder-white/60">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Genres</SelectItem>
                    <SelectItem value="chant">Chant</SelectItem>
                    <SelectItem value="gospel">Gospel</SelectItem>
                    <SelectItem value="contemporary_christian">Contemporary Christian</SelectItem>
                    <SelectItem value="sacred_classical">Sacred Classical</SelectItem>
                    <SelectItem value="hindu_bhajan">Hindu Bhajan</SelectItem>
                    <SelectItem value="qawwali">Qawwali</SelectItem>
                    <SelectItem value="spiritual">Spiritual</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-5 animate-in slide-in-from-bottom-4">
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.total_songs}</div>
                <div className="text-white/70">Total Songs</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-5 animate-in slide-in-from-bottom-4 delay-100">
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.total_artists}</div>
                <div className="text-white/70">Total Artists</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-5 animate-in slide-in-from-bottom-4 delay-200">
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.total_reviews}</div>
                <div className="text-white/70">Total Reviews</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-5 animate-in slide-in-from-bottom-4 delay-300">
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.average_rating.toFixed(1)}</div>
                <div className="text-white/70">Average Rating</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Review Form */}
        {user && recentSongs.length > 0 && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-left-4 card-responsive">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Quick Review</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <Label htmlFor="song" className="text-white/80 block text-sm font-medium mb-2">
                    Select a Song
                  </Label>
                  <Select onValueChange={(value) => setSelectedSongId(value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder-white/60 w-full">
                      <SelectValue placeholder="Choose a song to review" />
                    </SelectTrigger>
                    <SelectContent>
                      {recentSongs.map((song) => (
                        <SelectItem key={song.id} value={song.id}>
                          {song.title} - {song.artist}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rating" className="text-white/80 block text-sm font-medium mb-2">
                    Rating
                  </Label>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-400"
                          } cursor-pointer`}
                        onClick={() => setRating(i + 1)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="review" className="text-white/80 block text-sm font-medium mb-2">
                    Review
                  </Label>
                  <Textarea
                    id="review"
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder-white/60 w-full"
                    placeholder="Share your thoughts on this song..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recent Reviews Carousel */}
        {recentReviews.length > 0 && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-right-4 card-responsive">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Recent Reviews</h2>
              <Carousel className="w-full">
                <CarouselContent className="-ml-1 pl-1">
                  {recentReviews.map((review) => (
                    <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-4">
                        <div className="flex flex-col h-full bg-black/20 rounded-md p-4 border border-white/10">
                          <div className="flex items-center space-x-4 mb-4">
                            <Avatar>
                              <AvatarImage src={review.reviewer_avatar_url || ""} alt={review.reviewer_username} />
                              <AvatarFallback className={`text-sm text-white ${getRandomAvatarColor(review.reviewer_id)}`}>
                                {getUserInitials(review.reviewer_username)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{review.reviewer_username}</h3>
                              <p className="text-white/60 text-sm">
                                {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mb-4">
                            <Link to={`/song/${review.song_id}`} className="text-white hover:text-purple-400">
                              <h4 className="font-semibold">{review.song_title}</h4>
                              <p className="text-white/70">{review.song_artist}</p>
                            </Link>
                          </div>
                          <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-400"
                                  }`}
                              />
                            ))}
                          </div>
                          <p className="text-white/80">{review.review_text}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </CardContent>
          </Card>
        )}

        {/* Songs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {isLoading ? (
            <>
              {[...Array(9)].map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-md animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between space-x-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="h-8 w-8 bg-gray-500 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : data?.pages.map((page) =>
            page.map((song) => (
              <Card key={song.id} className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-x-4">
                    <Link to={`/song/${song.id}`} className="flex-1">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white hover:text-purple-400 transition-colors text-break">{song.title}</h3>
                        <p className="text-white/70 text-break">{song.artist}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                            {formatGenre(song.genre)}
                          </Badge>
                          <div className="flex items-center text-white/60">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {song.average_rating.toFixed(1)} ({song.review_count} reviews)
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center space-x-2">
                      <AddToPlaylistModal songId={song.id} songTitle={song.title} />
                      <Button
                        onClick={() => handleSongPlay(song)}
                        variant="outline"
                        size="sm"
                        className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More Button */}
        {hasNextPage && (
          <div className="text-center mt-8">
            <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading More...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
