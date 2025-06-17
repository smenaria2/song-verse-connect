import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music, Star, Edit, Calendar, MapPin, Link as LinkIcon, Home, Upload, UserCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
}

interface UserReview {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  song: {
    title: string;
    artist: string;
  };
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

      // Fetch user reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          songs!inner(title, artist)
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
            title: (review.songs as any).title,
            artist: (review.songs as any).artist
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

  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">SongScope</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                <Home className="h-4 w-4" />
                <span>Browse</span>
              </Link>
              <Link to="/submit" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Submit Song</span>
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 text-purple-400">
                <UserCircle className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-top-4">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <Avatar className="w-32 h-32 animate-pulse">
                  <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
                  <AvatarFallback className="text-2xl">{profile.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white">{profile.username}</h2>
                    <p className="text-white/70 text-lg">{user?.email}</p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                
                {profile.bio && (
                  <p className="text-white/80">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-white/70">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      <a href={profile.website} className="text-purple-400 hover:underline" target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {formatDate(profile.created_at)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t border-white/20">
                <div className="text-center animate-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
                  <div className="text-2xl font-bold text-white">{stats.songs_submitted}</div>
                  <div className="text-white/70 text-sm">Songs Submitted</div>
                </div>
                <div className="text-center animate-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
                  <div className="text-2xl font-bold text-white">{stats.reviews_written}</div>
                  <div className="text-white/70 text-sm">Reviews Written</div>
                </div>
                <div className="text-center animate-in slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
                  <div className="text-2xl font-bold text-white">{stats.average_rating_given.toFixed(1)}</div>
                  <div className="text-white/70 text-sm">Avg Rating Given</div>
                </div>
                <div className="text-center animate-in slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
                  <div className="text-2xl font-bold text-white">{stats.followers_count}</div>
                  <div className="text-white/70 text-sm">Followers</div>
                </div>
                <div className="text-center animate-in slide-in-from-bottom-4" style={{ animationDelay: '500ms' }}>
                  <div className="text-2xl font-bold text-white">{stats.following_count}</div>
                  <div className="text-white/70 text-sm">Following</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="submitted" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="submitted" className="data-[state=active]:bg-purple-600">
              Submitted Songs
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-600">
              My Reviews
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:bg-purple-600">
              Following
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submitted" className="space-y-4">
            <div className="grid gap-4">
              {submittedSongs.length > 0 ? submittedSongs.map((song, index) => (
                <Card 
                  key={song.id} 
                  className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 animate-in slide-in-from-left-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">{song.title}</h3>
                        <p className="text-white/70">{song.artist}</p>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                            {formatGenre(song.genre)}
                          </Badge>
                          <div className="flex items-center text-white/60">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {song.average_rating.toFixed(1)} ({song.review_count} reviews)
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-white/60">
                        <p className="text-sm">Submitted</p>
                        <p className="text-sm">{formatDate(song.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-8 text-white/70">
                  <div className="animate-bounce mb-4">
                    <Music className="h-12 w-12 text-white/40 mx-auto" />
                  </div>
                  <p>No songs submitted yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div className="grid gap-4">
              {userReviews.length > 0 ? userReviews.map((review, index) => (
                <Card 
                  key={review.id} 
                  className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all duration-300 animate-in slide-in-from-right-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{review.song.title}</h3>
                          <p className="text-white/70">{review.song.artist}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-400"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.review_text && (
                        <p className="text-white/80">{review.review_text}</p>
                      )}
                      <div className="flex items-center justify-between text-white/60 text-sm">
                        <span>{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-8 text-white/70">
                  <div className="animate-bounce mb-4">
                    <Star className="h-12 w-12 text-white/40 mx-auto" />
                  </div>
                  <p>No reviews written yet.</p>
                </div>
              )}
            </div>
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