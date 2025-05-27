
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportAppointment, ReportLead } from '@/hooks/useReportsData';

interface AppointmentsAnalysisModuleProps {
  appointments: ReportAppointment[];
  leads: ReportLead[];
}

const AppointmentsAnalysisModule = ({ appointments, leads }: AppointmentsAnalysisModuleProps) => {
  const analysis = useMemo(() => {
    // Agendamentos por dia da semana
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const dayName = format(addDays(startOfWeek(new Date()), i), 'EEEE', { locale: ptBR });
      const dayAppointments = appointments.filter(app => {
        const appDate = parseISO(app.appointment_date);
        return appDate.getDay() === i;
      });
      return {
        day: dayName,
        count: dayAppointments.length
      };
    });

    // Agendamentos por status
    const statusData = [
      { status: 'Agendado', count: appointments.filter(a => a.status === 'scheduled').length },
      { status: 'Confirmado', count: appointments.filter(a => a.status === 'confirmed').length },
      { status: 'Concluído', count: appointments.filter(a => a.status === 'completed').length },
      { status: 'Cancelado', count: appointments.filter(a => a.status === 'cancelled').length }
    ].filter(item => item.count > 0);

    // Taxa de comparecimento (baseado no column_id do lead)
    const attendedAppointments = appointments.filter(app => {
      const lead = leads.find(l => l.id === app.lead_id);
      return lead && ['col-in-service', 'col-waiting-parts', 'col-completed', 'col-invoiced'].includes(lead.column_id || '');
    });
    
    const attendanceRate = appointments.length > 0 ? (attendedAppointments.length / appointments.length) * 100 : 0;

    // Serviços mais agendados
    const servicesData = appointments.reduce((acc, app) => {
      if (app.service_name) {
        acc[app.service_name] = (acc[app.service_name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topServices = Object.entries(servicesData)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      weeklyData,
      statusData,
      attendanceRate,
      topServices,
      totalAppointments: appointments.length,
      attendedAppointments: attendedAppointments.length
    };
  }, [appointments, leads]);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Análise de Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Agendamentos</span>
            </div>
            <p className="text-2xl font-bold">{analysis.totalAppointments}</p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Taxa de Comparecimento</span>
            </div>
            <p className="text-2xl font-bold">{analysis.attendanceRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Agendamentos por dia da semana */}
        <div>
          <h4 className="font-semibold mb-3">Agendamentos por Dia da Semana</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analysis.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status dos agendamentos */}
        {analysis.statusData.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Status dos Agendamentos</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analysis.statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Serviços mais agendados */}
        {analysis.topServices.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Serviços Mais Agendados</h4>
            <div className="space-y-2">
              {analysis.topServices.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                  <span className="font-medium">{item.service}</span>
                  <span className="text-lg font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsAnalysisModule;
