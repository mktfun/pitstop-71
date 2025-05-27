
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useActiveOrganization = () => {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getActiveOrganization = async () => {
      if (!user) {
        setOrganizationId(null);
        setIsLoading(false);
        return;
      }

      try {
        // First try to get from user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('active_organization_id')
          .eq('id', user.id)
          .single();

        if (profile?.active_organization_id) {
          setOrganizationId(profile.active_organization_id);
        } else {
          // Fallback: get the first organization the user belongs to
          const { data: userRole } = await supabase
            .from('user_organization_roles')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .single();

          if (userRole?.organization_id) {
            setOrganizationId(userRole.organization_id);
          }
        }
      } catch (error) {
        console.error('Error getting active organization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getActiveOrganization();
  }, [user]);

  return { organizationId, isLoading };
};
