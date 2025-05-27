
import { useState, useEffect, useCallback } from 'react';
import { profileService, type UserProfile } from '@/services/profileService';
import { useToast } from '@/hooks/use-toast';

export const useUserProfile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profileData = await profileService.getProfile();
      setProfile(profileData);
    } catch (err) {
      const errorMessage = 'Erro ao carregar perfil do usuário';
      setError(errorMessage);
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (profileData: UserProfile) => {
    try {
      setIsLoading(true);
      setError(null);
      await profileService.saveProfile(profileData);
      setProfile(profileData);
      
      toast({
        title: "Sucesso",
        description: "Perfil salvo com sucesso!"
      });
    } catch (err) {
      const errorMessage = 'Erro ao salvar perfil';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedProfile = await profileService.updateProfile(updates);
      setProfile(updatedProfile);
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
      
      return updatedProfile;
    } catch (err) {
      const errorMessage = 'Erro ao atualizar perfil';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await profileService.clearProfile();
      setProfile(null);
    } catch (err) {
      const errorMessage = 'Erro ao limpar perfil';
      setError(errorMessage);
      console.error('Erro ao limpar perfil:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    error,
    saveProfile,
    updateProfile,
    clearProfile,
    refetch: loadProfile
  };
};
