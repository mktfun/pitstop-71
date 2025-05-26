import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Calendar, TrendingUp } from 'lucide-react';
import { format, isToday, isThisMonth, startOfMonth, endOfMonth, parseISO, subMonths, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import KPICard from '@/components/dashboard/KPICard';
import InteractiveRevenueChart from '@/components/dashboard/InteractiveRevenueChart';
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

export type PeriodFilter = 'last6months' | 'thisyear' | 'lastyear' | 'all';

const Dashboard = () => {
  const [openOSCount, setOpenOSCount] = useState<number>(0);
  const [newLeadsCount, setNewLeadsCount] = useState<number>(0);
  const [todayAppointmentsCount, setTodayAppointmentsCount] = useState<number>(0);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState<number>(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('last6months');
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

      // Load Upcoming Appointments (next 5)
      const upcoming = getUpcomingAppointments(appointments);
      setUpcomingAppointments(upcoming);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral da Oficina</p>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:gap-6">
        {/* KPI Cards - Row 1 */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
          <KPICard
            title="O.S. Abertas"
            value={openOSCount.toString()}
            icon={Settings}
            linkTo="/ordens-servico"
            linkText="Ver Ordens"
          />
        </div>
        
        <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
          <KPICard
            title="Novos Leads"
            value={newLeadsCount.toString()}
            icon={User}
            linkTo="/leads"
            linkText="Ver Leads"
            description="Este mês"
          />
        </div>
        
        <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
          <KPICard
            title="Agendamentos Hoje"
            value={todayAppointmentsCount.toString()}
            icon={Calendar}
            linkTo="/agendamentos"
            linkText="Ver Agenda"
          />
        </div>
        
        <div className="col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-2">
          <KPICard
            title="Faturamento"
            value={`R$ ${currentMonthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            description="Este mês"
          />
        </div>

        {/* Interactive Revenue Chart - Main Feature */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 xl:col-span-5 row-span-2">
          <InteractiveRevenueChart 
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </div>

        {/* Appointments Table - Sidebar */}
        <div className="col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-3 row-span-2">
          <AppointmentsTable appointments={upcomingAppointments} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
