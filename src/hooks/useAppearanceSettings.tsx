
import { useState, useEffect, useCallback } from 'react';
import { appearanceService, type AppearanceSettings } from '@/services/appearanceService';

export const useAppearanceSettings = () => {
  const [settings, setSettings] = useState<AppearanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const settingsData = await appearanceService.getSettings();
      setSettings(settingsData);
      appearanceService.applySettings(settingsData);
    } catch (err) {
      const errorMessage = 'Erro ao carregar configurações de aparência';
      setError(errorMessage);
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppearanceSettings>) => {
    if (!settings) return;

    try {
      setError(null);
      const updatedSettings = await appearanceService.updateSettings(updates);
      setSettings(updatedSettings);
      appearanceService.applySettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      const errorMessage = 'Erro ao atualizar configurações de aparência';
      setError(errorMessage);
      console.error('Erro ao atualizar configurações:', err);
      throw err;
    }
  }, [settings]);

  const applySettings = useCallback((settingsToApply: AppearanceSettings) => {
    appearanceService.applySettings(settingsToApply);
  }, []);

  const clearSettings = useCallback(async () => {
    try {
      setError(null);
      await appearanceService.clearSettings();
      const defaultSettings = await appearanceService.getSettings();
      setSettings(defaultSettings);
      appearanceService.applySettings(defaultSettings);
    } catch (err) {
      const errorMessage = 'Erro ao limpar configurações';
      setError(errorMessage);
      console.error('Erro ao limpar configurações:', err);
      throw err;
    }
  }, []);

  // Configurar listener para mudanças no tema do sistema
  useEffect(() => {
    if (!settings) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (settings.syncWithSystem) {
        appearanceService.applySettings(settings);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [settings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    applySettings,
    clearSettings,
    refetch: loadSettings
  };
};
