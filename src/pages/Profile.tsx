import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { usePlaylists } from "@/hooks/usePlaylists";
import Navigation from "@/components/Navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileStats from "@/components/profile/ProfileStats";
import SubmittedSongs from "@/components/profile/SubmittedSongs";
import UserReviews from "@/components/profile/UserReviews";
import UserPlaylists from "@/components/profile/UserPlaylists";

interface UserProfile {
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

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [submittedSongs, setSubmittedSongs] = useState<SubmittedSong[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: playlists = [] } = usePlaylists();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!statsError && statsData) {
        setStats(statsData);
      }

      // Fetch submitted songs
      const { data: songsData, error: songsError } = await supabase
        .from('songs_with_stats')
        .select('*')
        .eq('submitter_id', user.id)
        .order('created_at', { ascending: false });

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
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false });

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
        description: "Failed to load profile data",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 w-full max-w-full overflow-x-hidden">
      <Navigation />

      <div className="container mx-auto px-4 py-8 md:py-12 pb-24 w-full max-w-full">
        <ProfileHeader profile={profile} setProfile={setProfile} />
        
        <ProfileStats stats={stats} />

        <Tabs defaultValue="submitted" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="bg-white/10 border border-white/20 backdrop-blur-md rounded-xl p-2 grid grid-cols-4 w-full max-w-2xl gap-2">
              <TabsTrigger 
                value="submitted" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white transition-all duration-200 rounded-lg px-4 py-2 text-sm font-medium"
              >
                Songs
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white transition-all duration-200 rounded-lg px-4 py-2 text-sm font-medium"
              >
                Reviews
              </TabsTrigger>
              <TabsTrigger 
                value="playlists" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white transition-all duration-200 rounded-lg px-4 py-2 text-sm font-medium"
              >
                Playlists
              </TabsTrigger>
              <TabsTrigger 
                value="following" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white transition-all duration-200 rounded-lg px-4 py-2 text-sm font-medium"
              >
                Following
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="submitted">
            <SubmittedSongs songs={submittedSongs} />
          </TabsContent>

          <TabsContent value="reviews">
            <UserReviews reviews={userReviews} />
          </TabsContent>

          <TabsContent value="playlists">
            <UserPlaylists playlists={playlists} />
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            <div className="text-center py-8">
              <div className="animate-pulse mb-4">
                <UserCircle className="h-12 w-12 text-white/40 mx-auto" />
              </div>
              <p className="text-white/70">Following feature coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;