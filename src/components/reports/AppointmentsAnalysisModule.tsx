
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Calendar, CheckCircle, XCircle, Clock } from 'react-feather';
import { format, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange, Lead, Appointment } from '@/pages/Reports';

interface AppointmentsAnalysisModuleProps {
  appointments: Appointment[];
  leads: Lead[];
  dateRange: DateRange;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AppointmentsAnalysisModule = ({ appointments, leads, dateRange }: AppointmentsAnalysisModuleProps) => {
  // KPIs de agendamentos
  const kpis = useMemo(() => {
    const totalAppointments = appointments.length;
    
    // Calcular comparecimento baseado no status do lead
    const attendedAppointments = appointments.filter(appointment => {
      const lead = leads.find(l => l.id === appointment.leadId);
      if (!lead) return false;
      
      // Considerar como compareceu se o lead passou para etapas posteriores ao agendamento
      const attendanceStages = ['col-in-service', 'col-completed', 'col-invoiced', 'col-closed'];
      return attendanceStages.includes(lead.columnId);
    }).length;

    const attendanceRate = totalAppointments > 0 ? (attendedAppointments / totalAppointments) * 100 : 0;
    const noShowRate = 100 - attendanceRate;

    return {
      totalAppointments,
      attendedAppointments,
      attendanceRate,
      noShowRate
    };
  }, [appointments, leads]);

  // Distribuição por tipo de serviço
  const serviceTypeData = useMemo(() => {
    const serviceCount: Record<string, number> = {};
    
    appointments.forEach(appointment => {
      serviceCount[appointment.serviceType] = (serviceCount[appointment.serviceType] || 0) + 1;
    });

    return Object.entries(serviceCount).map(([type, count], index) => ({
      name: type,
      value: count,
      fill: COLORS[index % COLORS.length]
    }));
  }, [appointments]);

  // Agendamentos por dia
  const dailyAppointments = useMemo(() => {
    const interval = { start: dateRange.from, end: dateRange.to };
    const days = eachDayOfInterval(interval);
    
    return days.map(day => {
      const dayAppointments = appointments.filter(appointment => 
        isSameDay(new Date(appointment.date), day)
      );
      
      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        appointments: dayAppointments.length
      };
    }).slice(-14); // Últimos 14 dias para não ficar muito carregado
  }, [appointments, dateRange]);

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-900/5 h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Análise de Agendamentos</h2>
            <p className="text-slate-600 text-sm">Performance e comparecimento</p>
          </div>
        </div>

        {/* KPIs Refinados */}
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-900 uppercase tracking-wide">Comparecimento</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              {kpis.attendanceRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-red-900 uppercase tracking-wide">No-Show</span>
            </div>
            <p className="text-2xl font-bold text-red-900">
              {kpis.noShowRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {kpis.totalAppointments}
            </p>
          </div>
        </div>

        {/* Distribuição por Tipo de Serviço */}
        {serviceTypeData.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Por Tipo de Serviço</h3>
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/40 rounded-2xl p-4">
              <ChartContainer
                config={{
                  value: {
                    label: "Agendamentos",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-40"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      dataKey="value"
                    >
                      {serviceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )}

        {/* Agendamentos por Dia (últimos 14 dias) */}
        {dailyAppointments.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Últimos 14 Dias</h3>
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/40 rounded-2xl p-4">
              <ChartContainer
                config={{
                  appointments: {
                    label: "Agendamentos",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-24"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyAppointments}>
                    <XAxis 
                      dataKey="date" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis hide />
                    <Bar dataKey="appointments" fill="#10B981" radius={[2, 2, 0, 0]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        )}

        {/* Lista resumida de agendamentos recentes */}
        {appointments.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Agendamentos Recentes</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {appointments.slice(0, 3).map(appointment => {
                const lead = leads.find(l => l.id === appointment.leadId);
                const isAttended = lead && ['col-in-service', 'col-completed', 'col-invoiced', 'col-closed'].includes(lead.columnId);
                
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm border border-slate-200/40 rounded-xl text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{lead?.name || 'Lead não encontrado'}</p>
                      <p className="text-slate-600">{appointment.serviceType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 font-medium">{format(new Date(appointment.date), 'dd/MM', { locale: ptBR })}</p>
                      <div className="flex items-center gap-1 justify-end">
                        {isAttended ? (
                          <CheckCircle className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${isAttended ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isAttended ? 'Compareceu' : 'No-show'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsAnalysisModule;
