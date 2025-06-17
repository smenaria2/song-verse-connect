
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music, Star, Edit, Calendar, MapPin, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

// Mock user data
const mockUser = {
  id: 1,
  username: "musiclover123",
  email: "john@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  bio: "Passionate music enthusiast who loves discovering new artists and sharing great music with the community.",
  location: "New York, USA",
  website: "https://mymusicblog.com",
  joinDate: "January 2024",
  stats: {
    songsSubmitted: 23,
    reviewsWritten: 89,
    averageRating: 4.2,
    followers: 156,
    following: 92
  }
};

const mockSubmittedSongs = [
  {
    id: 1,
    title: "Bohemian Rhapsody",
    artist: "Queen",
    genre: "Rock",
    averageRating: 4.8,
    reviewCount: 142,
    submissionDate: "2024-06-15"
  },
  {
    id: 2,
    title: "Hotel California",
    artist: "Eagles",
    genre: "Rock",
    averageRating: 4.6,
    reviewCount: 98,
    submissionDate: "2024-06-10"
  }
];

const mockReviews = [
  {
    id: 1,
    songTitle: "Billie Jean",
    artist: "Michael Jackson",
    rating: 5,
    review: "Absolute masterpiece! The bassline is iconic and MJ's vocals are perfection. This song never gets old.",
    date: "2024-06-16",
    likes: 23
  },
  {
    id: 2,
    songTitle: "Smells Like Teen Spirit",
    artist: "Nirvana",
    rating: 4,
    review: "Great grunge anthem that defined a generation. Raw energy and powerful lyrics.",
    date: "2024-06-14",
    likes: 15
  }
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

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
              <Link to="/" className="text-white hover:text-purple-400 transition-colors">Browse</Link>
              <Link to="/submit" className="text-white hover:text-purple-400 transition-colors">Submit Song</Link>
              <Link to="/profile" className="text-purple-400">Profile</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.username} />
                  <AvatarFallback className="text-2xl">{mockUser.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white">{mockUser.username}</h2>
                    <p className="text-white/70 text-lg">{mockUser.email}</p>
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
                
                <p className="text-white/80">{mockUser.bio}</p>
                
                <div className="flex flex-wrap gap-4 text-white/70">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {mockUser.location}
                  </div>
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    <a href={mockUser.website} className="text-purple-400 hover:underline">
                      {mockUser.website}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {mockUser.joinDate}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{mockUser.stats.songsSubmitted}</div>
                <div className="text-white/70 text-sm">Songs Submitted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{mockUser.stats.reviewsWritten}</div>
                <div className="text-white/70 text-sm">Reviews Written</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{mockUser.stats.averageRating}</div>
                <div className="text-white/70 text-sm">Avg Rating Given</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{mockUser.stats.followers}</div>
                <div className="text-white/70 text-sm">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{mockUser.stats.following}</div>
                <div className="text-white/70 text-sm">Following</div>
              </div>
            </div>
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
              {mockSubmittedSongs.map((song) => (
                <Card key={song.id} className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">{song.title}</h3>
                        <p className="text-white/70">{song.artist}</p>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                            {song.genre}
                          </Badge>
                          <div className="flex items-center text-white/60">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            {song.averageRating} ({song.reviewCount} reviews)
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-white/60">
                        <p className="text-sm">Submitted</p>
                        <p className="text-sm">{song.submissionDate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div className="grid gap-4">
              {mockReviews.map((review) => (
                <Card key={review.id} className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{review.songTitle}</h3>
                          <p className="text-white/70">{review.artist}</p>
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
                      <p className="text-white/80">{review.review}</p>
                      <div className="flex items-center justify-between text-white/60 text-sm">
                        <span>{review.date}</span>
                        <span>{review.likes} likes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            <div className="text-center py-8">
              <p className="text-white/70">Following feature coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
