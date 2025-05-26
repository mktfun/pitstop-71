
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
  Grid2X2 as GridIcon, 
  Filter as FunnelIcon, 
  Calendar as CalendarIcon, 
  Wrench as ToolIcon, 
  Megaphone as MegaphoneIcon, 
  BarChart2 as BarChartIcon, 
  Settings as SettingsIcon,
  LogOut as LogOutIcon
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: GridIcon,
  },
  {
    title: 'Leads',
    url: '/leads',
    icon: FunnelIcon,
  },
  {
    title: 'Agendamentos',
    url: '/agendamentos',
    icon: CalendarIcon,
  },
  {
    title: 'Ordens de Serviço',
    url: '/ordens-servico',
    icon: ToolIcon,
  },
  {
    title: 'Marketing Digital',
    url: '/marketing',
    icon: MegaphoneIcon,
  },
  {
    title: 'Relatórios',
    url: '/relatorios',
    icon: BarChartIcon,
  },
  {
    title: 'Configurações',
    url: '/configuracoes',
    icon: SettingsIcon,
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
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            PitStop
          </h2>
          <SidebarTrigger className="ml-auto" />
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
                    className="h-10"
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                U
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Usuário
            </span>
          </div>

          {/* Logout Button */}
          <SidebarMenuButton
            onClick={handleLogout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOutIcon className="h-4 w-4" />
            <span>Sair</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
