import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Review } from "@/hooks/useReviews";
import { getRandomAvatarColor, getUserInitials } from "@/utils/profileUtils";
import { useState, useEffect, useRef } from "react";

interface RecentReviewsCarouselProps {
  recentReviews: Review[];
}

const RecentReviewsCarousel = ({ recentReviews }: RecentReviewsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!recentReviews || recentReviews.length === 0) return null;

  const itemsPerView = 3;
  const maxIndex = Math.max(0, recentReviews.length - itemsPerView);

  useEffect(() => {
    if (isPlaying && !isPaused && recentReviews.length > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, 3000);
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
                <div className="bg-black/20 rounded-md p-3 md:p-4 border border-white/10 h-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage src={review.reviewer_avatar || ""} alt={review.reviewer_username} />
                      <AvatarFallback className={`text-xs md:text-sm text-white ${getRandomAvatarColor(review.reviewer_id)}`}>
                        {getUserInitials(review.reviewer_username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-lg font-semibold text-white truncate">{review.reviewer_username}</h3>
                      <p className="text-white/60 text-xs md:text-sm">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <Link to={`/song/${review.song_id}`} className="text-white hover:text-purple-400">
                      <h4 className="font-semibold text-sm md:text-base truncate">{review.song_title || 'Unknown Song'}</h4>
                      <p className="text-white/70 text-xs md:text-sm truncate">{review.song_artist || 'Unknown Artist'}</p>
                    </Link>
                  </div>
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-400"
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-white/80 text-xs md:text-sm line-clamp-3">{review.review_text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dots indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-purple-400' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentReviewsCarousel;