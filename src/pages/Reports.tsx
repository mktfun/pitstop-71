import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Users, Clock, DollarSign, Target } from 'react-feather';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LeadsPerformanceModule from '@/components/reports/LeadsPerformanceModule';
import AppointmentsAnalysisModule from '@/components/reports/AppointmentsAnalysisModule';
import ClientsAnalysisModule from '@/components/reports/ClientsAnalysisModule';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Lead {
  id: string;
  name: string;
  columnId: string;
  createdAt: string;
  history: Array<{
    timestamp: string;
    type: string;
    description: string;
  }>;
}

export interface Appointment {
  id: string;
  leadId: string;
  date: string;
  time: string;
  serviceType: string;
  createdAt: string;
}

export interface ServiceOrder {
  id: string;
  leadId: string;
  services: Array<{
    cost: number;
  }>;
  status: string;
  createdAt: string;
  completedAt?: string;
}

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [customDateRange, setCustomDateRange] = useState<DateRange | null>(null);

  // Calcular período baseado na seleção
  const dateRange = useMemo((): DateRange => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case '7':
        return { from: subDays(now, 7), to: now };
      case '30':
        return { from: subDays(now, 30), to: now };
      case '90':
        return { from: subDays(now, 90), to: now };
      case 'currentMonth':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'currentYear':
        return { from: startOfYear(now), to: endOfYear(now) };
      case 'custom':
        return customDateRange || { from: subDays(now, 30), to: now };
      default:
        return { from: subDays(now, 30), to: now };
    }
  }, [selectedPeriod, customDateRange]);

  // Carregar dados do localStorage
  const { leads, appointments, serviceOrders } = useMemo(() => {
    try {
      const leadsData: Lead[] = JSON.parse(localStorage.getItem('pitstop_leads') || '[]');
      const appointmentsData: Appointment[] = JSON.parse(localStorage.getItem('pitstop_appointments') || '[]');
      const osData: ServiceOrder[] = JSON.parse(localStorage.getItem('pitstop_os') || '[]');

      return {
        leads: leadsData,
        appointments: appointmentsData,
        serviceOrders: osData
      };
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return { leads: [], appointments: [], serviceOrders: [] };
    }
  }, []);

  // Filtrar dados pelo período selecionado
  const filteredData = useMemo(() => {
    const interval = { start: dateRange.from, end: dateRange.to };
    
    const filteredLeads = leads.filter(lead => {
      const createdDate = new Date(lead.createdAt);
      return isWithinInterval(createdDate, interval);
    });

    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isWithinInterval(appointmentDate, interval);
    });

    const filteredServiceOrders = serviceOrders.filter(os => {
      const createdDate = new Date(os.createdAt);
      return isWithinInterval(createdDate, interval);
    });

    return {
      leads: filteredLeads,
      appointments: filteredAppointments,
      serviceOrders: filteredServiceOrders
    };
  }, [leads, appointments, serviceOrders, dateRange]);

  // KPIs gerais
  const generalKPIs = useMemo(() => {
    const totalLeads = filteredData.leads.length;
    const totalAppointments = filteredData.appointments.length;
    const totalRevenue = filteredData.serviceOrders
      .filter(os => os.status === 'Concluída')
      .reduce((sum, os) => sum + os.services.reduce((serviceSum, service) => serviceSum + service.cost, 0), 0);
    const completedOrders = filteredData.serviceOrders.filter(os => os.status === 'Concluída').length;

    return {
      totalLeads,
      totalAppointments,
      totalRevenue,
      completedOrders
    };
  }, [filteredData]);

  const periodLabels = {
    '7': 'Últimos 7 dias',
    '30': 'Últimos 30 dias',
    '90': 'Últimos 90 dias',
    'currentMonth': 'Mês atual',
    'currentYear': 'Ano atual',
    'custom': 'Período customizado'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Análise completa do desempenho - {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} até {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
          </p>
        </div>

        {/* Filtro de Período */}
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-500" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total de Leads</p>
                <p className="text-3xl font-bold text-blue-900">{generalKPIs.totalLeads}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Agendamentos</p>
                <p className="text-3xl font-bold text-green-900">{generalKPIs.totalAppointments}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">OSs Concluídas</p>
                <p className="text-3xl font-bold text-purple-900">{generalKPIs.completedOrders}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Faturamento</p>
                <p className="text-3xl font-bold text-orange-900">
                  {generalKPIs.totalRevenue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Desempenho de Leads - ocupa 2/3 da largura */}
        <div className="lg:col-span-8">
          <LeadsPerformanceModule 
            leads={filteredData.leads}
            allLeads={leads}
            dateRange={dateRange}
          />
        </div>

        {/* Análise de Agendamentos - ocupa 1/3 da largura */}
        <div className="lg:col-span-4">
          <AppointmentsAnalysisModule 
            appointments={filteredData.appointments}
            leads={leads}
            dateRange={dateRange}
          />
        </div>

        {/* Análise de Clientes - largura total */}
        <div className="lg:col-span-12">
          <ClientsAnalysisModule 
            serviceOrders={filteredData.serviceOrders}
            appointments={filteredData.appointments}
            leads={leads}
            dateRange={dateRange}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports;
