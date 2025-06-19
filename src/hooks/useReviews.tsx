import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
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
}

export const useReviews = (songId: string) => {
  return useQuery({
    queryKey: ['reviews', songId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_reviewer_id_fkey(username, avatar_url)
        `)
        .eq('song_id', songId)
        .order('created_at', { ascending: false });

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
        song_id: review.song_id
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
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.song_id] });
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
