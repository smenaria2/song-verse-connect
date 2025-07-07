import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCircle, Calendar, MapPin, Link as LinkIcon, Music, Star, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import SongCard from "@/components/song/SongCard";
import UserReviewCard from "@/components/review/UserReviewCard";
import { getRandomAvatarColor, getUserInitials } from "@/utils/profileUtils";
import { formatDate } from "@/utils/formatters/date";

interface PublicUserProfile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  created_at: string;
}

interface UserStats {
  songs_submitted: number;
  reviews_written: number;
  average_rating_given: number;
  following_count: number;
  followers_count: number;
}

interface SubmittedSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  average_rating: number;
  review_count: number;
  created_at: string;
  youtube_id: string;
}

interface UserReview {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  song: {
    id: string;
    title: string;
    artist: string;
    youtube_id: string;
  };
}

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [submittedSongs, setSubmittedSongs] = useState<SubmittedSong[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (userId) {
      fetchUserData();
    }
  }, [user, userId, navigate]);

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, bio, avatar_url, website, location, created_at')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          toast({
            title: "User Not Found",
            description: "The user profile you're looking for doesn't exist.",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        throw profileError;
      }
      setProfile(profileData);

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', userId)
        .single();

      if (!statsError && statsData) {
        setStats(statsData);
      }

      // Fetch submitted songs
      const { data: songsData, error: songsError } = await supabase
        .from('songs_with_stats')
        .select('*')
        .eq('submitter_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!songsError && songsData) {
        setSubmittedSongs(songsData);
      }

      // Fetch user reviews with song details
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          songs!inner(id, title, artist, youtube_id)
        `)
        .eq('reviewer_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!reviewsError && reviewsData) {
        const formattedReviews = reviewsData.map(review => ({
          id: review.id,
          rating: review.rating,
          review_text: review.review_text,
          created_at: review.created_at,
          song: {
            id: (review.songs as any).id,
            title: (review.songs as any).title,
            artist: (review.songs as any).artist,
            youtube_id: (review.songs as any).youtube_id
          }
        }));
        setUserReviews(formattedReviews);
      }

    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-purple-400 mx-auto animate-spin" />
          <p className="text-white/70 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce mb-4">
            <UserCircle className="h-16 w-16 text-white/40 mx-auto" />
          </div>
          <p className="text-white">Profile not found</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 w-full max-w-full overflow-x-hidden">
      <Navigation />

      <div className="container mx-auto px-4 py-8 md:py-12 pb-24 w-full max-w-full">
        {/* Profile Header */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-top-4 card-responsive">
          <CardContent className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar Section */}
              <div className="relative">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-2 ring-white/20">
                  <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
                  <AvatarFallback className={`text-xl md:text-2xl text-white ${getRandomAvatarColor(profile.id)}`}>
                    {getUserInitials(profile.username)}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Badge className="absolute -bottom-2 -right-2 bg-purple-600 text-white">
                    You
                  </Badge>
                )}
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-white truncate">{profile.username}</h2>
                    {isOwnProfile && (
                      <p className="text-purple-300 text-sm">This is your profile</p>
                    )}
                  </div>
                </div>
                
                {profile.bio && (
                  <p className="text-white/80 text-sm md:text-base">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-white/70 text-xs md:text-sm">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center min-w-0">
                      <LinkIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                      <a href={profile.website} className="text-purple-400 hover:underline truncate min-w-0" target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>Joined {formatDate(profile.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4">
              <CardContent className="p-2">
                <div className="text-xl md:text-2xl font-bold text-white">{stats.songs_submitted}</div>
                <div className="text-white/70 text-xs md:text-sm">Songs</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4 delay-100">
              <CardContent className="p-2">
                <div className="text-xl md:text-2xl font-bold text-white">{stats.reviews_written}</div>
                <div className="text-white/70 text-xs md:text-sm">Reviews</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4 delay-200">
              <CardContent className="p-2">
                <div className="text-xl md:text-2xl font-bold text-white">{stats.average_rating_given.toFixed(1)}</div>
                <div className="text-white/70 text-xs md:text-sm">Avg Rating</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/20 backdrop-blur-md text-center p-3 md:p-5 animate-in slide-in-from-bottom-4 delay-300">
              <CardContent className="p-2">
                <div className="text-xl md:text-2xl font-bold text-white">{stats.followers_count}</div>
                <div className="text-white/70 text-xs md:text-sm">Followers</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="songs" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-2 grid grid-cols-2 w-full max-w-md gap-2">
              <TabsTrigger 
                value="songs" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white transition-all duration-200 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <Music className="h-4 w-4 mr-2" />
                Songs ({submittedSongs.length})
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white transition-all duration-200 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Reviews ({userReviews.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="songs">
            <div className="grid gap-4">
              {submittedSongs.length > 0 ? (
                submittedSongs.map((song, index) => (
                  <SongCard 
                    key={song.id} 
                    song={song as any} 
                    showReviewSection={false}
                    index={index}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-white/70">
                  <div className="animate-bounce mb-4">
                    <Music className="h-12 w-12 text-white/40 mx-auto" />
                  </div>
                  <p>No songs submitted yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid gap-4">
              {userReviews.length > 0 ? (
                userReviews.map((review, index) => (
                  <UserReviewCard key={review.id} review={review} index={index} />
                ))
              ) : (
                <div className="text-center py-8 text-white/70">
                  <div className="animate-bounce mb-4">
                    <Star className="h-12 w-12 text-white/40 mx-auto" />
                  </div>
                  <p>No reviews written yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicProfile;