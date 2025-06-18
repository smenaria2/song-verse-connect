import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Music, Star, ThumbsUp, ThumbsDown, MessageCircle, Clock, User, Home, Upload, UserCircle, Loader2, Reply } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Song {
  id: string;
  youtube_url: string;
  youtube_id: string;
  title: string;
  artist: string;
  genre: string;
  release_year?: number;
  thumbnail_url?: string;
  duration?: string;
  submitter_id: string;
  created_at: string;
  submitter_username?: string;
  submitter_avatar?: string;
  average_rating: number;
  review_count: number;
}

interface Review {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  reviewer_id: string;
  reviewer_username: string;
  reviewer_avatar?: string;
  upvotes: number;
  downvotes: number;
  user_vote?: 'up' | 'down' | null;
  replies: ReviewReply[];
}

interface ReviewReply {
  id: string;
  reply_text: string;
  created_at: string;
  replier_id: string;
  replier_username: string;
  replier_avatar?: string;
}

const Song = () => {
  const { id } = useParams<{ id: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchSongData();
      fetchReviews();
    }
  }, [id]);

  const fetchSongData = async () => {
    try {
      const { data, error } = await supabase
        .from('songs_with_stats')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSong(data);
    } catch (error) {
      console.error('Error fetching song:', error);
      toast({
        title: "Error",
        description: "Failed to load song data",
        variant: "destructive"
      });
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Mock reviews data - replace with actual database queries
      const mockReviews: Review[] = [
        {
          id: '1',
          rating: 5,
          review_text: "Absolutely mesmerizing! The classical fusion in this track is phenomenal. The way traditional instruments blend with modern elements creates a transcendent experience.",
          created_at: new Date().toISOString(),
          reviewer_id: 'user1',
          reviewer_username: 'MusicLover123',
          reviewer_avatar: '',
          upvotes: 15,
          downvotes: 2,
          user_vote: null,
          replies: [
            {
              id: 'reply1',
              reply_text: "I completely agree! This song has been on repeat for me.",
              created_at: new Date().toISOString(),
              replier_id: 'user2',
              replier_username: 'ClassicalFan',
              replier_avatar: ''
            }
          ]
        },
        {
          id: '2',
          rating: 4,
          review_text: "Beautiful composition with traditional elements. Could use a bit more depth in the arrangement.",
          created_at: new Date().toISOString(),
          reviewer_id: 'user3',
          reviewer_username: 'SoulSeeker',
          reviewer_avatar: '',
          upvotes: 8,
          downvotes: 1,
          user_vote: null,
          replies: []
        }
      ];
      
      // Sort by upvotes (highest first)
      mockReviews.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a review",
        variant: "destructive"
      });
      return;
    }

    if (newReview.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive"
      });
      return;
    }

    setSubmittingReview(true);
    try {
      // Mock review submission - replace with actual database insert
      const mockNewReview: Review = {
        id: Date.now().toString(),
        rating: newReview.rating,
        review_text: newReview.text,
        created_at: new Date().toISOString(),
        reviewer_id: user.id,
        reviewer_username: user.email?.split('@')[0] || 'Anonymous',
        reviewer_avatar: '',
        upvotes: 0,
        downvotes: 0,
        user_vote: null,
        replies: []
      };

      setReviews(prev => [mockNewReview, ...prev]);
      setNewReview({ rating: 0, text: "" });
      
      toast({
        title: "Review Submitted",
        description: "Your review has been posted successfully!"
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVote = async (reviewId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote",
        variant: "destructive"
      });
      return;
    }

    // Mock vote handling - replace with actual database operations
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        const currentVote = review.user_vote;
        let newUpvotes = review.upvotes;
        let newDownvotes = review.downvotes;
        let newUserVote: 'up' | 'down' | null = voteType;

        // Remove previous vote
        if (currentVote === 'up') newUpvotes--;
        if (currentVote === 'down') newDownvotes--;

        // Add new vote or remove if same
        if (currentVote === voteType) {
          newUserVote = null;
        } else {
          if (voteType === 'up') newUpvotes++;
          if (voteType === 'down') newDownvotes++;
        }

        return {
          ...review,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          user_vote: newUserVote
        };
      }
      return review;
    }));
  };

  const handleReply = async (reviewId: string) => {
    if (!user || !replyText.trim()) return;

    // Mock reply submission - replace with actual database insert
    const newReply: ReviewReply = {
      id: Date.now().toString(),
      reply_text: replyText,
      created_at: new Date().toISOString(),
      replier_id: user.id,
      replier_username: user.email?.split('@')[0] || 'Anonymous',
      replier_avatar: ''
    };

    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          replies: [...review.replies, newReply]
        };
      }
      return review;
    }));

    setReplyText("");
    setReplyingTo(null);
    
    toast({
      title: "Reply Posted",
      description: "Your reply has been added successfully!"
    });
  };

  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || !song) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-orange-400 mx-auto animate-spin" />
          <p className="text-white/70 mt-4">Loading song...</p>
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
            <Link to="/" className="flex items-center space-x-2">
              <div className="relative">
                <Music className="h-8 w-8 text-orange-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-2xl font-bold text-white">Song Monk</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors">
                <Home className="h-4 w-4" />
                <span>Browse</span>
              </Link>
              <Link to="/submit" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Submit Song</span>
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors">
                <UserCircle className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Song Details */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-md animate-in slide-in-from-top-4 duration-1000">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* YouTube Player */}
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${song.youtube_id}?rel=0`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                </div>

                {/* Song Info */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{song.title}</h1>
                    <p className="text-xl text-white/80 mb-4">{song.artist}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="bg-orange-600/20 text-orange-300 border-orange-600/30">
                        {formatGenre(song.genre)}
                      </Badge>
                      {song.duration && (
                        <div className="flex items-center text-white/60 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {song.duration}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(song.average_rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-400"
                            }`}
                          />
                        ))}
                        <span className="text-white/70 ml-2">
                          {song.average_rating.toFixed(1)} ({song.review_count} reviews)
                        </span>
                      </div>
                    </div>

                    <p className="text-white/60">
                      Submitted by <span className="text-orange-400">{song.submitter_username || 'Unknown'}</span>
                    </p>
                    <p className="text-white/60 text-sm">
                      {formatDate(song.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Write Review */}
          {user && (
            <Card className="bg-white/10 border-white/20 backdrop-blur-md animate-in slide-in-from-left-4 duration-1000 delay-200">
              <CardHeader>
                <CardTitle className="text-white">Write a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            rating <= newReview.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-400"
                          } hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white text-sm font-medium mb-2 block">Review (Optional)</label>
                  <Textarea
                    placeholder="Share your thoughts about this song..."
                    value={newReview.text}
                    onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder-white/60"
                  />
                </div>

                <Button
                  onClick={handleSubmitReview}
                  disabled={newReview.rating === 0 || submittingReview}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card className="bg-white/10 border-white/20 backdrop-blur-md animate-in slide-in-from-right-4 duration-1000 delay-400">
            <CardHeader>
              <CardTitle className="text-white">Reviews ({reviews.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div 
                    key={review.id} 
                    className="border-b border-white/10 pb-6 last:border-b-0 animate-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.reviewer_avatar} />
                        <AvatarFallback>{review.reviewer_username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{review.reviewer_username}</h4>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-400"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-white/60 text-sm">{formatDate(review.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {review.review_text && (
                          <p className="text-white/80">{review.review_text}</p>
                        )}

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(review.id, 'up')}
                              className={`text-white/60 hover:text-white ${
                                review.user_vote === 'up' ? 'text-green-400' : ''
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {review.upvotes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(review.id, 'down')}
                              className={`text-white/60 hover:text-white ${
                                review.user_vote === 'down' ? 'text-red-400' : ''
                              }`}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              {review.downvotes}
                            </Button>
                          </div>
                          
                          {user && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                              className="text-white/60 hover:text-white"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Reply
                            </Button>
                          )}
                        </div>

                        {/* Reply Form */}
                        {replyingTo === review.id && (
                          <div className="mt-4 space-y-2">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            />
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleReply(review.id)}
                                disabled={!replyText.trim()}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Post Reply
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                }}
                                className="text-white/60 hover:text-white"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Replies */}
                        {review.replies.length > 0 && (
                          <div className="mt-4 space-y-3 pl-4 border-l-2 border-white/20">
                            {review.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={reply.replier_avatar} />
                                  <AvatarFallback className="text-xs">{reply.replier_username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="text-white/90 text-sm font-medium">{reply.replier_username}</h5>
                                    <span className="text-white/50 text-xs">{formatDate(reply.created_at)}</span>
                                  </div>
                                  <p className="text-white/80 text-sm">{reply.reply_text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/70">No reviews yet. Be the first to review this song!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Song;