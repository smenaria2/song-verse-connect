
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Youtube, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Submit = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [songData, setSongData] = useState(null);
  const [genre, setGenre] = useState("");
  const [personalNote, setPersonalNote] = useState("");

  const genres = ["Rock", "Pop", "Hip Hop", "Electronic", "Jazz", "Classical", "R&B", "Country", "Indie", "Alternative"];

  const handleUrlSubmit = async () => {
    if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
      alert("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to fetch song data
    setTimeout(() => {
      setSongData({
        title: "Sample Song Title",
        artist: "Sample Artist",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        duration: "3:45"
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleFinalSubmit = () => {
    // Handle final song submission
    alert("Song submitted successfully!");
  };

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
                        <SelectContent>
                          {genres.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
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
                    disabled={!genre}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3"
                  >
                    <Music className="h-5 w-5 mr-2" />
                    Submit Song for Review
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
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Submit;
