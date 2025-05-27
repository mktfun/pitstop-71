
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarIcon, TrendingUp, Users, Wrench, DollarSign, Download } from 'lucide-react';
import { format, isWithinInterval, parseISO, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LeadsPerformanceModule from '@/components/reports/LeadsPerformanceModule';
import AppointmentsAnalysisModule from '@/components/reports/AppointmentsAnalysisModule';
import ClientsAnalysisModule from '@/components/reports/ClientsAnalysisModule';
import { useReportsData } from '@/hooks/useReportsData';

// Date range options
const dateRangeOptions = [
  { value: 'last7days', label: 'Últimos 7 dias' },
  { value: 'last30days', label: 'Últimos 30 dias' },
  { value: 'currentMonth', label: 'Mês atual' },
  { value: 'lastMonth', label: 'Mês passado' },
  { value: 'last3months', label: 'Últimos 3 meses' },
];

const Reports = () => {
  const { leads, appointments, serviceOrders, units, isLoading, error } = useReportsData();
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');

  // Calculate date intervals
  const getDateInterval = (range: string) => {
    const now = new Date();
    switch (range) {
      case 'last7days':
        return { start: subDays(now, 7), end: now };
      case 'last30days':
        return { start: subDays(now, 30), end: now };
      case 'currentMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'last3months':
        return { start: subMonths(now, 3), end: now };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  // Filter data based on date range and unit
  const filteredData = useMemo(() => {
    const interval = getDateInterval(dateRange);
    
    const filteredLeads = leads.filter(lead => {
      const leadDate = parseISO(lead.created_at);
      const dateMatch = isWithinInterval(leadDate, interval);
      const unitMatch = selectedUnitId === 'all' || lead.unit_id === selectedUnitId;
      return dateMatch && unitMatch;
    });

    const filteredAppointments = appointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.appointment_date);
      const dateMatch = isWithinInterval(appointmentDate, interval);
      const unitMatch = selectedUnitId === 'all' || appointment.unit_id === selectedUnitId;
      return dateMatch && unitMatch;
    });

    const filteredServiceOrders = serviceOrders.filter(order => {
      const orderDate = parseISO(order.created_at);
      const dateMatch = isWithinInterval(orderDate, interval);
      const unitMatch = selectedUnitId === 'all' || order.unit_id === selectedUnitId;
      return dateMatch && unitMatch;
    });

    return {
      leads: filteredLeads,
      appointments: filteredAppointments,
      serviceOrders: filteredServiceOrders
    };
  }, [leads, appointments, serviceOrders, dateRange, selectedUnitId]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const completedOrders = filteredData.serviceOrders.filter(order => order.completed_at);
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total_cost || 0), 0);
    const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    return {
      totalLeads: filteredData.leads.length,
      totalAppointments: filteredData.appointments.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      averageOrderValue
    };
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">Erro ao carregar dados: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho do seu negócio
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Unidade</label>
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as unidades</SelectItem>
                  {units.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OS Concluídas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.completedOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(kpis.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(kpis.averageOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Modules */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LeadsPerformanceModule 
          leads={filteredData.leads}
          allLeads={leads}
        />
        <AppointmentsAnalysisModule 
          appointments={filteredData.appointments}
          leads={leads}
        />
      </div>

      <div className="grid gap-6">
        <ClientsAnalysisModule 
          leads={filteredData.leads}
          serviceOrders={filteredData.serviceOrders}
          appointments={filteredData.appointments}
        />
      </div>
    </div>
  );
};

export default Reports;
