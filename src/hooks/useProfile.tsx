
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, try to get user data from auth and create profile
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user && userData.user.id === targetUserId) {
          const googleData = userData.user.user_metadata;
          const newProfile = {
            id: targetUserId,
            username: googleData?.full_name || googleData?.name || userData.user.email?.split('@')[0] || 'User',
            avatar_url: googleData?.avatar_url || googleData?.picture,
            bio: null,
            website: null,
            location: null
          };
          
          // Create the profile
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();
            
          if (createError) throw createError;
          return createdProfile as Profile;
        }
        return null;
      }
      
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
  
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
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
