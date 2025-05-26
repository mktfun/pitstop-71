
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Home, Users, Calendar, Tool, Volume2, BarChart2, Settings, LogOut } from 'react-feather';

const menuItems = [{
  title: 'Dashboard',
  url: '/dashboard',
  icon: Home
}, {
  title: 'Leads',
  url: '/leads',
  icon: Users
}, {
  title: 'Agendamentos',
  url: '/agendamentos',
  icon: Calendar
}, {
  title: 'Ordens de Serviço',
  url: '/ordens-servico',
  icon: Tool
}, {
  title: 'Marketing Digital',
  url: '/marketing',
  icon: Volume2
}, {
  title: 'Relatórios',
  url: '/relatorios',
  icon: BarChart2
}, {
  title: 'Configurações',
  url: '/configuracoes',
  icon: Settings
}];

const AppSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className={`border-r border-sidebar-border shadow-lg transition-all duration-300 ease-in-out px-0 mx-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={`flex items-center transition-all duration-300 ease-in-out p-4 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          {!isCollapsed && (
            <h2 className="text-lg font-bold text-sidebar-foreground">
              PitStop
            </h2>
          )}
          <SidebarTrigger className="h-8 w-8 transition-transform duration-150 ease-in-out hover:scale-110" />
        </div>
      </SidebarHeader>

      <SidebarContent className={isCollapsed ? "px-1" : "px-2"}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url} 
                    className={`
                      transition-all duration-150 ease-in-out
                      hover:bg-sidebar-accent hover:text-sidebar-accent-foreground 
                      data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground
                      ${isCollapsed ? 'h-12 w-12 p-0 justify-center mx-auto' : 'h-10 justify-start px-4'}
                    `} 
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <NavLink 
                      to={item.url} 
                      className={`
                        flex items-center transition-all duration-200 ease-in-out
                        ${isCollapsed ? 'justify-center p-3' : 'justify-start px-0 gap-3'}
                      `}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className={`
                          transition-all duration-200 ease-in-out truncate
                          ${isCollapsed ? 'opacity-0 w-0 overflow-hidden whitespace-nowrap -translate-x-4' : 'opacity-100 translate-x-0'}
                        `}>
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-3">
          {/* User Info */}
          <div className={`
            flex items-center transition-all duration-200 ease-in-out
            ${isCollapsed ? 'justify-center' : 'gap-3'}
          `}>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                U
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <span className={`
                text-sm text-sidebar-foreground truncate transition-all duration-200 ease-in-out
                ${isCollapsed ? 'opacity-0 w-0 overflow-hidden whitespace-nowrap' : 'opacity-100'}
              `}>
                Usuário
              </span>
            )}
          </div>

          {/* Logout Button */}
          <SidebarMenuButton 
            onClick={handleLogout} 
            className={`
              text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground 
              transition-all duration-150 ease-in-out
              ${isCollapsed ? 'h-12 w-12 p-0 justify-center mx-auto' : 'w-full justify-start px-4'}
            `} 
            tooltip={isCollapsed ? "Sair" : undefined}
          >
            <div className={`
              flex items-center transition-all duration-200 ease-in-out
              ${isCollapsed ? 'justify-center' : 'gap-3'}
            `}>
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className={`
                  truncate transition-all duration-200 ease-in-out
                  ${isCollapsed ? 'opacity-0 w-0 overflow-hidden whitespace-nowrap' : 'opacity-100'}
                `}>
                  Sair
                </span>
              )}
            </div>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
