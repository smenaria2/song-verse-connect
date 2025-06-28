import { Card, CardContent } from "@/components/ui/card";
import { SongsStats } from "@/hooks/useSongs";

interface StatsSectionProps {
  stats?: SongsStats;
}

const StatsSection = ({ stats }: StatsSectionProps) => {
  if (!stats) return null;

  return (
    <div className="mt-16 mb-8">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">Community Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md text-center p-3 animate-in slide-in-from-bottom-4">
          <CardContent className="p-3">
            <div className="text-lg md:text-xl font-bold text-white">{stats.total_songs}</div>
            <div className="text-white/60 text-xs md:text-sm">Songs</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md text-center p-3 animate-in slide-in-from-bottom-4 delay-100">
          <CardContent className="p-3">
            <div className="text-lg md:text-xl font-bold text-white">{stats.total_artists}</div>
            <div className="text-white/60 text-xs md:text-sm">Artists</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md text-center p-3 animate-in slide-in-from-bottom-4 delay-200">
          <CardContent className="p-3">
            <div className="text-lg md:text-xl font-bold text-white">{stats.total_reviews}</div>
            <div className="text-white/60 text-xs md:text-sm">Reviews</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsSection;