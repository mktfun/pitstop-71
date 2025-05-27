
import { useAppearanceSettings } from './useAppearanceSettings';

// Mantém compatibilidade com o hook antigo
export const useAppearance = () => {
  const { settings, updateSettings, applySettings } = useAppearanceSettings();
  
  const loadSettings = async () => {
    // Implementação vazia para compatibilidade
    return Promise.resolve();
  };

  return {
    settings: settings || {
      mode: 'system' as const,
      palette: 'pastel_light_mechanic' as const,
      fontSize: 'medium' as const,
      density: 'standard' as const,
      syncWithSystem: true
    },
    loadSettings,
    applySettings
  };
};
