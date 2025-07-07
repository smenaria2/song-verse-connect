import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageCircle, Loader2, ThumbsUp, Pencil, Trash2, Save, X, Share } from "lucide-react";
import { Link } from "react-router-dom";
import { useReviews, useSubmitReview, useDeleteReview } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useUserRole";
import ReviewInteractions from "@/components/ReviewInteractions";
import ShareButton from "@/components/common/ShareButton";
import { getRandomAvatarColor, getUserInitials } from "@/utils/profileUtils";
import { formatDate } from "@/utils/formatters/date";

interface ReviewListSectionProps {
  songId: string;
}

const ReviewListSection = ({ songId }: ReviewListSectionProps) => {
  const [sortBy, setSortBy] = useState<'newest' | 'helpful'>('helpful');
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(songId, sortBy);
  const submitReviewMutation = useSubmitReview();
  const deleteReview = useDeleteReview();

  // Separate user's review from others and prioritize others
  const userReview = reviews.find(review => review.reviewer_id === user?.id);
  const otherReviews = reviews.filter(review => review.reviewer_id !== user?.id);

  const startEditing = (review: any) => {
    setEditingReview(review.id);
    setEditText(review.review_text || "");
    setEditRating(review.rating);
  };

  const cancelEditing = () => {
    setEditingReview(null);
    setEditText("");
    setEditRating(5);
  };

  const saveEdit = async (reviewId: string) => {
    try {
      await submitReviewMutation.mutateAsync({
        song_id: songId,
        rating: editRating,
        review_text: editText
      });
      setEditingReview(null);
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string, isOwnReview: boolean = false) => {
    const confirmMessage = isAdmin && !isOwnReview
      ? 'Are you sure you want to delete this review? This action cannot be undone. (Admin action)'
      : 'Are you sure you want to delete this review? This action cannot be undone.';
      
    if (window.confirm(confirmMessage)) {
      try {
        await deleteReview.mutateAsync(reviewId);
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const getReviewShareUrl = (reviewId: string) => {
    return `${window.location.origin}/song/${songId}#review-${reviewId}`;
  };

  const canDeleteReview = (review: any) => {
    return user && (review.reviewer_id === user.id || isAdmin);
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md animate-in slide-in-from-right-4 duration-1000 delay-400">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <CardTitle className="text-white text-lg md:text-xl">Reviews ({reviews.length})</CardTitle>
          <Select value={sortBy} onValueChange={(value: 'newest' | 'helpful') => setSortBy(value)}>
            <SelectTrigger className="w-full md:w-40 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="helpful" className="text-white hover:bg-gray-800">
                Most Helpful
              </SelectItem>
              <SelectItem value="newest" className="text-white hover:bg-gray-800">
                Newest First
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 max-w-full overflow-hidden">
        {reviewsLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 text-orange-400 mx-auto animate-spin" />
            <p className="text-white/70 mt-4">Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {/* PRIORITIZE: Show other users' reviews first */}
            {otherReviews.map((review, index) => (
              <div 
                key={review.id} 
                id={`review-${review.id}`}
                className="border-b border-white/10 pb-6 last:border-b-0 animate-in slide-in-from-bottom-4 scroll-mt-24 transition-all duration-300 max-w-full overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start space-x-3 max-w-full">
                  <Link to={`/profile/${review.reviewer_id}`} className="flex-shrink-0">
                    <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 hover:ring-2 hover:ring-purple-400/50 transition-all duration-200">
                      <AvatarImage src={review.reviewer_avatar} />
                      <AvatarFallback className={`text-white text-xs md:text-sm ${getRandomAvatarColor(review.reviewer_id)}`}>
                        {getUserInitials(review.reviewer_username)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  <div className="flex-1 space-y-3 min-w-0 max-w-full overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                      <div className="min-w-0 flex-1">
                        <Link 
                          to={`/profile/${review.reviewer_id}`}
                          className="hover:text-purple-400 transition-colors"
                        >
                          <h4 className="text-white font-medium text-sm md:text-base truncate hover:underline">{review.reviewer_username}</h4>
                        </Link>
                        <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-2">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 md:h-4 md:w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-400"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-white/60 text-xs md:text-sm">{formatDate(review.created_at)}</span>
                          {sortBy === 'helpful' && review.upvote_count > 0 && (
                            <div className="flex items-center space-x-1 text-purple-400 text-xs">
                              <ThumbsUp className="h-3 w-3 fill-current" />
                              <span>{review.upvote_count}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Button
                          onClick={() => {
                            const shareUrl = getReviewShareUrl(review.id);
                            navigator.clipboard.writeText(shareUrl);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-white/40 hover:text-purple-400 hover:bg-purple-400/10 p-1 h-6 w-6 rounded-md transition-all duration-200"
                          title="Share review"
                        >
                          <Share className="h-3 w-3" />
                        </Button>
                        {/* Admin delete button for other users' reviews */}
                        {isAdmin && (
                          <Button
                            onClick={() => handleDeleteReview(review.id, false)}
                            variant="ghost"
                            size="sm"
                            className="text-white/40 hover:text-red-400 hover:bg-red-400/10 p-1 h-6 w-6 rounded-md transition-all duration-200"
                            title="Delete review (Admin)"
                            disabled={deleteReview.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {review.review_text && (
                      <div className="max-w-full overflow-hidden">
                        <p className="text-white/80 text-sm md:text-base break-words leading-relaxed whitespace-pre-wrap">
                          {review.review_text}
                        </p>
                      </div>
                    )}

                    {/* Review Interactions */}
                    <ReviewInteractions 
                      reviewId={review.id} 
                      reviewAuthorId={review.reviewer_id}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Show user's own review last with edit/delete options */}
            {userReview && (
              <div className="border-t border-purple-500/30 pt-6 max-w-full overflow-hidden" id={`review-${userReview.id}`}>
                <div className="flex items-start space-x-3 max-w-full">
                  <Link to={`/profile/${userReview.reviewer_id}`} className="flex-shrink-0">
                    <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 hover:ring-2 hover:ring-purple-400/50 transition-all duration-200">
                      <AvatarImage src={userReview.reviewer_avatar} />
                      <AvatarFallback className={`text-white text-xs md:text-sm ${getRandomAvatarColor(userReview.reviewer_id)}`}>
                        {getUserInitials(userReview.reviewer_username)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  <div className="flex-1 space-y-3 min-w-0 max-w-full overflow-hidden">
                    {editingReview === userReview.id ? (
                      // Edit mode
                      <div className="space-y-4 max-w-full">
                        <div className="flex items-center justify-between">
                          <h4 className="text-purple-300 font-medium text-sm md:text-base">Edit Your Review</h4>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-1 mb-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setEditRating(rating)}
                                className="p-1"
                              >
                                <Star
                                  className={`h-4 w-4 md:h-5 md:w-5 ${
                                    rating <= editRating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-400"
                                  } hover:text-yellow-400 transition-colors`}
                                />
                              </button>
                            ))}
                          </div>
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder-white/60 text-sm w-full"
                            placeholder="Update your review..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                          <Button
                            onClick={() => saveEdit(userReview.id)}
                            disabled={submitReviewMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm"
                            size="sm"
                          >
                            <Save className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            onClick={cancelEditing}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10 text-sm"
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="max-w-full overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Link 
                                to={`/profile/${userReview.reviewer_id}`}
                                className="hover:text-purple-400 transition-colors"
                              >
                                <h4 className="text-purple-300 font-medium text-sm md:text-base truncate hover:underline">{userReview.reviewer_username}</h4>
                              </Link>
                              <span className="text-purple-400 text-xs bg-purple-600/20 px-2 py-1 rounded flex-shrink-0">Your Review</span>
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-2">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 md:h-4 md:w-4 ${
                                      i < userReview.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-400"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-white/60 text-xs md:text-sm">{formatDate(userReview.created_at)}</span>
                              {userReview.upvote_count > 0 && (
                                <div className="flex items-center space-x-1 text-purple-400 text-xs">
                                  <ThumbsUp className="h-3 w-3 fill-current" />
                                  <span>{userReview.upvote_count}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <Button
                              onClick={() => {
                                const shareUrl = getReviewShareUrl(userReview.id);
                                navigator.clipboard.writeText(shareUrl);
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-white/40 hover:text-purple-400 hover:bg-purple-400/10 p-1 h-6 w-6 rounded-md transition-all duration-200"
                              title="Share review"
                            >
                              <Share className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => startEditing(userReview)}
                              variant="ghost"
                              size="sm"
                              className="text-white/40 hover:text-purple-400 hover:bg-purple-400/10 p-1 h-6 w-6 rounded-md transition-all duration-200"
                              title="Edit review"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteReview(userReview.id, true)}
                              variant="ghost"
                              size="sm"
                              className="text-white/40 hover:text-red-400 hover:bg-red-400/10 p-1 h-6 w-6 rounded-md transition-all duration-200"
                              title="Delete review"
                              disabled={deleteReview.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {userReview.review_text && (
                          <div className="mt-3 max-w-full overflow-hidden">
                            <p className="text-white/80 text-sm md:text-base break-words leading-relaxed whitespace-pre-wrap">
                              {userReview.review_text}
                            </p>
                          </div>
                        )}

                        {/* Review Interactions for user's own review */}
                        <ReviewInteractions 
                          reviewId={userReview.id} 
                          reviewAuthorId={userReview.reviewer_id}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/70">No reviews yet. Be the first to review this song!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewListSection;