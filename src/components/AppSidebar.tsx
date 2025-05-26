
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, Tool, Volume2, BarChart2, Settings, LogOut, ChevronLeft, ChevronRight } from 'react-feather';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const menuItems = [
  {
    text: 'Dashboard',
    to: '/dashboard',
    icon: Home
  },
  {
    text: 'Leads',
    to: '/leads',
    icon: Users
  },
  {
    text: 'Agendamentos',
    to: '/agendamentos',
    icon: Calendar
  },
  {
    text: 'Ordens de Serviço',
    to: '/ordens-servico',
    icon: Tool
  },
  {
    text: 'Marketing Digital',
    to: '/marketing',
    icon: Volume2
  },
  {
    text: 'Relatórios',
    to: '/relatorios',
    icon: BarChart2
  },
  {
    text: 'Configurações',
    to: '/configuracoes',
    icon: Settings
  }
];

interface AppSidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ isExpanded, toggleSidebar }) => {
  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  return (
    <aside
      className={`h-screen bg-sidebar text-sidebar-foreground fixed top-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out shadow-lg ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header Section - Logo and Toggle */}
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {isExpanded && (
          <span className="text-xl font-semibold whitespace-nowrap">PitStop</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-sidebar-accent focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
          aria-label={isExpanded ? 'Recolher sidebar' : 'Expandir sidebar'}
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md transition-colors duration-150 ease-in-out group ${
                isExpanded ? 'justify-start px-4' : 'justify-center px-3'
              } ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`
            }
            title={isExpanded ? '' : item.text}
          >
            <item.icon
              className="shrink-0 h-5 w-5 transition duration-75"
              aria-hidden="true"
            />
            <span
              className={`ml-3 transition-all duration-200 ease-in-out whitespace-nowrap overflow-hidden ${
                isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
              }`}
            >
              {item.text}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Section - User and Logout */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        {/* User Info */}
        <div className={`flex items-center transition-all duration-200 ease-in-out ${
          isExpanded ? 'justify-start gap-3' : 'justify-center'
        }`}>
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              U
            </AvatarFallback>
          </Avatar>
          {isExpanded && (
            <span className={`text-sm text-sidebar-foreground truncate transition-all duration-200 ease-in-out ${
              isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden whitespace-nowrap'
            }`}>
              Usuário
            </span>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-150 ease-in-out w-full ${
            isExpanded ? 'justify-start px-4' : 'justify-center px-3'
          }`}
          title={isExpanded ? '' : 'Sair'}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span
            className={`ml-3 transition-all duration-200 ease-in-out whitespace-nowrap overflow-hidden ${
              isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
            }`}
          >
            Sair
          </span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
