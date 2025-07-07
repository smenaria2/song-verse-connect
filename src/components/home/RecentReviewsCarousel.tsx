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
  const [isMobile, setIsMobile] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: Show 1 item, Desktop: Show 2 items (changed from 3)
  const itemsPerView = isMobile ? 1 : 2;
  const maxIndex = Math.max(0, recentReviews.length - itemsPerView);

  useEffect(() => {
    if (isPlaying && !isPaused && recentReviews.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, isMobile ? 6000 : 4000); // Slower on mobile for better readability
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
  }, [isPlaying, isPaused, maxIndex, recentReviews.length, itemsPerView, isMobile]);

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
                className={`flex-shrink-0 ${isMobile ? 'w-full' : 'px-2'}`}
                style={{ 
                  width: `${100 / itemsPerView}%`
                }}
              >
                {/* Enhanced mobile-friendly review card */}
                <div className={`bg-white/15 rounded-lg border border-white/20 h-full hover:bg-white/25 hover:border-purple-400/50 transition-all duration-200 shadow-lg backdrop-blur-sm ${
                  isMobile ? 'p-6 min-h-[320px]' : 'p-4'
                }`}>
                  {/* Header with user info and share button */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Link to={`/profile/${review.reviewer_id}`} className="flex-shrink-0">
                        <Avatar className={`ring-2 ring-white/20 flex-shrink-0 hover:ring-purple-400/50 transition-all duration-200 ${
                          isMobile ? 'h-14 w-14' : 'h-10 w-10'
                        }`}>
                          <AvatarImage src={review.reviewer_avatar || ""} alt={review.reviewer_username} />
                          <AvatarFallback className={`text-white font-semibold ${getRandomAvatarColor(review.reviewer_id)} ${
                            isMobile ? 'text-base' : 'text-sm'
                          }`}>
                            {getUserInitials(review.reviewer_username)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/profile/${review.reviewer_id}`}
                          className="hover:text-purple-400 transition-colors"
                        >
                          <h3 className={`font-semibold text-white truncate hover:underline ${
                            isMobile ? 'text-lg' : 'text-base'
                          }`}>{review.reviewer_username}</h3>
                        </Link>
                        <p className={`text-white/80 ${
                          isMobile ? 'text-base' : 'text-sm'
                        }`}>
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
                    className="block mb-4 hover:text-purple-200 transition-colors"
                  >
                    <h4 className={`font-semibold text-white mb-2 ${
                      isMobile ? 'text-lg line-clamp-2' : 'text-base line-clamp-2'
                    }`}>{review.song_title || 'Unknown Song'}</h4>
                    <p className={`text-white/90 font-medium truncate ${
                      isMobile ? 'text-base' : 'text-sm'
                    }`}>{review.song_artist || 'Unknown Artist'}</p>
                  </Link>
                  
                  {/* Rating - larger on mobile */}
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'} ${
                          i < review.rating ? "text-yellow-300 fill-current" : "text-white/40"
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Review text - better spacing on mobile */}
                  {review.review_text && (
                    <p className={`text-white/95 font-medium leading-relaxed mb-4 ${
                      isMobile ? 'text-base line-clamp-4' : 'text-sm line-clamp-3'
                    }`}>
                      {review.review_text}
                    </p>
                  )}
                  
                  {/* Interaction stats */}
                  <div className={`flex items-center justify-between text-white/70 ${
                    isMobile ? 'text-sm' : 'text-xs'
                  }`}>
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
                      {isMobile ? 'Tap to view →' : 'View →'}
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
              className={`rounded-full transition-all duration-200 ${
                isMobile ? 'w-3 h-3' : 'w-2 h-2'
              } ${
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