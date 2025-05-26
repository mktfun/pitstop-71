
import React from 'react';
import { Settings as SettingsIcon, User, Sliders } from 'react-feather';

const Settings = () => {
  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Left Column - Navigation Menu */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border/40 rounded-xl shadow-lg shadow-black/5 p-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Categorias
            </h3>
            <nav className="space-y-2">
              {/* Profile Menu Item */}
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer border border-transparent hover:border-border/50">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">Perfil</span>
              </div>
              
              {/* Appearance Menu Item */}
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer border border-transparent hover:border-border/50">
                <Sliders className="h-4 w-4 text-primary" />
                <span className="font-medium">Aparência</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Right Column - Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border/40 rounded-xl shadow-lg shadow-black/5 p-6 h-full">
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-accent/50 rounded-full p-4 mb-4">
                <SettingsIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Configurações
              </h2>
              <p className="text-muted-foreground max-w-md">
                Selecione uma categoria no menu à esquerda para ver as opções de configuração disponíveis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
