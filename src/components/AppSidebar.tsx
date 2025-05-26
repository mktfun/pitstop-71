
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home,
  Users,
  Calendar,
  Tool,
  Megaphone,
  BarChart2,
  Settings,
  LogOut
} from 'react-feather';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Leads',
    url: '/leads',
    icon: Users,
  },
  {
    title: 'Agendamentos',
    url: '/agendamentos',
    icon: Calendar,
  },
  {
    title: 'Ordens de Serviço',
    url: '/ordens-servico',
    icon: Tool,
  },
  {
    title: 'Marketing Digital',
    url: '/marketing',
    icon: Megaphone,
  },
  {
    title: 'Relatórios',
    url: '/relatorios',
    icon: BarChart2,
  },
  {
    title: 'Configurações',
    url: '/configuracoes',
    icon: Settings,
  },
];

const AppSidebar = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  return (
    <Sidebar className="border-r border-sidebar-border shadow-lg transition-all duration-300 ease-in-out">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-sidebar-foreground transition-all duration-200 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-translate-x-2">
            PitStop
          </h2>
          <SidebarTrigger className="ml-auto transition-transform duration-150 ease-in-out hover:scale-110" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="h-10 transition-all duration-150 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="transition-all duration-200 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-translate-x-4">
                        {item.title}
                      </span>
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
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center transition-all duration-200 ease-in-out">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                U
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-sidebar-foreground transition-all duration-200 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-translate-x-4">
              Usuário
            </span>
          </div>

          {/* Logout Button */}
          <SidebarMenuButton
            onClick={handleLogout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150 ease-in-out"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="transition-all duration-200 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-translate-x-4">
              Sair
            </span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
