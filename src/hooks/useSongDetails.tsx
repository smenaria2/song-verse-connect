import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Song } from '@/types/app';

export const useSongDetails = (songId?: string) => {
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (songId) {
      fetchSongData();
    }
  }, [songId]);

  const fetchSongData = async () => {
    try {
      const { data, error } = await supabase
        .from('songs_with_stats')
        .select('*')
        .eq('id', songId)
        .single();

      if (error) throw error;
      setSong(data);
    } catch (error) {
      console.error('Error fetching song:', error);
      toast({
        title: "Error",
        description: "Failed to load song data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return { song, loading, refetch: fetchSongData };
};