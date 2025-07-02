import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .rpc('get_current_user_role');

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }

      return data || 'user';
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useIsAdmin = () => {
  const { data: role } = useUserRole();
  return role === 'admin';
};