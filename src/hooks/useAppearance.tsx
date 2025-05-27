
import { useEffect, useState } from 'react';

interface AppearanceSettings {
  mode: 'light' | 'dark' | 'system';
  palette: 'pastel_light_mechanic' | 'pastel_dark_mechanic';
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'standard';
  syncWithSystem: boolean;
}

export const useAppearance = () => {
  const [settings, setSettings] = useState<AppearanceSettings>({
    mode: 'system',
    palette: 'pastel_light_mechanic',
    fontSize: 'medium',
    density: 'standard',
    syncWithSystem: true
  });

  useEffect(() => {
    // Carregar configurações ao inicializar
    loadSettings();
    
    // Configurar listener para mudanças no tema do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      loadSettings();
      applySettings();
    };
    
    mediaQuery.addEventListener('change', handleSystemChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  useEffect(() => {
    applySettings();
  }, [settings]);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('pitstop_appearance_settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de aparência:', error);
    }
  };

  const applySettings = () => {
    const root = document.documentElement;
    
    // Aplicar modo claro/escuro
    let effectiveMode = settings.mode;
    if (settings.syncWithSystem) {
      effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (effectiveMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Aplicar paleta de cores
    root.setAttribute('data-palette', settings.palette);
    
    // Aplicar tamanho da fonte
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.fontSize = fontSizeMap[settings.fontSize];
    
    // Aplicar densidade do layout
    root.setAttribute('data-density', settings.density);
  };

  return {
    settings,
    loadSettings,
    applySettings
  };
};
