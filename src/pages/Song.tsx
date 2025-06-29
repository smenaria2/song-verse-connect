import { useParams, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSongDetails } from "@/hooks/useSongDetails";
import { useReviews } from "@/hooks/useReviews";
import Navigation from "@/components/Navigation";
import SongDetailsDisplay from "@/components/song/SongDetailsDisplay";
import ReviewFormSection from "@/components/review/ReviewFormSection";
import ReviewListSection from "@/components/review/ReviewListSection";
import { useEffect } from "react";

const Song = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const { song, loading } = useSongDetails(id);
  const { data: reviews = [] } = useReviews(id || '');

  // Get user's existing review for this song
  const userReview = reviews.find(review => review.reviewer_id === user?.id);

  // Scroll to specific review if hash is present
  useEffect(() => {
    if (location.hash && reviews.length > 0) {
      const reviewId = location.hash.replace('#review-', '');
      const reviewElement = document.getElementById(`review-${reviewId}`);
      if (reviewElement) {
        setTimeout(() => {
          reviewElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add a subtle highlight effect
          reviewElement.classList.add('ring-2', 'ring-purple-500', 'ring-opacity-50');
          setTimeout(() => {
            reviewElement.classList.remove('ring-2', 'ring-purple-500', 'ring-opacity-50');
          }, 3000);
        }, 500);
      }
    }
  }, [location.hash, reviews]);

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
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Song Details */}
          <SongDetailsDisplay song={song} />

          {/* Write Review */}
          <ReviewFormSection songId={id!} userReview={userReview} />

          {/* Reviews */}
          <ReviewListSection songId={id!} />
        </div>
      </div>
    </div>
  );
};

export default Song;