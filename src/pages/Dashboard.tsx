
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Settings, User, Calendar, TrendingUp } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import AppointmentsTable from '@/components/dashboard/AppointmentsTable';

interface RevenueData {
  mes: string;
  valor: number;
}

interface Appointment {
  id: string;
  data: string;
  hora: string;
  cliente: string;
  servico: string;
  veiculo?: string;
}

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState('');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [openOSCount, setOpenOSCount] = useState<string>('0');
  const [newLeadsCount, setNewLeadsCount] = useState<string>('0');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn');
    const email = localStorage.getItem('userEmail');
    
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    
    if (email) {
      setUserEmail(email);
    }

    // Load revenue data
    try {
      const storedRevenue = localStorage.getItem('pitstop_revenue');
      if (storedRevenue) {
        const parsedRevenue = JSON.parse(storedRevenue);
        setRevenueData(parsedRevenue);
      }
    } catch (error) {
      console.error('Error parsing revenue data:', error);
    }

    // Load open OS count
    const osCount = localStorage.getItem('pitstop_open_os_count');
    if (osCount) {
      setOpenOSCount(osCount);
    }

    // Load new leads count
    const leadsCount = localStorage.getItem('pitstop_new_leads_count');
    if (leadsCount) {
      setNewLeadsCount(leadsCount);
    }

    // Load appointments data
    try {
      const storedAppointments = localStorage.getItem('pitstop_appointments');
      if (storedAppointments) {
        const parsedAppointments = JSON.parse(storedAppointments);
        setAppointments(parsedAppointments);
      }
    } catch (error) {
      console.error('Error parsing appointments data:', error);
    }
  }, [navigate]);

  // Calculate today's appointments
  const getTodayAppointmentsCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.data === today).length.toString();
  };

  // Calculate current month revenue
  const getCurrentMonthRevenue = () => {
    const currentMonth = new Date().toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
    const currentMonthFormatted = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
    
    const currentMonthData = revenueData.find(item => 
      item.mes.toLowerCase().includes(currentMonth.toLowerCase()) ||
      item.mes.includes(currentMonthFormatted)
    );
    
    return currentMonthData ? 
      `R$ ${currentMonthData.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
      'R$ 0,00';
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
          value={openOSCount}
          icon={Settings}
          linkTo="/ordens-servico"
          linkText="Ver Ordens"
        />
        <KPICard
          title="Novos Leads"
          value={newLeadsCount}
          icon={User}
          linkTo="/leads"
          linkText="Ver Leads"
        />
        <KPICard
          title="Agendamentos Hoje"
          value={getTodayAppointmentsCount()}
          icon={Calendar}
          linkTo="/agendamentos"
          linkText="Ver Agenda"
        />
        <KPICard
          title="Faturamento (Mês Atual)"
          value={getCurrentMonthRevenue()}
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
          <AppointmentsTable appointments={appointments} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
