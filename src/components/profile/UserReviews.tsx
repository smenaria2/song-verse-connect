import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Play, Pencil, Trash2 } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitReview } from "@/hooks/useReviews";

interface UserReview {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  song: {
    id: string;
    title: string;
    artist: string;
    youtube_id: string;
  };
}

interface UserReviewsProps {
  reviews: UserReview[];
}

const UserReviews = ({ reviews }: UserReviewsProps) => {
  const { playPause } = useAudioPlayer();
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const submitReview = useSubmitReview();

  const handleSongPlay = (song: UserReview['song']) => {
    playPause({
      id: song.id,
      youtubeId: song.youtube_id,
      title: song.title,
      artist: song.artist
    });
  };

  const startEditing = (review: UserReview) => {
    setEditingReview(review.id);
    setEditText(review.review_text || "");
    setEditRating(review.rating);
  };

  const cancelEditing = () => {
    setEditingReview(null);
    setEditText("");
    setEditRating(5);
  };

  const saveEdit = async (songId: string) => {
    try {
      await submitReview.mutateAsync({
        song_id: songId,
        rating: editRating,
        review_text: editText
      });
      setEditingReview(null);
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-white/70">
        <div className="animate-bounce mb-4">
          <Star className="h-12 w-12 text-white/40 mx-auto" />
        </div>
        <p>No reviews written yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {reviews.map((review, index) => (
        <Card 
          key={review.id} 
          className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 animate-in slide-in-from-right-4"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4 md:p-6">
            {editingReview === review.id ? (
              // Edit mode
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{review.song.title}</h3>
                    <p className="text-white/70 truncate">{review.song.artist}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Rating</label>
                    <div className="flex items-center space-x-1">
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
                  </div>
                  
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Review</label>
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
                      onClick={() => saveEdit(review.song.id)}
                      disabled={submitReview.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // View mode
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{review.song.title}</h3>
                    <p className="text-white/70 truncate">{review.song.artist}</p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end space-x-2">
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
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => startEditing(review)}
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-purple-400 hover:bg-white/10 p-2"
                        title="Edit review"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleSongPlay(review.song)}
                        variant="outline"
                        size="sm"
                        className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {review.review_text && (
                  <p className="text-white/80 text-sm md:text-base">{review.review_text}</p>
                )}
                <div className="flex items-center justify-between text-white/60 text-sm">
                  <span>{formatDate(review.created_at)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserReviews;