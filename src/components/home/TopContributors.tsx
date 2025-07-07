import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Music, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getRandomAvatarColor, getUserInitials } from "@/utils/profileUtils";

interface TopContributor {
  id: string;
  username: string;
  avatar_url?: string;
  songs_submitted: number;
  reviews_written: number;
  average_rating_given: number;
  total_contributions: number;
}

const TopContributors = () => {
  const { data: topContributors = [], isLoading } = useQuery({
    queryKey: ['top-contributors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .order('songs_submitted', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Calculate total contributions and sort by it
      const contributorsWithTotal = (data || []).map(contributor => ({
        ...contributor,
        total_contributions: contributor.songs_submitted + contributor.reviews_written
      })).sort((a, b) => b.total_contributions - a.total_contributions);

      return contributorsWithTotal as TopContributor[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading || topContributors.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-left-4 card-responsive">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Crown className="h-6 w-6 mr-2 text-yellow-400" />
          Top Contributors
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topContributors.map((contributor, index) => (
            <Link 
              key={contributor.id} 
              to={`/profile/${contributor.id}`}
              className="block"
            >
              <Card className="bg-white/5 border-white/10 hover:bg-white/15 transition-all duration-300 hover:border-purple-400/50 cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12 ring-2 ring-white/20">
                        <AvatarImage src={contributor.avatar_url || ""} alt={contributor.username} />
                        <AvatarFallback className={`text-white font-semibold ${getRandomAvatarColor(contributor.id)}`}>
                          {getUserInitials(contributor.username)}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1">
                          <Crown className="h-4 w-4 text-yellow-400 fill-current" />
                        </div>
                      )}
                      {index < 3 && (
                        <Badge 
                          className={`absolute -bottom-1 -right-1 text-xs px-1 ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            'bg-orange-600 text-white'
                          }`}
                        >
                          #{index + 1}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{contributor.username}</h4>
                      <div className="flex items-center space-x-3 text-xs text-white/70 mt-1">
                        <div className="flex items-center space-x-1">
                          <Music className="h-3 w-3" />
                          <span>{contributor.songs_submitted}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{contributor.reviews_written}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{contributor.total_contributions}</span>
                        </div>
                      </div>
                      {contributor.average_rating_given > 0 && (
                        <div className="text-xs text-purple-300 mt-1">
                          Avg rating: {contributor.average_rating_given.toFixed(1)}⭐
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <p className="text-white/60 text-sm">
            Celebrating our most active community members! 🎵
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopContributors;