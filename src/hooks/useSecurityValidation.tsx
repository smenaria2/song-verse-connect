import { useToast } from '@/components/ui/use-toast';
import { validateYouTubeUrl, validateUsername, validateWebsiteUrl, validateImageUrl, validateReviewText, sanitizeText } from '@/utils/validation';

export const useSecurityValidation = () => {
  const { toast } = useToast();

  const validateAndSanitizeProfile = (profileData: {
    username?: string;
    bio?: string;
    website?: string;
    avatar_url?: string;
  }) => {
    const errors: string[] = [];

    if (profileData.username) {
      const usernameValidation = validateUsername(profileData.username);
      if (!usernameValidation.isValid) {
        errors.push(usernameValidation.error!);
      }
    }

    if (profileData.website && !validateWebsiteUrl(profileData.website)) {
      errors.push('Website URL must be a valid HTTP or HTTPS URL');
    }

    if (profileData.avatar_url && !validateImageUrl(profileData.avatar_url)) {
      errors.push('Avatar URL must be a valid HTTP or HTTPS URL');
    }

    if (profileData.bio && profileData.bio.length > 500) {
      errors.push('Bio cannot exceed 500 characters');
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      });
      return null;
    }

    return {
      ...profileData,
      bio: profileData.bio ? sanitizeText(profileData.bio) : profileData.bio,
      username: profileData.username ? sanitizeText(profileData.username) : profileData.username,
    };
  };

  const validateSongSubmission = (songData: {
    youtube_url: string;
    title: string;
    artist: string;
  }) => {
    const errors: string[] = [];

    if (!validateYouTubeUrl(songData.youtube_url)) {
      errors.push('Please provide a valid YouTube URL');
    }

    if (!songData.title || songData.title.length === 0) {
      errors.push('Song title is required');
    } else if (songData.title.length > 200) {
      errors.push('Song title cannot exceed 200 characters');
    }

    if (!songData.artist || songData.artist.length === 0) {
      errors.push('Artist name is required');
    } else if (songData.artist.length > 100) {
      errors.push('Artist name cannot exceed 100 characters');
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      });
      return null;
    }

    return {
      ...songData,
      title: sanitizeText(songData.title),
      artist: sanitizeText(songData.artist),
    };
  };

  const validateReviewSubmission = (reviewData: {
    rating: number;
    review_text?: string;
  }) => {
    const errors: string[] = [];

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }

    if (reviewData.review_text) {
      const reviewValidation = validateReviewText(reviewData.review_text);
      if (!reviewValidation.isValid) {
        errors.push(reviewValidation.error!);
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(', '),
        variant: "destructive"
      });
      return null;
    }

    return {
      ...reviewData,
      review_text: reviewData.review_text ? sanitizeText(reviewData.review_text) : reviewData.review_text,
    };
  };

  return {
    validateAndSanitizeProfile,
    validateSongSubmission,
    validateReviewSubmission,
  };
};