import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Youtube, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubmitSong } from "@/hooks/useSongs";
import { useToast } from "@/components/ui/use-toast";

interface SongData {
  title: string;
  artist: string;
  thumbnail: string;
  duration: string;
}

interface YouTubeVideoResponse {
  items: Array<{
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        maxres?: { url: string };
        high?: { url: string };
        medium?: { url: string };
        default: { url: string };
      };
    };
    contentDetails: {
      duration: string;
    };
  }>;
}

const Submit = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [songData, setSongData] = useState<SongData | null>(null);
  const [genre, setGenre] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  
  const { user } = useAuth();
  const submitSongMutation = useSubmitSong();
  const { toast } = useToast();
  const navigate = useNavigate();

  const genres = [
    "Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", 
    "R&B", "Country", "Indie", "Alternative", "Grunge", "Metal", 
    "Folk", "Blues", "Reggae", "Punk", "Funk", "Soul", "Disco", 
    "House", "Techno", "Dubstep", "Ambient", "Experimental", 
    "Bollywood", "Other"
  ];

  // Map display genre to database enum
  const genreToDbMapping: { [key: string]: string } = {
    "Rock": "rock",
    "Pop": "pop",
    "Hip Hop": "hip_hop",
    "Electronic": "electronic",
    "Jazz": "jazz",
    "Classical": "classical",
    "R&B": "r_b",
    "Country": "country",
    "Indie": "indie",
    "Alternative": "alternative",
    "Grunge": "grunge",
    "Metal": "metal",
    "Folk": "folk",
    "Blues": "blues",
    "Reggae": "reggae",
    "Punk": "punk",
    "Funk": "funk",
    "Soul": "soul",
    "Disco": "disco",
    "House": "house",
    "Techno": "techno",
    "Dubstep": "dubstep",
    "Ambient": "ambient",
    "Experimental": "experimental",
    "Bollywood": "bollywood",
    "Other": "other"
  };

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const formatDuration = (duration: string): string => {
    // Convert ISO 8601 duration (PT4M13S) to readable format (4:13)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "Unknown";
    
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchYouTubeVideoData = async (videoId: string): Promise<SongData> => {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY_HERE') {
      throw new Error('YouTube API key not configured. Please add your API key to the .env file.');
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('YouTube API quota exceeded or invalid API key. Please check your API key and quota.');
      }
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }
    
    const data: YouTubeVideoResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found or is private/unavailable.');
    }
    
    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;
    
    // Get the best available thumbnail
    const thumbnail = snippet.thumbnails.maxres?.url || 
                     snippet.thumbnails.high?.url || 
                     snippet.thumbnails.medium?.url || 
                     snippet.thumbnails.default.url;
    
    // Extract artist from channel title or video title
    // This is a simple heuristic - you might want to improve this logic
    let artist = snippet.channelTitle;
    let title = snippet.title;
    
    // Try to extract artist from title if it contains " - "
    const titleParts = title.split(' - ');
    if (titleParts.length >= 2) {
      artist = titleParts[0].trim();
      title = titleParts.slice(1).join(' - ').trim();
    }
    
    return {
      title: title,
      artist: artist,
      thumbnail: thumbnail,
      duration: formatDuration(contentDetails.duration)
    };
  };

  const handleUrlSubmit = async () => {
    if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive"
      });
      return;
    }

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Could not extract video ID from URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const songData = await fetchYouTubeVideoData(videoId);
      setSongData(songData);
      
      toast({
        title: "Success",
        description: "Song information retrieved successfully!"
      });
    } catch (error: any) {
      console.error('Error fetching YouTube data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch song information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit songs",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!songData || !genre) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) return;

    const dbGenre = genreToDbMapping[genre];
    if (!dbGenre) {
      toast({
        title: "Invalid Genre",
        description: "Please select a valid genre",
        variant: "destructive"
      });
      return;
    }

    try {
      await submitSongMutation.mutateAsync({
        youtube_url: youtubeUrl,
        youtube_id: videoId,
        title: songData.title,
        artist: songData.artist,
        genre: dbGenre as any,
        thumbnail_url: songData.thumbnail,
        duration: songData.duration
      });

      // Reset form
      setYoutubeUrl("");
      setSongData(null);
      setGenre("");
      setPersonalNote("");
      
      navigate('/');
    } catch (error) {
      console.error('Error submitting song:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 border-white/20 backdrop-blur-md p-8">
          <p className="text-white text-center mb-4">Please sign in to submit songs</p>
          <Link to="/auth">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Sign In
            </Button>
          </Link>
        </Card>
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
              <Link to="/" className="text-white hover:text-purple-400 transition-colors">Browse</Link>
              <Link to="/submit" className="text-purple-400">Submit Song</Link>
              <Link to="/profile" className="text-white hover:text-purple-400 transition-colors">Profile</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">Submit a Song</h2>
            <p className="text-white/80 text-lg">
              Share your favorite YouTube music with the community
            </p>
          </div>

          <Card className="bg-white/10 border-white/20 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Youtube className="h-6 w-6 mr-2 text-red-500" />
                YouTube Song Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: YouTube URL */}
              <div className="space-y-2">
                <Label htmlFor="youtube-url" className="text-white">
                  YouTube URL <span className="text-red-400">*</span>
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/60"
                  />
                  <Button
                    onClick={handleUrlSubmit}
                    disabled={!youtubeUrl || isLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isLoading ? "Loading..." : "Fetch"}
                  </Button>
                </div>
                <p className="text-white/60 text-sm">
                  Paste a YouTube URL to automatically fetch song information
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <Card className="bg-blue-500/20 border-blue-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center text-blue-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent mr-2"></div>
                      Fetching song information from YouTube...
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Song Preview */}
              {songData && (
                <div className="space-y-4">
                  <div className="flex items-center text-green-400 mb-4">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Song information retrieved successfully!
                  </div>
                  
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={songData.thumbnail}
                          alt="Song thumbnail"
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{songData.title}</h3>
                          <p className="text-white/70">{songData.artist}</p>
                          <p className="text-white/60 text-sm">Duration: {songData.duration}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="genre" className="text-white">
                        Genre <span className="text-red-400">*</span>
                      </Label>
                      <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select a genre" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          {genres.map((g) => (
                            <SelectItem key={g} value={g} className="text-white hover:bg-gray-800">
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="personal-note" className="text-white">
                        Personal Note (Optional)
                      </Label>
                      <Textarea
                        id="personal-note"
                        placeholder="Why do you love this song? Share your thoughts with the community..."
                        value={personalNote}
                        onChange={(e) => setPersonalNote(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 min-h-[100px]"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={!genre || submitSongMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3"
                  >
                    <Music className="h-5 w-5 mr-2" />
                    {submitSongMutation.isPending ? "Submitting..." : "Submit Song for Review"}
                  </Button>
                </div>
              )}

              {/* Guidelines */}
              <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-yellow-200 text-sm">
                      <p className="font-semibold mb-2">Submission Guidelines:</p>
                      <ul className="list-disc list-inside space-y-1 text-yellow-200/80">
                        <li>Only submit official music videos or high-quality uploads</li>
                        <li>Check if the song has already been submitted</li>
                        <li>Ensure the content follows community guidelines</li>
                        <li>Add accurate genre information to help others discover</li>
                        <li>Bollywood and Indian music is welcome!</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Key Notice */}
              {(!import.meta.env.VITE_YOUTUBE_API_KEY || import.meta.env.VITE_YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') && (
                <Card className="bg-red-500/10 border-red-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="text-red-200 text-sm">
                        <p className="font-semibold mb-2">YouTube API Key Required:</p>
                        <p>To fetch video details, you need to add your YouTube API key to the .env file. Replace 'YOUR_YOUTUBE_API_KEY_HERE' with your actual API key.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Submit;