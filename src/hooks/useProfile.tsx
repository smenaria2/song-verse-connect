import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSecurityValidation } from './useSecurityValidation';

export interface Profile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  username: string;
  songs_submitted: number;
  reviews_written: number;
  average_rating_given: number;
  following_count: number;
  followers_count: number;
}

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!targetUserId
  });
};

export const useUserStats = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['user-stats', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', targetUserId)
        .single();
      
      if (error) throw error;
      return data as UserStats;
    },
    enabled: !!targetUserId
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { validateAndSanitizeProfile } = useSecurityValidation();
  
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      // Validate and sanitize input
      const validatedUpdates = validateAndSanitizeProfile(updates);
      if (!validatedUpdates) {
        throw new Error('Validation failed');
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(validatedUpdates)
        .eq('id', userData.user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    }
  });
};
