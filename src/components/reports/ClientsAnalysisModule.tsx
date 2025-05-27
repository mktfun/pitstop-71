import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, Star, TrendingUp, Calendar } from 'lucide-react';
import { ReportLead, ReportServiceOrder, ReportAppointment } from '@/hooks/useReportsData';

interface ClientsAnalysisModuleProps {
  leads: ReportLead[];
  serviceOrders: ReportServiceOrder[];
  appointments: ReportAppointment[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

const ClientsAnalysisModule = ({ leads, serviceOrders, appointments }: ClientsAnalysisModuleProps) => {
  const analysis = useMemo(() => {
    // Análise de faturamento por cliente
    const clientRevenue = serviceOrders
      .filter(order => order.completed_at && order.total_cost > 0)
      .reduce((acc, order) => {
        const lead = leads.find(l => l.id === order.lead_id);
        if (lead) {
          acc[lead.name] = (acc[lead.name] || 0) + order.total_cost;
        }
        return acc;
      }, {} as Record<string, number>);

    const topClients = Object.entries(clientRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Distribuição de valor por faixa
    const revenueRanges = [
      { range: 'R$ 0 - 500', count: 0 },
      { range: 'R$ 500 - 1.000', count: 0 },
      { range: 'R$ 1.000 - 2.000', count: 0 },
      { range: 'R$ 2.000 - 5.000', count: 0 },
      { range: 'R$ 5.000+', count: 0 }
    ];

    Object.values(clientRevenue).forEach(revenue => {
      if (revenue <= 500) revenueRanges[0].count++;
      else if (revenue <= 1000) revenueRanges[1].count++;
      else if (revenue <= 2000) revenueRanges[2].count++;
      else if (revenue <= 5000) revenueRanges[3].count++;
      else revenueRanges[4].count++;
    });

    // Clientes mais ativos (por número de agendamentos)
    const clientAppointments = appointments.reduce((acc, app) => {
      const lead = leads.find(l => l.id === app.lead_id);
      if (lead) {
        acc[lead.name] = (acc[lead.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostActiveClients = Object.entries(clientAppointments)
      .map(([name, appointments]) => ({ name, appointments }))
      .sort((a, b) => b.appointments - a.appointments)
      .slice(0, 5);

    // Estatísticas gerais
    const totalClients = leads.length;
    const clientsWithOrders = new Set(serviceOrders.map(o => o.lead_id)).size;
    const avgRevenuePerClient = totalClients > 0 ? Object.values(clientRevenue).reduce((a, b) => a + b, 0) / totalClients : 0;

    return {
      topClients,
      revenueRanges: revenueRanges.filter(r => r.count > 0),
      mostActiveClients,
      totalClients,
      clientsWithOrders,
      avgRevenuePerClient
    };
  }, [leads, serviceOrders, appointments]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Análise de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total de Clientes</span>
            </div>
            <p className="text-2xl font-bold">{analysis.totalClients}</p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Clientes Ativos</span>
            </div>
            <p className="text-2xl font-bold">{analysis.clientsWithOrders}</p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Receita Média/Cliente</span>
            </div>
            <p className="text-xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(analysis.avgRevenuePerClient)}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Clientes por Faturamento */}
          {analysis.topClients.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Maiores Clientes por Faturamento</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysis.topClients} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0
                    }).format(value)
                  } />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip 
                    formatter={(value) => [
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(value as number),
                      'Faturamento'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Distribuição por Faixa de Valor */}
          {analysis.revenueRanges.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Distribuição por Faixa de Faturamento</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analysis.revenueRanges}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ range, count }) => `${range}: ${count}`}
                  >
                    {analysis.revenueRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Clientes Mais Ativos */}
        {analysis.mostActiveClients.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Clientes Mais Ativos (por Agendamentos)</h4>
            <div className="space-y-2">
              {analysis.mostActiveClients.map((client, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">{client.name}</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-lg font-bold">{client.appointments}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsAnalysisModule;
