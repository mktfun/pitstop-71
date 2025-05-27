
import React from 'react';
import { Palette, Sun, Moon, Type, Layout } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAppearanceSettings } from '@/hooks/useAppearanceSettings';
import type { AppearanceSettings } from '@/services/appearanceService';

const AppearanceManagement = () => {
  const { settings, updateSettings } = useAppearanceSettings();

  if (!settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const handleModeChange = (mode: 'light' | 'dark') => {
    updateSettings({
      mode,
      syncWithSystem: false
    });
  };

  const handleSystemSyncChange = (syncWithSystem: boolean) => {
    updateSettings({
      syncWithSystem,
      mode: syncWithSystem ? 'system' : 'light'
    });
  };

  const handlePaletteChange = (palette: string) => {
    updateSettings({
      palette: palette as AppearanceSettings['palette']
    });
  };

  const handleFontSizeChange = (fontSize: string) => {
    updateSettings({
      fontSize: fontSize as AppearanceSettings['fontSize']
    });
  };

  const handleDensityChange = (density: string) => {
    updateSettings({
      density: density as AppearanceSettings['density']
    });
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
