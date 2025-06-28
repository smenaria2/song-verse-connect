import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Edit2, Save, X, MessageSquare, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useReviews, useSubmitReview } from "@/hooks/useReviews";
import { Song } from "@/hooks/useSongs";

interface SongReviewSectionProps {
  song: Song;
}

const SongReviewSection = ({ song }: SongReviewSectionProps) => {
  const { user } = useAuth();
  const { data: reviews = [] } = useReviews(song.id);
  const submitReview = useSubmitReview();
  const [isReviewing, setIsReviewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  // Get user's existing review for this song
  const userReview = reviews.find(review => review.reviewer_id === user?.id);
  // Get other users' reviews (excluding current user's review)
  const otherReviews = reviews.filter(review => review.reviewer_id !== user?.id);
  // Get one review to display from other users
  const displayReview = otherReviews[0];

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    submitReview.mutate({
      song_id: song.id,
      rating: rating,
      review_text: reviewText,
    }, {
      onSuccess: () => {
        setReviewText("");
        setRating(5);
        setIsReviewing(false);
        setIsEditing(false);
      }
    });
  };

  const startEditing = () => {
    if (userReview) {
      setReviewText(userReview.review_text || "");
      setRating(userReview.rating);
      setIsEditing(true);
    }
  };

  const startReviewing = () => {
    setIsReviewing(true);
    setReviewText("");
    setRating(5);
  };

  const cancelReview = () => {
    setIsReviewing(false);
    setIsEditing(false);
    setReviewText("");
    setRating(5);
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Display user's own review with edit functionality */}
      {userReview && !isEditing && (
        <div className="bg-white/10 rounded-lg p-3 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < userReview.rating 
                        ? "text-yellow-400 fill-current" 
                        : "text-gray-400"
                    }`}
                  />
                ))}
              </div>
              <span className="text-purple-300 text-xs font-medium">Your review</span>
            </div>
            {/* Pencil icon for editing - only visible for user's own review */}
            <button
              onClick={startEditing}
              className="text-white/60 hover:text-purple-400 transition-colors p-1 rounded hover:bg-white/10"
              title="Edit your review"
            >
              <Pencil className="h-3 w-3" />
            </button>
          </div>
          {userReview.review_text && (
            <p className="text-white/90 text-xs">{userReview.review_text}</p>
          )}
        </div>
      )}

      {/* Display other users' reviews (no edit functionality) */}
      {displayReview && !userReview && !isReviewing && (
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < displayReview.rating 
                        ? "text-yellow-400 fill-current" 
                        : "text-gray-400"
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/60 text-xs">
                by {displayReview.reviewer_username}
              </span>
            </div>
          </div>
          {displayReview.review_text && (
            <p className="text-white/80 text-xs line-clamp-2">
              {displayReview.review_text}
            </p>
          )}
        </div>
      )}

      {/* Review form for editing user's own review */}
      {isEditing && user && (
        <div className="bg-white/10 rounded-lg p-3 space-y-3 border border-purple-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Edit2 className="h-4 w-4 text-purple-400" />
              <span className="text-white text-sm font-medium">Edit Your Review</span>
            </div>
          </div>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? "text-yellow-400 fill-current" : "text-gray-400"
                    } cursor-pointer hover:text-yellow-400 transition-colors`}
                    onClick={() => setRating(i + 1)}
                  />
                ))}
              </div>
              <Textarea
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder-white/60 text-xs resize-none"
                placeholder="Update your thoughts about this song..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                size="sm" 
                className="flex-1 text-xs bg-purple-600 hover:bg-purple-700 h-8"
                disabled={submitReview.isPending}
              >
                <Save className="h-3 w-3 mr-1" />
                Update Review
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={cancelReview}
                className="border-white/20 text-white/70 hover:bg-white/10 h-8"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Compact review form for new reviews (only if user hasn't reviewed yet) */}
      {!userReview && !isReviewing && user && (
        <Button
          onClick={startReviewing}
          variant="outline"
          size="sm"
          className="w-full border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white text-xs h-8"
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          Write a Review
        </Button>
      )}

      {/* Review form for new reviews */}
      {isReviewing && user && (
        <div className="bg-white/10 rounded-lg p-3 space-y-3 border border-purple-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span className="text-white text-sm font-medium">Write Your Review</span>
            </div>
          </div>
          <form onSubmit={handleSubmitReview} className="space-y-3">
            <div>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? "text-yellow-400 fill-current" : "text-gray-400"
                    } cursor-pointer hover:text-yellow-400 transition-colors`}
                    onClick={() => setRating(i + 1)}
                  />
                ))}
              </div>
              <Textarea
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder-white/60 text-xs resize-none"
                placeholder="Share your thoughts about this song..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                size="sm" 
                className="flex-1 text-xs bg-purple-600 hover:bg-purple-700 h-8"
                disabled={submitReview.isPending || !reviewText.trim()}
              >
                <Save className="h-3 w-3 mr-1" />
                Submit Review
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={cancelReview}
                className="border-white/20 text-white/70 hover:bg-white/10 h-8"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Sign in prompt for non-authenticated users */}
      {!user && (
        <div className="bg-white/5 rounded-lg p-3 text-center border border-white/10">
          <p className="text-white/60 text-xs">
            <a href="/auth" className="text-purple-400 hover:text-purple-300 transition-colors">
              Sign in
            </a> to write a review
          </p>
        </div>
      )}
    </div>
  );
};

export default SongReviewSection;