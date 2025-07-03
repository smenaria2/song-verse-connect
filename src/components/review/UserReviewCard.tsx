import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Play, Pencil, Trash2, Pause } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useSubmitReview, useDeleteReview } from "@/hooks/useReviews";
import { UserReview } from "@/types/app";
import { formatDate } from "@/utils/formatters/date";

interface UserReviewCardProps {
  review: UserReview;
  index?: number;
}

const UserReviewCard = ({ review, index = 0 }: UserReviewCardProps) => {
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  
  const { playPause, currentSong, isPlaying } = useAudioPlayer();
  const submitReview = useSubmitReview();
  const deleteReview = useDeleteReview();

  const handleSongPlay = () => {
    console.log('UserReviewCard: Play button clicked for song:', review.song.title);
    playPause({
      id: review.song.id,
      youtubeId: review.song.youtube_id,
      title: review.song.title,
      artist: review.song.artist
    });
  };

  const startEditing = () => {
    setEditingReview(review.id);
    setEditText(review.review_text || "");
    setEditRating(review.rating);
  };

  const cancelEditing = () => {
    setEditingReview(null);
    setEditText("");
    setEditRating(5);
  };

  const saveEdit = async () => {
    try {
      await submitReview.mutateAsync({
        song_id: review.song.id,
        rating: editRating,
        review_text: editText
      });
      setEditingReview(null);
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const handleDeleteReview = async () => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await deleteReview.mutateAsync(review.id);
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  // Check if this song is currently playing
  const isCurrentSong = currentSong?.id === review.song.id;
  const isCurrentlyPlaying = isCurrentSong && isPlaying;

  return (
    <Card 
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
                  onClick={saveEdit}
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
                    onClick={startEditing}
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-purple-400 hover:bg-white/10 p-2"
                    title="Edit review"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleDeleteReview}
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-red-400 hover:bg-white/10 p-2"
                    title="Delete review"
                    disabled={deleteReview.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSongPlay}
                    variant="outline"
                    size="sm"
                    className={`${
                      isCurrentlyPlaying
                        ? 'border-green-500/50 bg-green-600/20 text-green-300 hover:bg-green-600/30'
                        : 'border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 hover:text-white'
                    }`}
                  >
                    {isCurrentlyPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            {review.review_text && (
              <p className="text-white/80 text-sm md:text-base">{review.review_text}</p>
            )}
            <div className="flex items-center justify-between text-white/60 text-sm">
              <span>{formatDate(review.created_at)}</span>
              {isCurrentlyPlaying && (
                <span className="text-green-400 font-medium">Currently Playing</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserReviewCard;