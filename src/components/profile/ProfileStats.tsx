
import { Card, CardContent } from "@/components/ui/card";

interface UserStats {
  songs_submitted: number;
  reviews_written: number;
  average_rating_given: number;
  following_count: number;
  followers_count: number;
}

interface ProfileStatsProps {
  stats?: UserStats | null;
}

const ProfileStats = ({ stats }: ProfileStatsProps) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4">
        <CardContent className="p-2">
          <div className="text-xl md:text-2xl font-bold text-white">{stats.songs_submitted}</div>
          <div className="text-white/70 text-xs md:text-sm">Songs Submitted</div>
        </CardContent>
      </Card>
      <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4 delay-100">
        <CardContent className="p-2">
          <div className="text-xl md:text-2xl font-bold text-white">{stats.reviews_written}</div>
          <div className="text-white/70 text-xs md:text-sm">Reviews Written</div>
        </CardContent>
      </Card>
      <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4 delay-200">
        <CardContent className="p-2">
          <div className="text-xl md:text-2xl font-bold text-white">{stats.average_rating_given.toFixed(1)}</div>
          <div className="text-white/70 text-xs md:text-sm">Avg Rating Given</div>
        </CardContent>
      </Card>
      <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4 delay-300">
        <CardContent className="p-2">
          <div className="text-xl md:text-2xl font-bold text-white">{stats.followers_count}</div>
          <div className="text-white/70 text-xs md:text-sm">Followers</div>
        </CardContent>
      </Card>
      <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4 delay-400">
        <CardContent className="p-2">
          <div className="text-xl md:text-2xl font-bold text-white">{stats.following_count}</div>
          <div className="text-white/70 text-xs md:text-sm">Following</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
