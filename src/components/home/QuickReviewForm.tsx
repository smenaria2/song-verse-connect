
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Loader2 } from "lucide-react";
import { useSubmitReview } from "@/hooks/useReviews";
import { Song } from "@/hooks/useSongs";

interface QuickReviewFormProps {
  recentSongs: Song[];
}

const QuickReviewForm = ({ recentSongs }: QuickReviewFormProps) => {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const submitReview = useSubmitReview();

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSongId || !reviewText.trim()) return;

    submitReview.mutate({
      song_id: selectedSongId,
      rating: rating,
      review_text: reviewText,
    }, {
      onSuccess: () => {
        setReviewText("");
        setRating(5);
        setSelectedSongId(null);
      }
    });
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-left-4 card-responsive">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Quick Review</h2>
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
            <div className="flex items-center flex-wrap">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-400"
                    } cursor-pointer mr-1`}
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
          <Button type="submit" className="w-full" disabled={submitReview.isPending}>
            {submitReview.isPending ? (
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
  );
};

export default QuickReviewForm;
