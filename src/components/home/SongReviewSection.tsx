
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Edit, Save, X } from "lucide-react";
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
        setIsReviewing(false);
        setIsEditing(false);
      }
    });
  };

  const startReview = () => {
    if (userReview) {
      setReviewText(userReview.review_text || "");
      setRating(userReview.rating);
      setIsEditing(true);
    } else {
      setIsReviewing(true);
    }
  };

  const cancelReview = () => {
    setIsReviewing(false);
    setIsEditing(false);
    setReviewText("");
    setRating(5);
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Display existing review */}
      {displayReview && !isReviewing && !isEditing && (
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

      {/* Review form */}
      {(isReviewing || isEditing) && user && (
        <form onSubmit={handleSubmitReview} className="bg-white/10 rounded-lg p-3 space-y-3">
          <div>
            <div className="flex items-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating ? "text-yellow-400 fill-current" : "text-gray-400"
                  } cursor-pointer`}
                  onClick={() => setRating(i + 1)}
                />
              ))}
            </div>
            <Textarea
              rows={2}
              className="bg-white/10 border-white/20 text-white placeholder-white/60 text-xs"
              placeholder="Share your thoughts..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              type="submit" 
              size="sm" 
              className="flex-1 text-xs"
              disabled={submitReview.isPending}
            >
              <Save className="h-3 w-3 mr-1" />
              {isEditing ? "Update" : "Submit"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={cancelReview}
              className="border-white/20 text-white/70"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </form>
      )}

      {/* Review/Edit button */}
      {!isReviewing && !isEditing && user && (
        <Button
          onClick={startReview}
          variant="outline"
          size="sm"
          className="w-full border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-xs"
        >
          {userReview ? (
            <>
              <Edit className="h-3 w-3 mr-1" />
              Edit Review
            </>
          ) : (
            <>
              <Star className="h-3 w-3 mr-1" />
              Write Review
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default SongReviewSection;
