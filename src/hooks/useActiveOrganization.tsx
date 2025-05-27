
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Organization {
  id: string;
  name: string;
  cnpj?: string;
  phone?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  owner_user_id: string;
}

export const useActiveOrganization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getActiveOrganization = async () => {
      if (!user) {
        setOrganization(null);
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

        let organizationId = profile?.active_organization_id;

        if (!organizationId) {
          // Fallback: get the first organization the user belongs to
          const { data: userRole } = await supabase
            .from('user_organization_roles')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .single();

          organizationId = userRole?.organization_id;
        }

        if (organizationId) {
          // Fetch the complete organization data
          const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', organizationId)
            .single();

          if (orgData) {
            setOrganization(orgData);
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

  return { organization, isLoading };
};
