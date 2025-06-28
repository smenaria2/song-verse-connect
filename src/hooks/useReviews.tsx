import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecurityValidation } from './useSecurityValidation';

export interface Review {
  id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  reviewer_id: string;
  reviewer_username: string;
  reviewer_avatar?: string;
  song_id: string;
  song_title?: string;
  song_artist?: string;
}

export const useReviews = (songId?: string) => {
  return useQuery({
    queryKey: ['reviews', songId],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_reviewer_id_fkey(username, avatar_url),
          songs!reviews_song_id_fkey(title, artist)
        `);

      if (songId) {
        query = query.eq('song_id', songId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      return (data || []).map(review => ({
        id: review.id,
        rating: review.rating,
        review_text: review.review_text,
        created_at: review.created_at,
        reviewer_id: review.reviewer_id,
        reviewer_username: (review.profiles as any)?.username || 'Anonymous',
        reviewer_avatar: (review.profiles as any)?.avatar_url,
        song_id: review.song_id,
        song_title: (review.songs as any)?.title,
        song_artist: (review.songs as any)?.artist
      })) as Review[];
    }
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { validateReviewSubmission } = useSecurityValidation();
  
  return useMutation({
    mutationFn: async (reviewData: {
      song_id: string;
      rating: number;
      review_text?: string;
    }) => {
      // Validate and sanitize input
      const validatedData = validateReviewSubmission({
        rating: reviewData.rating,
        review_text: reviewData.review_text,
      });
      
      if (!validatedData) {
        throw new Error('Validation failed');
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Check if user has already reviewed this song
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id, reviewer_id')
        .eq('song_id', reviewData.song_id)
        .eq('reviewer_id', userData.user.id)
        .single();

      if (existingReview) {
        // Verify the user owns this review (backend validation)
        if (existingReview.reviewer_id !== userData.user.id) {
          throw new Error('Unauthorized: You can only edit your own reviews');
        }

        // Update existing review
        const { data, error } = await supabase
          .from('reviews')
          .update({
            rating: validatedData.rating,
            review_text: validatedData.review_text,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id)
          .eq('reviewer_id', userData.user.id) // Additional security check
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new review
        const finalReviewData = {
          song_id: reviewData.song_id,
          rating: validatedData.rating,
          review_text: validatedData.review_text,
          reviewer_id: userData.user.id
        };

        const { data, error } = await supabase
          .from('reviews')
          .insert(finalReviewData)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.song_id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast({
        title: "Success!",
        description: "Review submitted successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      // Delete the review (RLS policies ensure user can only delete their own reviews)
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('reviewer_id', userData.user.id); // Additional security check
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      toast({
        title: "Success!",
        description: "Review deleted successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive"
      });
    }
  });
};