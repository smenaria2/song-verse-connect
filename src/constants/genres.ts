import { SongGenre } from '@/types/app';

// Updated genres with Indian music categories
export const genres = [
  "Hindustani Classical",
  "Cover/Album", 
  "Bollywood Film Music",
  "Bhangra",
  "Sufi/Qawwali",
  "Indian Folk (e.g., Rajasthani, Baul, Lavani)",
  "Indie/Indian Pop",
  "Devotional (Bhajan/Kirtan)",
  "Fusion (Classical + Western)",
  "Western"
];

// Map display genre to database enum - updated for new genres
export const genreToDbMapping: { [key: string]: SongGenre } = {
  "Hindustani Classical": "classical",
  "Cover/Album": "other",
  "Bollywood Film Music": "other",
  "Bhangra": "folk",
  "Sufi/Qawwali": "other",
  "Indian Folk (e.g., Rajasthani, Baul, Lavani)": "folk",
  "Indie/Indian Pop": "indie",
  "Devotional (Bhajan/Kirtan)": "other",
  "Fusion (Classical + Western)": "experimental",
  "Western": "other"
};

// Map display genres to database enum values for filtering
export const genreMapping: { [key: string]: SongGenre } = {
  'All': 'other', // This won't be used in filtering
  'Rock': 'rock',
  'Pop': 'pop',
  'Hip Hop': 'hip_hop',
  'Electronic': 'electronic',
  'Jazz': 'jazz',
  'Classical': 'classical',
  'Grunge': 'grunge',
  'Alternative': 'alternative',
  'Indie': 'indie',
  'Folk': 'folk',
  'Experimental': 'experimental',
  'Hindustani Classical': 'classical',
  'Cover/Album': 'other',
  'Bollywood Film Music': 'other',
  'Bhangra': 'folk',
  'Sufi/Qawwali': 'other',
  'Indian Folk': 'folk',
  'Indie/Indian Pop': 'indie',
  'Devotional': 'other',
  'Fusion': 'experimental',
  'Western': 'other'
};