
// Input validation utilities for security
export const validateYouTubeUrl = (url: string): boolean => {
  // More flexible YouTube URL validation that matches existing data
  const youtubeRegex = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
  return youtubeRegex.test(url);
};

export const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

export const sanitizeText = (text: string): string => {
  // Basic HTML sanitization
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};

export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  if (username.length > 50) {
    return { isValid: false, error: 'Username cannot exceed 50 characters' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  return { isValid: true };
};

export const validateWebsiteUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateReviewText = (text: string): { isValid: boolean; error?: string } => {
  if (text && text.length > 1000) {
    return { isValid: false, error: 'Review cannot exceed 1000 characters' };
  }
  return { isValid: true };
};
