import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock } from "lucide-react";
import { Song } from "@/types/app";
import { formatGenre } from "@/utils/formatters/genre";
import { formatDate } from "@/utils/formatters/date";

interface SongDetailsDisplayProps {
  song: Song;
}

const SongDetailsDisplay = ({ song }: SongDetailsDisplayProps) => {
  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md animate-in slide-in-from-top-4 duration-1000">
      <CardContent className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* YouTube Player */}
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${song.youtube_id}?rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          </div>

          {/* Song Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{song.title}</h1>
              <p className="text-xl text-white/80 mb-4">{song.artist}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-orange-600/20 text-orange-300 border-orange-600/30">
                  {formatGenre(song.genre)}
                </Badge>
                {song.duration && (
                  <div className="flex items-center text-white/60 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {song.duration}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(song.average_rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-400"
                      }`}
                    />
                  ))}
                  <span className="text-white/70 ml-2">
                    {song.average_rating.toFixed(1)} ({song.review_count} reviews)
                  </span>
                </div>
              </div>

              <p className="text-white/60">
                Submitted by <span className="text-orange-400">{song.submitter_username || 'Unknown'}</span>
              </p>
              <p className="text-white/60 text-sm">
                {formatDate(song.created_at)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongDetailsDisplay;