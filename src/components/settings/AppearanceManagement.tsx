
import React, { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Type, Layout } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';

interface AppearanceSettings {
  mode: 'light' | 'dark' | 'system';
  palette: 'pastel_light_mechanic' | 'pastel_dark_mechanic';
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'standard';
  syncWithSystem: boolean;
}

const AppearanceManagement = () => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<AppearanceSettings>({
    mode: 'system',
    palette: 'pastel_light_mechanic',
    fontSize: 'medium',
    density: 'standard',
    syncWithSystem: true
  });

  // Carregar configurações do localStorage ao montar
  useEffect(() => {
    loadAppearanceSettings();
    setupSystemThemeListener();
  }, []);

  // Aplicar configurações sempre que mudarem
  useEffect(() => {
    applyAppearanceSettings();
    saveAppearanceSettings();
  }, [settings]);

  const loadAppearanceSettings = () => {
    try {
      const savedSettings = localStorage.getItem('pitstop_appearance_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de aparência:', error);
    }
  };

  const saveAppearanceSettings = () => {
    try {
      localStorage.setItem('pitstop_appearance_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações de aparência:', error);
    }
  };

  const setupSystemThemeListener = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (settings.syncWithSystem) {
        applyAppearanceSettings();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  };

  const applyAppearanceSettings = () => {
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
    
    // Aplicar classes CSS customizadas baseadas na paleta
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
  };

  const handleModeChange = (mode: 'light' | 'dark') => {
    setSettings(prev => ({
      ...prev,
      mode,
      syncWithSystem: false
    }));
  };

  const handleSystemSyncChange = (syncWithSystem: boolean) => {
    setSettings(prev => ({
      ...prev,
      syncWithSystem,
      mode: syncWithSystem ? 'system' : 'light'
    }));
  };

  const handlePaletteChange = (palette: string) => {
    setSettings(prev => ({
      ...prev,
      palette: palette as AppearanceSettings['palette']
    }));
  };

  const handleFontSizeChange = (fontSize: string) => {
    setSettings(prev => ({
      ...prev,
      fontSize: fontSize as AppearanceSettings['fontSize']
    }));
  };

  const handleDensityChange = (density: string) => {
    setSettings(prev => ({
      ...prev,
      density: density as AppearanceSettings['density']
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Aparência</h2>
        <p className="text-muted-foreground">
          Personalize a aparência do sistema, incluindo tema claro/escuro, cores e layout.
        </p>
      </div>

      {/* Modo Claro/Escuro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Modo do Tema
          </CardTitle>
          <CardDescription>
            Escolha entre modo claro, escuro ou sincronize com o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sync-system" className="text-sm font-medium">
              Sincronizar com o tema do sistema
            </Label>
            <Switch
              id="sync-system"
              checked={settings.syncWithSystem}
              onCheckedChange={handleSystemSyncChange}
            />
          </div>
          
          {!settings.syncWithSystem && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Selecionar tema manualmente:</Label>
              <ToggleGroup 
                type="single" 
                value={settings.mode} 
                onValueChange={(value) => value && handleModeChange(value as 'light' | 'dark')}
                className="justify-start"
              >
                <ToggleGroupItem value="light" className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Claro
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Escuro
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paleta de Cores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Paleta de Cores
          </CardTitle>
          <CardDescription>
            Escolha a paleta de cores para personalizar a aparência.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  settings.palette === 'pastel_light_mechanic' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handlePaletteChange('pastel_light_mechanic')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#A9CCE3' }}></div>
                  <span className="font-medium">Tema Mecânica (Claro)</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#F8F9FA' }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#A9CCE3' }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#EAE0D5' }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#E59866' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">Tons pastéis claros inspirados em oficina mecânica</p>
              </div>

              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  settings.palette === 'pastel_dark_mechanic' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handlePaletteChange('pastel_dark_mechanic')}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#5D6D7E' }}></div>
                  <span className="font-medium">Tema Mecânica (Escuro)</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#212529' }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#5D6D7E' }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#616A6B' }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#B08D57' }}></div>
                </div>
                <p className="text-xs text-muted-foreground">Tons pastéis escuros inspirados em oficina mecânica</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tamanho da Fonte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Tamanho da Fonte
          </CardTitle>
          <CardDescription>
            Ajuste o tamanho da fonte base da aplicação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup 
            type="single" 
            value={settings.fontSize} 
            onValueChange={(value) => value && handleFontSizeChange(value)}
            className="justify-start"
          >
            <ToggleGroupItem value="small">Pequeno</ToggleGroupItem>
            <ToggleGroupItem value="medium">Médio</ToggleGroupItem>
            <ToggleGroupItem value="large">Grande</ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>

      {/* Densidade do Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Densidade do Layout
          </CardTitle>
          <CardDescription>
            Ajuste a densidade visual e espaçamento dos elementos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup 
            type="single" 
            value={settings.density} 
            onValueChange={(value) => value && handleDensityChange(value)}
            className="justify-start"
          >
            <ToggleGroupItem value="compact">Compacto</ToggleGroupItem>
            <ToggleGroupItem value="standard">Padrão</ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceManagement;
