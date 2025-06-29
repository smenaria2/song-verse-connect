import { Star } from "lucide-react";
import UserReviewCard from "@/components/review/UserReviewCard";
import { UserReview } from "@/types/app";

interface UserReviewsProps {
  reviews: UserReview[];
}

const UserReviews = ({ reviews }: UserReviewsProps) => {
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
        <UserReviewCard key={review.id} review={review} index={index} />
      ))}
    </div>
  );
};

export default UserReviews;