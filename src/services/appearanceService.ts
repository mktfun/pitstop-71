
interface AppearanceSettings {
  mode: 'light' | 'dark' | 'system';
  palette: 'pastel_light_mechanic' | 'pastel_dark_mechanic';
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'standard';
  syncWithSystem: boolean;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  mode: 'system',
  palette: 'pastel_light_mechanic',
  fontSize: 'medium',
  density: 'standard',
  syncWithSystem: true
};

class AppearanceService {
  private readonly STORAGE_KEY = 'pitstop_appearance_settings';

  async getSettings(): Promise<AppearanceSettings> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Erro ao carregar configurações de aparência:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppearanceSettings): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações de aparência:', error);
      throw error;
    }
  }

  async updateSettings(updates: Partial<AppearanceSettings>): Promise<AppearanceSettings> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...updates };
    
    await this.saveSettings(updatedSettings);
    return updatedSettings;
  }

  async clearSettings(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar configurações de aparência:', error);
      throw error;
    }
  }

  applySettings(settings: AppearanceSettings): void {
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
    
    // Aplicar variáveis CSS customizadas
    if (settings.palette === 'pastel_light_mechanic') {
      root.style.setProperty('--custom-bg', '#F8F9FA');
      root.style.setProperty('--custom-primary', '#A9CCE3');
      root.style.setProperty('--custom-secondary', '#EAE0D5');
      root.style.setProperty('--custom-accent', '#E59866');
      root.style.setProperty('--custom-text', '#343A40');
    } else if (settings.palette === 'pastel_dark_mechanic') {
      root.style.setProperty('--custom-bg', '#212529');
      root.style.setProperty('--custom-primary', '#5D6D7E');
      root.style.setProperty('--custom-secondary', '#616A6B');
      root.style.setProperty('--custom-accent', '#B08D57');
      root.style.setProperty('--custom-text', '#E9ECEF');
    }
  }
}

export const appearanceService = new AppearanceService();
export type { AppearanceSettings };
export { DEFAULT_SETTINGS as DEFAULT_APPEARANCE_SETTINGS };
