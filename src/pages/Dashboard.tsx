
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from '@/components/dashboard/KPICard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import AppointmentsTable from '@/components/dashboard/AppointmentsTable';
import PermissionsTestComponent from '@/components/PermissionsTestComponent';
import { TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';

export type PeriodFilter = 'last6months' | 'thisyear' | 'lastyear' | 'all';

interface ServiceOrder {
  id: string;
  osNumber: string;
  leadId: string;
  vehicleInfo: string;
  reportedIssues: string;
  services: Array<{
    serviceId: string;
    description: string;
    parts: string;
    cost: number;
  }>;
  status: string;
  createdAt: string;
  completedAt?: string;
}

interface Appointment {
  id: string;
  leadId: string;
  date: string;
  time: string;
  serviceType: string;
}

const Dashboard = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Load service orders
    try {
      const osData = localStorage.getItem('pitstop_os');
      const orders: ServiceOrder[] = osData ? JSON.parse(osData) : [];
      setServiceOrders(orders);
    } catch (error) {
      console.error('Error loading service orders:', error);
      setServiceOrders([]);
    }

    // Load appointments
    try {
      const appointmentsData = localStorage.getItem('pitstop_appointments');
      const appointmentsList: Appointment[] = appointmentsData ? JSON.parse(appointmentsData) : [];
      setAppointments(appointmentsList);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    }
  }, []);

  // Generate revenue data for chart
  const revenueData = useMemo(() => {
    const completedStatuses = ['Concluída', 'Paga', 'Fechado/Ganho'];
    const monthlyRevenue: { [key: string]: number } = {};

    serviceOrders.forEach(os => {
      if (!completedStatuses.includes(os.status)) return;
      
      try {
        const completionDate = new Date(os.completedAt || os.createdAt);
        const monthKey = `${completionDate.getFullYear()}-${String(completionDate.getMonth() + 1).padStart(2, '0')}`;
        
        const osRevenue = os.services.reduce((total, service) => total + service.cost, 0);
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + osRevenue;
      } catch (error) {
        console.error('Error processing OS date:', error);
      }
    });

    return Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, valor]) => ({
        mes: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        valor
      }));
  }, [serviceOrders]);

  // Get recent appointments (next 7 days)
  const recentAppointments = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return appointments.filter(appointment => {
      try {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= now && appointmentDate <= nextWeek;
      } catch {
        return false;
      }
    }).slice(0, 5);
  }, [appointments]);

  // Calculate KPIs
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.valor, 0);
  const completedServices = serviceOrders.filter(os => ['Concluída', 'Paga'].includes(os.status)).length;
  const todayAppointments = appointments.filter(appointment => {
    try {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      return appointmentDate.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de controle
        </p>
      </div>

      {/* Componente de teste de permissões */}
      <PermissionsTestComponent />
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Leads Ativos"
          value="24"
          icon={Users}
          description="+12% em relação ao mês passado"
        />
        <KPICard
          title="Agendamentos Hoje"
          value={todayAppointments.toString()}
          icon={Calendar}
          description={`${todayAppointments} agendamento${todayAppointments !== 1 ? 's' : ''} hoje`}
        />
        <KPICard
          title="Receita do Mês"
          value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          description="+8% em relação ao mês passado"
        />
        <KPICard
          title="Serviços Concluídos"
          value={completedServices.toString()}
          icon={TrendingUp}
          description="+23% em relação ao mês passado"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Receita</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Agendamentos Recentes</CardTitle>
            <CardDescription>
              Você tem {recentAppointments.length} agendamento{recentAppointments.length !== 1 ? 's' : ''} próximo{recentAppointments.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentsTable appointments={recentAppointments} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
              + Novo Lead
            </button>
            <button className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
              + Novo Agendamento
            </button>
            <button className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
              + Nova Ordem de Serviço
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Sem alertas pendentes
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Taxa de Conversão</span>
              <span className="text-sm font-medium">15.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tempo Médio de Atendimento</span>
              <span className="text-sm font-medium">2.5h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Satisfação do Cliente</span>
              <span className="text-sm font-medium">4.8/5</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
