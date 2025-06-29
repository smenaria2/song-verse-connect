import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Pause, Play, Share } from "lucide-react";
import { Link } from "react-router-dom";
import { Review } from "@/types/app";
import { getRandomAvatarColor, getUserInitials } from "@/utils/profileUtils";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface RecentReviewsCarouselProps {
  recentReviews: Review[];
}

const RecentReviewsCarousel = ({ recentReviews }: RecentReviewsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Mobile: Show 1 item, Desktop: Show 3 items
  const itemsPerView = window.innerWidth < 768 ? 1 : 3;
  const maxIndex = Math.max(0, recentReviews.length - itemsPerView);

  useEffect(() => {
    if (isPlaying && !isPaused && recentReviews.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 5000); // Slower on mobile for better readability
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isPaused, maxIndex, recentReviews.length, itemsPerView]);

  // Move the conditional check after all hooks
  if (!recentReviews || recentReviews.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleShareReview = (review: Review) => {
    const shareUrl = `${window.location.origin}/song/${review.song_id}#review-${review.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Review Link Copied!",
      description: "Review link copied to clipboard"
    });
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-right-4 card-responsive">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-semibold text-white">Recent Reviews</h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleAutoPlay}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              onClick={goToPrevious}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={goToNext}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div 
          className="overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              width: `${(recentReviews.length / itemsPerView) * 100}%`
            }}
          >
            {recentReviews.map((review) => (
              <div 
                key={review.id} 
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / recentReviews.length}%` }}
              >
                {/* Enhanced mobile-friendly review card */}
                <div className="bg-white/15 rounded-lg p-4 md:p-4 border border-white/20 h-full hover:bg-white/25 hover:border-purple-400/50 transition-all duration-200 shadow-lg backdrop-blur-sm">
                  {/* Header with user info and share button */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 md:h-10 md:w-10 ring-2 ring-white/20 flex-shrink-0">
                        <AvatarImage src={review.reviewer_avatar || ""} alt={review.reviewer_username} />
                        <AvatarFallback className={`text-sm text-white font-semibold ${getRandomAvatarColor(review.reviewer_id)}`}>
                          {getUserInitials(review.reviewer_username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-base font-semibold text-white truncate">{review.reviewer_username}</h3>
                        <p className="text-white/80 text-sm">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleShareReview(review)}
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-purple-400 hover:bg-white/10 p-2 flex-shrink-0"
                      title="Share review"
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Song info - more prominent on mobile */}
                  <Link 
                    to={`/song/${review.song_id}#review-${review.id}`}
                    className="block mb-3 hover:text-purple-200 transition-colors"
                  >
                    <h4 className="font-semibold text-base md:text-base text-white mb-1 line-clamp-2">{review.song_title || 'Unknown Song'}</h4>
                    <p className="text-white/90 text-sm font-medium truncate">{review.song_artist || 'Unknown Artist'}</p>
                  </Link>
                  
                  {/* Rating - larger on mobile */}
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 md:h-4 md:w-4 ${i < review.rating ? "text-yellow-300 fill-current" : "text-white/40"
                          }`}
                      />
                    ))}
                  </div>
                  
                  {/* Review text - better spacing on mobile */}
                  {review.review_text && (
                    <p className="text-white/95 text-sm md:text-sm line-clamp-4 md:line-clamp-3 font-medium leading-relaxed mb-3">
                      {review.review_text}
                    </p>
                  )}
                  
                  {/* Interaction stats */}
                  <div className="flex items-center justify-between text-white/70 text-xs">
                    <div className="flex items-center space-x-3">
                      {review.upvote_count > 0 && (
                        <span className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{review.upvote_count}</span>
                        </span>
                      )}
                      {review.comment_count > 0 && (
                        <span>{review.comment_count} comments</span>
                      )}
                    </div>
                    <span className="text-purple-300 font-medium">
                      Tap to view →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced dots indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 md:w-2 md:h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-purple-300 shadow-lg scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentReviewsCarousel;