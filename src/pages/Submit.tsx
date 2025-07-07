import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Youtube, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubmitSong } from "@/hooks/useSongs";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { genres, genreToDbMapping } from "@/constants/genres";
import { extractYouTubeId, validateYouTubeUrl } from "@/utils/youtube/helpers";
import { fetchYouTubeVideoData } from "@/utils/youtube/api";
import { SongData, SongGenre } from "@/types/app";

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

  const handleUrlSubmit = async () => {
    if (!validateYouTubeUrl(youtubeUrl)) {
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
        genre: dbGenre as SongGenre,
        thumbnail_url: songData.thumbnail,
        duration: songData.duration,
        personal_note: personalNote.trim() || undefined
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
        <Card className="bg-white/10 border-white/20 backdrop-blur-md p-8 animate-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center">
            <Music className="h-16 w-16 text-orange-400 mx-auto mb-4" />
            <p className="text-white text-center mb-4">Please sign in to submit songs</p>
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-1000">
            <div className="mb-4">
              <div className="relative inline-block">
                <Music className="h-16 w-16 text-orange-400 mx-auto" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Submit a Song</h2>
            <p className="text-white/80 text-lg">
              Share your favorite YouTube music with the community
            </p>
          </div>

          <Card className="bg-white/10 border-white/20 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-1000 delay-200">
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
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Fetch"
                    )}
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

              {/* Step 2: Song Preview with YouTube Player */}
              {songData && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center text-green-400 mb-4">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Song information retrieved successfully!
                  </div>
                  
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* YouTube Video Player */}
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl)}?rel=0`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="rounded-lg"
                          ></iframe>
                        </div>
                        
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
                        Personal Note <span className="text-white/60">(Optional)</span>
                      </Label>
                      <Textarea
                        id="personal-note"
                        placeholder="Why do you love this song? Share your thoughts with the community..."
                        value={personalNote}
                        onChange={(e) => setPersonalNote(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 min-h-[100px]"
                        maxLength={1000}
                      />
                      <p className="text-white/50 text-xs">
                        {personalNote.length}/1000 characters
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={!genre || submitSongMutation.isPending}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-3"
                  >
                    {submitSongMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Music className="h-5 w-5 mr-2" />
                        Submit Song for Review
                      </>
                    )}
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
                        <li>Share your personal connection to the song in the note</li>
                        <li>Indian music of all genres is especially welcome!</li>
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