// Genre formatting utilities

export const formatGenre = (genre: string): string => {
  return genre.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};