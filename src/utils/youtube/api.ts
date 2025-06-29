import { SongData, YouTubeVideoResponse } from '@/types/app';
import { formatDuration } from '@/utils/formatters/time';

export const fetchYouTubeVideoData = async (videoId: string): Promise<SongData> => {
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