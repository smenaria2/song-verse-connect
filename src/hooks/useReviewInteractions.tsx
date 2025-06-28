import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface ReviewComment {
  id: string;
  review_id: string;
  commenter_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
  is_flagged: boolean;
  is_hidden: boolean;
  commenter_username: string;
  commenter_avatar?: string;
}

export interface ReviewUpvote {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

// Hook to get comments for a review
export const useReviewComments = (reviewId: string) => {
  return useQuery({
    queryKey: ['review-comments', reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_comments')
        .select(`
          *,
          profiles!review_comments_commenter_id_fkey(username, avatar_url)
        `)
        .eq('review_id', reviewId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(comment => ({
        id: comment.id,
        review_id: comment.review_id,
        commenter_id: comment.commenter_id,
        comment_text: comment.comment_text,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        is_flagged: comment.is_flagged,
        is_hidden: comment.is_hidden,
        commenter_username: (comment.profiles as any)?.username || 'Anonymous',
        commenter_avatar: (comment.profiles as any)?.avatar_url
      })) as ReviewComment[];
    },
    enabled: !!reviewId
  });
};

// Hook to get upvotes for a review
export const useReviewUpvotes = (reviewId: string) => {
  return useQuery({
    queryKey: ['review-upvotes', reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_upvotes')
        .select('*')
        .eq('review_id', reviewId);

      if (error) throw error;
      return data as ReviewUpvote[];
    },
    enabled: !!reviewId
  });
};

// Hook to check if user has upvoted a review
export const useUserUpvoteStatus = (reviewId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-upvote', reviewId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('review_upvotes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!reviewId && !!user
  });
};

// Hook to add a comment to a review
export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ reviewId, commentText }: { reviewId: string; commentText: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Validate comment length
      if (!commentText.trim()) {
        throw new Error('Comment cannot be empty');
      }
      if (commentText.length > 5000) {
        throw new Error('Comment cannot exceed 5000 characters');
      }

      // Basic spam prevention - check for recent comments
      const { data: recentComments } = await supabase
        .from('review_comments')
        .select('created_at')
        .eq('commenter_id', user.id)
        .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
        .limit(5);

      if (recentComments && recentComments.length >= 3) {
        throw new Error('Please wait before posting another comment');
      }

      const { data, error } = await supabase
        .from('review_comments')
        .insert({
          review_id: reviewId,
          commenter_id: user.id,
          comment_text: commentText.trim()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review-comments', variables.reviewId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Success!",
        description: "Comment added successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive"
      });
    }
  });
};

// Hook to toggle upvote on a review
export const useToggleUpvote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Check if user has already upvoted
      const { data: existingUpvote } = await supabase
        .from('review_upvotes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingUpvote) {
        // Remove upvote
        const { error } = await supabase
          .from('review_upvotes')
          .delete()
          .eq('id', existingUpvote.id);
        
        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add upvote
        const { data, error } = await supabase
          .from('review_upvotes')
          .insert({
            review_id: reviewId,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;
        return { action: 'added', data };
      }
    },
    onSuccess: (result, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['review-upvotes', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['user-upvote', reviewId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
      toast({
        title: result.action === 'added' ? "Upvoted!" : "Upvote removed",
        description: result.action === 'added' 
          ? "Thanks for finding this review helpful!" 
          : "Upvote removed successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update upvote",
        variant: "destructive"
      });
    }
  });
};

// Hook to report a comment
export const useReportComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ commentId, reason }: { commentId: string; reason: string }) => {
      if (!user) throw new Error('User not authenticated');

      if (!reason.trim()) {
        throw new Error('Please provide a reason for reporting');
      }

      const { data, error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          reporter_id: user.id,
          reason: reason.trim()
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('You have already reported this comment');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. We'll review this report."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive"
      });
    }
  });
};

// Hook to delete a comment (user's own)
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('review_comments')
        .delete()
        .eq('id', commentId)
        .eq('commenter_id', user.id); // Ensure user can only delete their own comments

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-comments'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Success!",
        description: "Comment deleted successfully!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive"
      });
    }
  });
};