
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  genreFilter: string;
  setGenreFilter: (genre: string) => void;
}

const SearchAndFilter = ({ searchTerm, setSearchTerm, genreFilter, setGenreFilter }: SearchAndFilterProps) => {
  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-top-4 card-responsive">
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search" className="text-white/80 block text-sm font-medium mb-2">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                id="search"
                placeholder="Search for songs, artists..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="genre" className="text-white/80 block text-sm font-medium mb-2">
              Genre
            </Label>
            <Select onValueChange={setGenreFilter} value={genreFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white placeholder-white/60">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Genres</SelectItem>
                <SelectItem value="chant">Chant</SelectItem>
                <SelectItem value="gospel">Gospel</SelectItem>
                <SelectItem value="contemporary_christian">Contemporary Christian</SelectItem>
                <SelectItem value="sacred_classical">Sacred Classical</SelectItem>
                <SelectItem value="hindu_bhajan">Hindu Bhajan</SelectItem>
                <SelectItem value="qawwali">Qawwali</SelectItem>
                <SelectItem value="spiritual">Spiritual</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchAndFilter;
