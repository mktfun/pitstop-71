
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Users, Clock, DollarSign, Target, MapPin, Tool, FileText, ChevronDown, ChevronUp } from 'react-feather';
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
  unitId: string;
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
  unitId: string;
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

export interface Unit {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
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
  const { leads, appointments, serviceOrders, units } = useMemo(() => {
    try {
      const leadsData: Lead[] = JSON.parse(localStorage.getItem('pitstop_leads') || '[]');
      const appointmentsData: Appointment[] = JSON.parse(localStorage.getItem('pitstop_appointments') || '[]');
      const osData: ServiceOrder[] = JSON.parse(localStorage.getItem('pitstop_os') || '[]');
      const unitsData: Unit[] = JSON.parse(localStorage.getItem('pitstop_units') || '[]');

      return {
        leads: leadsData,
        appointments: appointmentsData,
        serviceOrders: osData,
        units: unitsData
      };
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return { leads: [], appointments: [], serviceOrders: [], units: [] };
    }
  }, []);

  // Filtrar dados pelo período selecionado E pela unidade selecionada
  const filteredData = useMemo(() => {
    const interval = { start: dateRange.from, end: dateRange.to };
    
    // Passo 1: Filtrar por período
    const filteredLeadsByPeriod = leads.filter(lead => {
      const createdDate = new Date(lead.createdAt);
      return isWithinInterval(createdDate, interval);
    });

    const filteredAppointmentsByPeriod = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isWithinInterval(appointmentDate, interval);
    });

    const filteredServiceOrdersByPeriod = serviceOrders.filter(os => {
      const createdDate = new Date(os.createdAt);
      return isWithinInterval(createdDate, interval);
    });

    // Passo 2: Filtrar por unidade (se selecionada)
    const filteredLeads = selectedUnitId !== 'all' 
      ? filteredLeadsByPeriod.filter(lead => lead.unitId === selectedUnitId)
      : filteredLeadsByPeriod;

    const filteredAppointments = selectedUnitId !== 'all'
      ? filteredAppointmentsByPeriod.filter(appointment => appointment.unitId === selectedUnitId)
      : filteredAppointmentsByPeriod;

    // Para service orders, filtrar baseado no unitId do lead associado
    const filteredServiceOrders = selectedUnitId !== 'all'
      ? filteredServiceOrdersByPeriod.filter(os => {
          const associatedLead = leads.find(lead => lead.id === os.leadId);
          return associatedLead && associatedLead.unitId === selectedUnitId;
        })
      : filteredServiceOrdersByPeriod;

    return {
      leads: filteredLeads,
      appointments: filteredAppointments,
      serviceOrders: filteredServiceOrders
    };
  }, [leads, appointments, serviceOrders, dateRange, selectedUnitId]);

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

  // KPIs de Ordens de Serviço
  const serviceOrderKPIs = useMemo(() => {
    const pendingOrders = filteredData.serviceOrders.filter(os => 
      os.status === 'Pendente' || os.status === 'Diagnóstico'
    ).length;

    const inProgressOrders = filteredData.serviceOrders.filter(os => 
      os.status === 'Em Execução' || os.status === 'Aguardando Peças' || os.status === 'Em Andamento'
    ).length;

    const completedOrders = filteredData.serviceOrders.filter(os => 
      os.status === 'Concluída' || os.status === 'Aguardando Retirada' || os.status === 'Paga'
    ).length;

    return {
      pendingOrders,
      inProgressOrders,
      completedOrders,
      totalOrders: filteredData.serviceOrders.length
    };
  }, [filteredData.serviceOrders]);

  const periodLabels = {
    '7': 'Últimos 7 dias',
    '30': 'Últimos 30 dias',
    '90': 'Últimos 90 dias',
    'currentMonth': 'Mês atual',
    'currentYear': 'Ano atual',
    'custom': 'Período customizado'
  };

  // Buscar nome da unidade selecionada
  const selectedUnitName = useMemo(() => {
    if (selectedUnitId === 'all') return 'Todas as Unidades';
    const unit = units.find(u => u.id === selectedUnitId);
    return unit ? unit.name : 'Unidade não encontrada';
  }, [selectedUnitId, units]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 space-y-8">
      {/* Header Refinado */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Relatórios
          </h1>
          <p className="text-slate-600 font-medium">
            Análise completa do desempenho · {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} até {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })} · {selectedUnitName}
          </p>
        </div>

        {/* Filtros Refinados */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl px-6 py-3 shadow-lg shadow-slate-900/5">
          {/* Filtro de Período */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-slate-500" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48 border-0 bg-transparent focus:ring-0 font-medium">
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

          {/* Separador */}
          <div className="h-6 w-px bg-slate-300 hidden sm:block" />

          {/* Filtro de Unidade */}
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-slate-500" />
            <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
              <SelectTrigger className="w-48 border-0 bg-transparent focus:ring-0 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Unidades</SelectItem>
                {units.map(unit => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* KPIs Gerais Refinados */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/60 rounded-2xl p-6 shadow-lg shadow-blue-900/5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-blue-700 text-sm font-semibold tracking-wide">TOTAL DE LEADS</p>
              <p className="text-3xl font-bold text-blue-900">{generalKPIs.totalLeads}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60 rounded-2xl p-6 shadow-lg shadow-emerald-900/5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-emerald-700 text-sm font-semibold tracking-wide">AGENDAMENTOS</p>
              <p className="text-3xl font-bold text-emerald-900">{generalKPIs.totalAppointments}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/60 rounded-2xl p-6 shadow-lg shadow-purple-900/5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-purple-700 text-sm font-semibold tracking-wide">OSS CONCLUÍDAS</p>
              <p className="text-3xl font-bold text-purple-900">{generalKPIs.completedOrders}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/60 rounded-2xl p-6 shadow-lg shadow-amber-900/5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-amber-700 text-sm font-semibold tracking-wide">FATURAMENTO</p>
              <p className="text-3xl font-bold text-amber-900">
                {generalKPIs.totalRevenue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout Refinado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-16 gap-6 auto-rows-fr">
        {/* Desempenho de Leads - Bloco Principal */}
        <div className="lg:col-span-8 xl:col-span-10 lg:row-span-2">
          <LeadsPerformanceModule 
            leads={filteredData.leads}
            allLeads={leads}
            dateRange={dateRange}
          />
        </div>

        {/* Análise de Agendamentos - Bloco Vertical */}
        <div className="lg:col-span-4 xl:col-span-6 lg:row-span-1">
          <AppointmentsAnalysisModule 
            appointments={filteredData.appointments}
            leads={leads}
            dateRange={dateRange}
          />
        </div>

        {/* Resumo de Ordens de Serviço - Novo Card */}
        <div className="lg:col-span-4 xl:col-span-6 lg:row-span-1">
          <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-900/5 h-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                  <Tool className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Resumo de Ordens de Serviço</h2>
                  <p className="text-slate-600 text-sm">Status das OS</p>
                </div>
              </div>

              {serviceOrderKPIs.totalOrders > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200/40 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-900 uppercase tracking-wide">Pendentes</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-900">
                      {serviceOrderKPIs.pendingOrders}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/40 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tool className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Em Andamento</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {serviceOrderKPIs.inProgressOrders}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/40 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-900 uppercase tracking-wide">Concluídas</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {serviceOrderKPIs.completedOrders}
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 text-center">
                      <span className="font-semibold">{serviceOrderKPIs.totalOrders}</span> OS no total
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">Nenhuma Ordem de Serviço encontrada para o período/unidade selecionada</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Análise de Clientes - Bloco Horizontal */}
        <div className="lg:col-span-12 xl:col-span-16">
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
