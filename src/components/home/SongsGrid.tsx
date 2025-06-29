import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import SongCard from "@/components/song/SongCard";
import { InfiniteData } from "@tanstack/react-query";
import { Song } from "@/types/app";

interface SongsGridProps {
  data?: InfiniteData<Song[], unknown>;
  isLoading: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const SongsGrid = ({ data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage }: SongsGridProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
        {isLoading ? (
          <>
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white/5 border-white/10 backdrop-blur-md animate-pulse rounded-lg p-4 md:p-6">
                <div className="flex flex-col space-y-4">
                  <div className="aspect-video bg-gray-600 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : data?.pages ? (
          data.pages.map((page) =>
            page.map((song, index) => (
              <SongCard 
                key={song.id} 
                song={song} 
                showReviewSection={true}
                index={index}
              />
            ))
          )
        ) : null}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="text-center mt-8">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading More...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default SongsGrid;