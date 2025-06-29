import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubmitReview } from "@/hooks/useReviews";
import { useToast } from "@/components/ui/use-toast";

interface ReviewFormSectionProps {
  songId: string;
  userReview?: any;
}

const ReviewFormSection = ({ songId, userReview }: ReviewFormSectionProps) => {
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const submitReviewMutation = useSubmitReview();
  const { toast } = useToast();

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
      await submitReviewMutation.mutateAsync({
        song_id: songId,
        rating: newReview.rating,
        review_text: newReview.text || undefined
      });
      
      setNewReview({ rating: 0, text: "" });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!user || userReview) {
    return null;
  }

  return (
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
  );
};

export default ReviewFormSection;