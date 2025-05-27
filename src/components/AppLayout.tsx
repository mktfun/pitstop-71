
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import { supabase } from '@/integrations/supabase/client';

const AppLayout = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Inicializar configurações de aparência usando o novo hook
  useAppearanceSettings();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (!isLoading && user) {
      console.log('Verificando necessidade de onboarding para usuário:', user);
      
      // Verificar se usuário precisa de onboarding
      const checkOnboardingNeeded = async () => {
        try {
          // Verificar se usuário tem associação com alguma organização
          const { data: userRoles, error } = await supabase
            .from('user_organization_roles')
            .select('organization_id')
            .eq('user_id', user.id);

          if (error) {
            console.error('Erro ao verificar associações:', error);
            return;
          }

          console.log('User roles found:', userRoles);

          // Se não tem associação, redirecionar para onboarding
          if (!userRoles || userRoles.length === 0) {
            console.log('Redirecionando para onboarding...');
            navigate('/onboarding/organizacao');
          }
        } catch (error) {
          console.error('Erro ao verificar onboarding:', error);
        }
      };

      checkOnboardingNeeded();
    }
  }, [user, isLoading, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, não renderizar nada (o roteamento cuidará disso)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />
      <main className={`flex-1 transition-all duration-300 ease-in-out ${
        isExpanded ? 'ml-64' : 'ml-16'
      }`}>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
