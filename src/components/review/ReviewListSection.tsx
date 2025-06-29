import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageCircle, Loader2, ThumbsUp, Pencil, Trash2, Save, X } from "lucide-react";
import { useReviews, useSubmitReview, useDeleteReview } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import ReviewInteractions from "@/components/ReviewInteractions";
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

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await deleteReview.mutateAsync(reviewId);
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md animate-in slide-in-from-right-4 duration-1000 delay-400">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Reviews ({reviews.length})</CardTitle>
          <Select value={sortBy} onValueChange={(value: 'newest' | 'helpful') => setSortBy(value)}>
            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
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
      <CardContent className="space-y-6">
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
                className="border-b border-white/10 pb-6 last:border-b-0 animate-in slide-in-from-bottom-4 scroll-mt-24 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start space-x-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.reviewer_avatar} />
                    <AvatarFallback className={`text-white ${getRandomAvatarColor(review.reviewer_id)}`}>
                      {getUserInitials(review.reviewer_username)}
                    </AvatarFallback>
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
                          {sortBy === 'helpful' && review.upvote_count > 0 && (
                            <div className="flex items-center space-x-1 text-purple-400 text-sm">
                              <ThumbsUp className="h-3 w-3 fill-current" />
                              <span>{review.upvote_count}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {review.review_text && (
                      <p className="text-white/80">{review.review_text}</p>
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
              <div className="border-t border-purple-500/30 pt-6" id={`review-${userReview.id}`}>
                <div className="flex items-start space-x-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={userReview.reviewer_avatar} />
                    <AvatarFallback className={`text-white ${getRandomAvatarColor(userReview.reviewer_id)}`}>
                      {getUserInitials(userReview.reviewer_username)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-3">
                    {editingReview === userReview.id ? (
                      // Edit mode
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-purple-300 font-medium">Edit Your Review</h4>
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-1 mb-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => setEditRating(rating)}
                                className="p-1"
                              >
                                <Star
                                  className={`h-5 w-5 ${
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
                            className="bg-white/10 border-white/20 text-white placeholder-white/60"
                            placeholder="Update your review..."
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => saveEdit(userReview.id)}
                            disabled={submitReviewMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button
                            onClick={cancelEditing}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-purple-300 font-medium">{userReview.reviewer_username}</h4>
                              <span className="text-purple-400 text-xs bg-purple-600/20 px-2 py-1 rounded">Your Review</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < userReview.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-400"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-white/60 text-sm">{formatDate(userReview.created_at)}</span>
                              {userReview.upvote_count > 0 && (
                                <div className="flex items-center space-x-1 text-purple-400 text-sm">
                                  <ThumbsUp className="h-3 w-3 fill-current" />
                                  <span>{userReview.upvote_count}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => startEditing(userReview)}
                              variant="ghost"
                              size="sm"
                              className="text-white/60 hover:text-purple-400 hover:bg-white/10"
                              title="Edit review"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteReview(userReview.id)}
                              variant="ghost"
                              size="sm"
                              className="text-white/60 hover:text-red-400 hover:bg-white/10"
                              title="Delete review"
                              disabled={deleteReview.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {userReview.review_text && (
                          <p className="text-white/80 mt-3">{userReview.review_text}</p>
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