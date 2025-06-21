
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Review } from "@/hooks/useReviews";
import { getRandomAvatarColor, getUserInitials } from "@/utils/profileUtils";

interface RecentReviewsCarouselProps {
  recentReviews: Review[];
}

const RecentReviewsCarousel = ({ recentReviews }: RecentReviewsCarouselProps) => {
  if (!recentReviews || recentReviews.length === 0) return null;

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-right-4 card-responsive">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">Recent Reviews</h2>
        <Carousel className="w-full">
          <CarouselContent className="-ml-1 pl-1">
            {recentReviews.map((review) => (
              <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-2 md:p-4">
                  <div className="flex flex-col h-full bg-black/20 rounded-md p-3 md:p-4 border border-white/10">
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 md:left-4" />
          <CarouselNext className="right-2 md:right-4" />
        </Carousel>
      </CardContent>
    </Card>
  );
};

export default RecentReviewsCarousel;
