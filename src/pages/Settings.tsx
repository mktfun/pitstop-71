
import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Sliders, MapPin } from 'react-feather';
import { Wrench } from 'lucide-react';
import UnitsManagement from '../components/settings/UnitsManagement';
import ServicesManagement from '../components/settings/ServicesManagement';

type SettingsSection = 'profile' | 'appearance' | 'units' | 'services';

const Settings = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-accent/50 rounded-full p-4 mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Perfil do Usuário
            </h2>
            <p className="text-muted-foreground max-w-md">
              Configure suas informações pessoais e preferências de conta.
            </p>
          </div>
        );
      case 'appearance':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-accent/50 rounded-full p-4 mb-4">
              <Sliders className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Aparência
            </h2>
            <p className="text-muted-foreground max-w-md">
              Personalize a aparência do sistema, incluindo tema claro/escuro.
            </p>
          </div>
        );
      case 'units':
        return <UnitsManagement />;
      case 'services':
        return <ServicesManagement />;
      default:
        return null;
    }
  };

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
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer border ${
                  activeSection === 'profile' 
                    ? 'bg-primary text-primary-foreground border-primary/50' 
                    : 'border-transparent hover:bg-accent hover:text-accent-foreground hover:border-border/50'
                }`}
                onClick={() => setActiveSection('profile')}
              >
                <User className="h-4 w-4" />
                <span className="font-medium">Perfil</span>
              </div>
              
              {/* Appearance Menu Item */}
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer border ${
                  activeSection === 'appearance' 
                    ? 'bg-primary text-primary-foreground border-primary/50' 
                    : 'border-transparent hover:bg-accent hover:text-accent-foreground hover:border-border/50'
                }`}
                onClick={() => setActiveSection('appearance')}
              >
                <Sliders className="h-4 w-4" />
                <span className="font-medium">Aparência</span>
              </div>

              {/* Units Menu Item */}
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer border ${
                  activeSection === 'units' 
                    ? 'bg-primary text-primary-foreground border-primary/50' 
                    : 'border-transparent hover:bg-accent hover:text-accent-foreground hover:border-border/50'
                }`}
                onClick={() => setActiveSection('units')}
              >
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Unidades</span>
              </div>

              {/* Services Menu Item */}
              <div 
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer border ${
                  activeSection === 'services' 
                    ? 'bg-primary text-primary-foreground border-primary/50' 
                    : 'border-transparent hover:bg-accent hover:text-accent-foreground hover:border-border/50'
                }`}
                onClick={() => setActiveSection('services')}
              >
                <Wrench className="h-4 w-4" />
                <span className="font-medium">Serviços</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Right Column - Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border/40 rounded-xl shadow-lg shadow-black/5 p-6 h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
