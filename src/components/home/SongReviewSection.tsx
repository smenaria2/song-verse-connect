import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Edit, Save, X, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  // Get user's existing review for this song
  const userReview = reviews.find(review => review.reviewer_id === user?.id);
  // Get one other review to display (not from current user)
  const displayReview = reviews.find(review => review.reviewer_id !== user?.id) || reviews[0];

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
        setIsExpanded(false);
        setIsEditing(false);
      }
    });
  };

  const startReview = () => {
    if (userReview) {
      setReviewText(userReview.review_text || "");
      setRating(userReview.rating);
      setIsEditing(true);
      setIsExpanded(true);
    } else {
      setIsExpanded(true);
    }
  };

  const cancelReview = () => {
    setIsExpanded(false);
    setIsEditing(false);
    setReviewText("");
    setRating(5);
  };

  const toggleExpanded = () => {
    if (!isExpanded && user) {
      startReview();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Display existing review - only show if it's NOT from the current user */}
      {displayReview && displayReview.reviewer_id !== user?.id && !isExpanded && (
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

      {/* Compact review form */}
      <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden transition-all duration-300 ease-in-out">
        {/* Collapsed state */}
        {!isExpanded && user && (
          <button
            onClick={toggleExpanded}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span className="text-white/80 text-sm">
                {userReview ? "Edit your review" : "Write a review"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-white/60" />
          </button>
        )}

        {/* Expanded form */}
        {isExpanded && user && (
          <div className="p-3 space-y-3 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-purple-400" />
                <span className="text-white text-sm font-medium">
                  {isEditing ? "Edit Review" : "Write Review"}
                </span>
              </div>
              <button
                onClick={cancelReview}
                className="text-white/60 hover:text-white transition-colors"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
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
                  rows={2}
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
                  className="flex-1 text-xs bg-purple-600 hover:bg-purple-700 h-8 rounded-md transition-all duration-200 font-medium"
                  disabled={submitReview.isPending || !reviewText.trim()}
                >
                  <Save className="h-3 w-3 mr-1" />
                  {isEditing ? "Update" : "Submit"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={cancelReview}
                  className="border-white/20 text-white/70 hover:bg-white/10 h-8 rounded-md transition-all duration-200 font-medium"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Sign in prompt for non-authenticated users */}
        {!user && !isExpanded && (
          <div className="p-3 text-center">
            <p className="text-white/60 text-xs">
              <a href="/auth" className="text-purple-400 hover:text-purple-300 transition-colors">
                Sign in
              </a> to write a review
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongReviewSection;