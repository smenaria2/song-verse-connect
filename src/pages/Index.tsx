
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSongs, useSongsStats } from "@/hooks/useSongs";
import { useReviews } from "@/hooks/useReviews";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/home/HeroSection";
import SearchAndFilter from "@/components/home/SearchAndFilter";
import StatsSection from "@/components/home/StatsSection";
import QuickReviewForm from "@/components/home/QuickReviewForm";
import RecentReviewsCarousel from "@/components/home/RecentReviewsCarousel";
import SongsGrid from "@/components/home/SongsGrid";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const { user } = useAuth();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSongs(searchTerm, genreFilter);
  const { data: stats, isLoading: isLoadingStats } = useSongsStats();
  const { data: recentReviews = [], isLoading: isLoadingReviews } = useReviews();

  // Get the 3 most recent songs for quick review
  const recentSongs = data?.pages?.flatMap(page => page)?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 w-full max-w-full overflow-x-hidden">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pb-24 w-full max-w-full">
        <HeroSection />
        
        <SearchAndFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
        />

        <StatsSection stats={stats} />

        {user && recentSongs && recentSongs.length > 0 && (
          <QuickReviewForm recentSongs={recentSongs} />
        )}

        <RecentReviewsCarousel recentReviews={recentReviews} />

        <SongsGrid 
          data={data}
          isLoading={isLoading}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </div>
  );
};

export default Index;
