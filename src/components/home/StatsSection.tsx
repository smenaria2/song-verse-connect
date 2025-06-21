
import { Card, CardContent } from "@/components/ui/card";
import { SongsStats } from "@/hooks/useSongs";

interface StatsSectionProps {
  stats?: SongsStats;
}

const StatsSection = ({ stats }: StatsSectionProps) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4">
        <CardContent className="p-2">
          <div className="text-xl md:text-3xl font-bold text-white">{stats.total_songs}</div>
          <div className="text-white/70 text-xs md:text-sm">Total Songs</div>
        </CardContent>
      </Card>
      <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4 delay-100">
        <CardContent className="p-2">
          <div className="text-xl md:text-3xl font-bold text-white">{stats.total_artists}</div>
          <div className="text-white/70 text-xs md:text-sm">Total Artists</div>
        </CardContent>
      </Card>
      <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4 delay-200">
        <CardContent className="p-2">
          <div className="text-xl md:text-3xl font-bold text-white">{stats.total_reviews}</div>
          <div className="text-white/70 text-xs md:text-sm">Total Reviews</div>
        </CardContent>
      </Card>
      <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4 delay-300">
        <CardContent className="p-2">
          <div className="text-xl md:text-3xl font-bold text-white">{stats.average_rating.toFixed(1)}</div>
          <div className="text-white/70 text-xs md:text-sm">Average Rating</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSection;
