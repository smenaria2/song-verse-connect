import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Music, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSongs, useSongsStats } from "@/hooks/useSongs";
import { useReviews } from "@/hooks/useReviews";
import { useWelcomeModal } from "@/hooks/useWelcomeModal";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/home/HeroSection";
import SearchAndFilter from "@/components/home/SearchAndFilter";
import StatsSection from "@/components/home/StatsSection";
import RecentReviewsCarousel from "@/components/home/RecentReviewsCarousel";
import SongsGrid from "@/components/home/SongsGrid";
import WelcomeModal from "@/components/WelcomeModal";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const { user } = useAuth();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useSongs(searchTerm, genreFilter);
  const { data: stats, isLoading: isLoadingStats } = useSongsStats();
  const { data: recentReviews = [], isLoading: isLoadingReviews } = useReviews();
  const { showWelcome, isFirstTime, closeWelcome, showWelcomeManually } = useWelcomeModal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 w-full max-w-full overflow-x-hidden">
      {/* Navigation - Always show, but content changes based on auth */}
      <Navigation />
      
      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={closeWelcome} 
        isFirstTimeUser={isFirstTime}
      />
      
      {/* Unauthenticated User Welcome Section */}
      {!user && (
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-top-4">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="mb-6">
                <div className="relative inline-block">
                  <Music className="h-16 w-16 text-purple-400 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Welcome to Song Monk
              </h2>
              <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
                Discover, share, and review the most meaningful songs in your spiritual journey. 
                Join our community of music lovers and explore sacred music from around the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    <LogIn className="h-5 w-5 mr-2" />
                    Get Started
                  </Button>
                </Link>
                <Button 
                  onClick={showWelcomeManually}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  How it Works
                </Button>
              </div>
              <p className="text-white/60 text-sm mt-4">
                Sign up to submit songs, write reviews, and create playlists
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 pb-24 w-full max-w-full">
        {/* Show hero section only for authenticated users */}
        {user && <HeroSection />}
        
        {/* Help button for authenticated users */}
        {user && (
          <div className="flex justify-end mb-4">
            <Button 
              onClick={showWelcomeManually}
              variant="outline"
              size="sm"
              className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              How it Works
            </Button>
          </div>
        )}
        
        <SearchAndFilter 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
        />

        <RecentReviewsCarousel recentReviews={recentReviews} />

        <SongsGrid 
          data={data}
          isLoading={isLoading}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />

        <StatsSection stats={stats} />
      </div>
    </div>
  );
};

export default Index;