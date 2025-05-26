
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Settings, User, Calendar, TrendingUp } from 'lucide-react';
import { format, isToday, isThisMonth, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import KPICard from '@/components/dashboard/KPICard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import AppointmentsTable from '@/components/dashboard/AppointmentsTable';

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

interface Lead {
  id: string;
  name: string;
  columnId: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  leadId: string;
  date: string;
  time: string;
  serviceType: string;
}

interface RevenueData {
  mes: string;
  valor: number;
}

const Dashboard = () => {
  const [openOSCount, setOpenOSCount] = useState<number>(0);
  const [newLeadsCount, setNewLeadsCount] = useState<number>(0);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState<number>(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState<number>(0);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn');
    
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = () => {
    try {
      // Load and calculate Open OS Count
      const osData = localStorage.getItem('pitstop_os');
      const serviceOrders: ServiceOrder[] = osData ? JSON.parse(osData) : [];
      const openStatuses = ['Diagnóstico', 'Aguardando Peças', 'Em Execução', 'Aguardando Retirada'];
      const openOS = serviceOrders.filter(os => openStatuses.includes(os.status));
      setOpenOSCount(openOS.length);

      // Load and calculate New Leads Count (current month)
      const leadsData = localStorage.getItem('pitstop_leads');
      const leads: Lead[] = leadsData ? JSON.parse(leadsData) : [];
      const currentMonthLeads = leads.filter(lead => {
        try {
          const leadDate = parseISO(lead.createdAt);
          return isThisMonth(leadDate);
        } catch {
          return false;
        }
      });
      setNewLeadsCount(currentMonthLeads.length);

      // Load and calculate Today's Appointments Count
      const appointmentsData = localStorage.getItem('pitstop_appointments');
      const appointments: Appointment[] = appointmentsData ? JSON.parse(appointmentsData) : [];
      const todayAppointments = appointments.filter(appointment => {
        try {
          const appointmentDate = parseISO(appointment.date);
          return isToday(appointmentDate);
        } catch {
          return false;
        }
      });
      setTodayAppointmentsCount(todayAppointments.length);

      // Calculate Current Month Revenue
      const completedStatuses = ['Concluída', 'Paga', 'Fechado/Ganho'];
      const currentMonthOS = serviceOrders.filter(os => {
        if (!completedStatuses.includes(os.status)) return false;
        try {
          const completionDate = parseISO(os.completedAt || os.createdAt);
          return isThisMonth(completionDate);
        } catch {
          return false;
        }
      });
      
      const monthRevenue = currentMonthOS.reduce((total, os) => {
        return total + os.services.reduce((osTotal, service) => osTotal + service.cost, 0);
      }, 0);
      setCurrentMonthRevenue(monthRevenue);

      // Generate Revenue Data for Chart (last 6 months)
      const monthlyRevenue = generateMonthlyRevenueData(serviceOrders);
      setRevenueData(monthlyRevenue);

      // Load Upcoming Appointments (next 5)
      const upcoming = getUpcomingAppointments(appointments);
      setUpcomingAppointments(upcoming);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const generateMonthlyRevenueData = (serviceOrders: ServiceOrder[]): RevenueData[] => {
    const completedStatuses = ['Concluída', 'Paga', 'Fechado/Ganho'];
    const monthlyData: { [key: string]: number } = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = format(date, 'MMM/yy', { locale: ptBR });
      monthlyData[monthKey] = 0;
    }

    // Aggregate revenue by month
    serviceOrders.forEach(os => {
      if (!completedStatuses.includes(os.status)) return;
      
      try {
        const completionDate = parseISO(os.completedAt || os.createdAt);
        const monthKey = format(completionDate, 'MMM/yy', { locale: ptBR });
        
        if (monthlyData.hasOwnProperty(monthKey)) {
          const osRevenue = os.services.reduce((total, service) => total + service.cost, 0);
          monthlyData[monthKey] += osRevenue;
        }
      } catch (error) {
        console.error('Error processing OS date:', error);
      }
    });

    return Object.entries(monthlyData).map(([mes, valor]) => ({ mes, valor }));
  };

  const getUpcomingAppointments = (appointments: Appointment[]): Appointment[] => {
    const today = new Date();
    
    return appointments
      .filter(appointment => {
        try {
          const appointmentDate = parseISO(appointment.date);
          return appointmentDate >= today;
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        try {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          if (dateA.getTime() === dateB.getTime()) {
            return a.time.localeCompare(b.time);
          }
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      })
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral da Oficina</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard
          title="O.S. Abertas"
          value={openOSCount.toString()}
          icon={Settings}
          linkTo="/ordens-servico"
          linkText="Ver Ordens"
        />
        <KPICard
          title="Novos Leads"
          value={newLeadsCount.toString()}
          icon={User}
          linkTo="/leads"
          linkText="Ver Leads"
          description="Este mês"
        />
        <KPICard
          title="Agendamentos Hoje"
          value={todayAppointmentsCount.toString()}
          icon={Calendar}
          linkTo="/agendamentos"
          linkText="Ver Agenda"
        />
        <KPICard
          title="Faturamento"
          value={`R$ ${currentMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          description="Este mês"
        />
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Revenue Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>

        {/* Appointments Table - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <AppointmentsTable appointments={upcomingAppointments} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
