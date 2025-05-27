
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Organization {
  id: string;
  name: string;
  cnpj?: string;
  phone?: string;
  logo_url?: string;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
}

export const useActiveOrganization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveOrganization = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Buscar a primeira organização do usuário
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_organization_roles')
          .select(`
            organization_id,
            organizations (
              id,
              name,
              cnpj,
              phone,
              logo_url,
              owner_user_id,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (rolesError) {
          console.error('Erro ao buscar organização:', rolesError);
          setError('Erro ao carregar organização');
          return;
        }

        if (userRoles?.organizations) {
          setOrganization(userRoles.organizations as Organization);
        }
      } catch (error) {
        console.error('Erro ao buscar organização ativa:', error);
        setError('Erro ao carregar organização');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveOrganization();
  }, [user]);

  return { organization, isLoading, error };
};
