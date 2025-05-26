
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
    const days = eachDayOfInterval(dateRange);
    
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          Análise de Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs */}
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Taxa de Comparecimento</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {kpis.attendanceRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-900">Taxa de No-Show</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">
              {kpis.noShowRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total de Agendamentos</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {kpis.totalAppointments}
            </p>
          </div>
        </div>

        {/* Distribuição por Tipo de Serviço */}
        {serviceTypeData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Por Tipo de Serviço</h3>
            <ChartContainer
              config={{
                value: {
                  label: "Agendamentos",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-48"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
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
        )}

        {/* Agendamentos por Dia (últimos 14 dias) */}
        {dailyAppointments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Últimos 14 Dias</h3>
            <ChartContainer
              config={{
                appointments: {
                  label: "Agendamentos",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-32"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyAppointments}>
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
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
        )}

        {/* Lista resumida de agendamentos recentes */}
        {appointments.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Agendamentos Recentes</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {appointments.slice(0, 3).map(appointment => {
                const lead = leads.find(l => l.id === appointment.leadId);
                const isAttended = lead && ['col-in-service', 'col-completed', 'col-invoiced', 'col-closed'].includes(lead.columnId);
                
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <p className="font-medium">{lead?.name || 'Lead não encontrado'}</p>
                      <p className="text-gray-600">{appointment.serviceType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">{format(new Date(appointment.date), 'dd/MM', { locale: ptBR })}</p>
                      <div className="flex items-center gap-1">
                        {isAttended ? (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-600" />
                        )}
                        <span className={isAttended ? 'text-green-600' : 'text-red-600'}>
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
      </CardContent>
    </Card>
  );
};

export default AppointmentsAnalysisModule;
