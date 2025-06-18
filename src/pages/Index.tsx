import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useSongs } from "@/hooks/useSongs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Star, Upload, User, UserCircle, LogOut, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface Song {
  id: string;
  youtube_url: string;
  youtube_id: string;
  title: string;
  artist: string;
  genre: string;
  release_year?: number;
  thumbnail_url?: string;
  duration?: string;
  submitter_id: string;
  created_at: string;
  updated_at: string;
  submitter_username?: string;
  submitter_avatar?: string;
  average_rating: number;
  review_count: number;
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const { data: songs, isLoading } = useSongs(searchTerm, selectedGenre);
  const { user, signOut } = useAuth();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
  };

  const formatGenre = (genre: string) => {
    return genre.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Song Monk</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/submit" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                <Upload className="h-4 w-4" />
                <span>Submit Song</span>
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
                    <UserCircle className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Discover Amazing
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Music</span>
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Share your favorite songs, discover new music, and connect with fellow music lovers in our vibrant community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/submit">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  <Upload className="h-5 w-5 mr-2" />
                  Submit Your Song
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                <Music className="h-5 w-5 mr-2" />
                Browse Music
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="bg-black/20 backdrop-blur-md py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <Label htmlFor="search" className="text-white/80 block mb-2 text-sm font-medium">
                Search
              </Label>
              <Input
                type="text"
                id="search"
                placeholder="Search for songs or artists..."
                className="bg-black/40 border-white/20 text-white focus-visible:ring-purple-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            {/* Genre Filter */}
            <div className="md:col-span-1">
              <Label htmlFor="genre" className="text-white/80 block mb-2 text-sm font-medium">
                Genre
              </Label>
              <Select onValueChange={handleGenreChange}>
                <SelectTrigger className="bg-black/40 border-white/20 text-white focus-visible:ring-purple-500">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent className="bg-black/60 backdrop-blur-md border-white/20 text-white">
                  <SelectItem value="All">All Genres</SelectItem>
                  <SelectItem value="Rock">Rock</SelectItem>
                  <SelectItem value="Pop">Pop</SelectItem>
                  <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                  <SelectItem value="Electronic">Electronic</SelectItem>
                  <SelectItem value="Jazz">Jazz</SelectItem>
                  <SelectItem value="Classical">Classical</SelectItem>
                  <SelectItem value="Grunge">Grunge</SelectItem>
                  <SelectItem value="Alternative">Alternative</SelectItem>
                  <SelectItem value="Indie">Indie</SelectItem>
                  <SelectItem value="Folk">Folk</SelectItem>
                  <SelectItem value="Experimental">Experimental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Empty div for spacing in the grid */}
            <div className="md:col-span-1"></div>
          </div>
        </div>
      </section>

      {/* Songs Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-purple-400 mx-auto animate-spin" />
              <p className="text-white/70 mt-4">Loading songs...</p>
            </div>
          ) : songs && songs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {songs.map((song, index) => (
                <SongCard key={song.id} song={song} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="animate-bounce mb-4">
                <Music className="h-16 w-16 text-white/40 mx-auto" />
              </div>
              <p className="text-white/70 text-lg">No songs found. Be the first to submit a song!</p>
              <Link to="/submit" className="inline-block mt-4">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Song
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

interface SongCardProps {
  song: Song;
  index: number;
}

const SongCard = ({ song, index }: SongCardProps) => {
  const { playPause } = useAudioPlayer();

  return (
    <Card
      className="bg-black/40 border-white/20 backdrop-blur-md hover:bg-black/50 transition-all duration-300 animate-in slide-in-from-bottom-4"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => playPause({
        id: song.id,
        youtubeId: song.youtube_id,
        title: song.title,
        artist: song.artist
      })}
    >
      <CardContent className="p-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white hover:text-purple-400 transition-colors">{song.title}</h3>
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
      </CardContent>
    </Card>
  );
};

export default Index;
