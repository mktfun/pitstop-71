
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const AppLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Larguras do Sidebar
  const sidebarWidthExpanded = 'w-64';
  const sidebarWidthCollapsed = 'w-20';
  
  // Margens correspondentes para o conteúdo principal
  const contentMarginLeftExpanded = 'ml-64';
  const contentMarginLeftCollapsed = 'ml-20';

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Sidebar Placeholder */}
      <div 
        className={`fixed top-0 left-0 h-screen z-40 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? sidebarWidthExpanded : sidebarWidthCollapsed
        }`}
      >
        {/* Header do Sidebar com botão toggle */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {isSidebarExpanded && (
            <h2 className="text-lg font-bold text-sidebar-foreground">PitStop</h2>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            aria-label={isSidebarExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
          >
            {isSidebarExpanded ? (
              <X className="h-5 w-5 text-sidebar-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-sidebar-foreground" />
            )}
          </button>
        </div>

        {/* Conteúdo do Sidebar (placeholder) */}
        <div className="p-4">
          <div className="space-y-2">
            {/* Menu items placeholder */}
            <div className={`p-3 rounded-md bg-sidebar-accent ${!isSidebarExpanded && 'text-center'}`}>
              {isSidebarExpanded ? (
                <span className="text-sidebar-accent-foreground">Dashboard</span>
              ) : (
                <div className="w-4 h-4 bg-sidebar-accent-foreground rounded mx-auto"></div>
              )}
            </div>
            <div className={`p-3 rounded-md hover:bg-sidebar-accent ${!isSidebarExpanded && 'text-center'}`}>
              {isSidebarExpanded ? (
                <span className="text-sidebar-foreground">Clientes</span>
              ) : (
                <div className="w-4 h-4 bg-sidebar-foreground rounded mx-auto"></div>
              )}
            </div>
            <div className={`p-3 rounded-md hover:bg-sidebar-accent ${!isSidebarExpanded && 'text-center'}`}>
              {isSidebarExpanded ? (
                <span className="text-sidebar-foreground">Ordens</span>
              ) : (
                <div className="w-4 h-4 bg-sidebar-foreground rounded mx-auto"></div>
              )}
            </div>
            <div className={`p-3 rounded-md hover:bg-sidebar-accent ${!isSidebarExpanded && 'text-center'}`}>
              {isSidebarExpanded ? (
                <span className="text-sidebar-foreground">Estoque</span>
              ) : (
                <div className="w-4 h-4 bg-sidebar-foreground rounded mx-auto"></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Área de Conteúdo Principal */}
      <main 
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? contentMarginLeftExpanded : contentMarginLeftCollapsed
        }`}
      >
        <div className="p-4 md:p-6">
          {/* Aqui será renderizado o conteúdo das páginas */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
