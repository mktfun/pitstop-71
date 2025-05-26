
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, DollarSign, TrendingUp, Star } from 'react-feather';
import { DateRange, Lead, Appointment, ServiceOrder } from '@/pages/Reports';

interface ClientsAnalysisModuleProps {
  serviceOrders: ServiceOrder[];
  appointments: Appointment[];
  leads: Lead[];
  dateRange: DateRange;
}

interface ClientAnalysis {
  leadId: string;
  name: string;
  completedOrders: number;
  totalRevenue: number;
  lastServiceDate: string;
  appointmentsCount: number;
}

const ClientsAnalysisModule = ({ serviceOrders, appointments, leads, dateRange }: ClientsAnalysisModuleProps) => {
  // Análise de clientes
  const clientsAnalysis = useMemo(() => {
    const clientMap = new Map<string, ClientAnalysis>();

    // Processar ordens de serviço concluídas
    serviceOrders
      .filter(os => os.status === 'Concluída')
      .forEach(os => {
        const lead = leads.find(l => l.id === os.leadId);
        if (!lead) return;

        const revenue = os.services.reduce((sum, service) => sum + (service.cost || 0), 0);
        
        if (clientMap.has(os.leadId)) {
          const existing = clientMap.get(os.leadId)!;
          existing.completedOrders++;
          existing.totalRevenue += revenue;
          if (os.completedAt && os.completedAt > existing.lastServiceDate) {
            existing.lastServiceDate = os.completedAt;
          }
        } else {
          clientMap.set(os.leadId, {
            leadId: os.leadId,
            name: lead.name,
            completedOrders: 1,
            totalRevenue: revenue,
            lastServiceDate: os.completedAt || os.createdAt,
            appointmentsCount: 0
          });
        }
      });

    // Adicionar contagem de agendamentos
    appointments.forEach(appointment => {
      if (clientMap.has(appointment.leadId)) {
        clientMap.get(appointment.leadId)!.appointmentsCount++;
      }
    });

    return Array.from(clientMap.values())
      .filter(client => client.completedOrders > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [serviceOrders, appointments, leads]);

  // KPIs de clientes
  const kpis = useMemo(() => {
    const activeClients = clientsAnalysis.length;
    const totalRevenue = clientsAnalysis.reduce((sum, client) => sum + client.totalRevenue, 0);
    const avgRevenuePerClient = activeClients > 0 ? totalRevenue / activeClients : 0;
    
    // Clientes recorrentes (mais de 1 OS)
    const recurringClients = clientsAnalysis.filter(client => client.completedOrders > 1).length;
    const recurrenceRate = activeClients > 0 ? (recurringClients / activeClients) * 100 : 0;

    return {
      activeClients,
      totalRevenue,
      avgRevenuePerClient,
      recurringClients,
      recurrenceRate
    };
  }, [clientsAnalysis]);

  // Top 5 clientes
  const topClients = clientsAnalysis.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Análise de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Clientes Ativos</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {kpis.activeClients}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Faturamento Total</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {kpis.totalRevenue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Ticket Médio</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {kpis.avgRevenuePerClient.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Taxa de Recorrência</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {kpis.recurrenceRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Top Clientes */}
        {topClients.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Clientes por Faturamento</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-center">OSs</TableHead>
                  <TableHead className="text-center">Agendamentos</TableHead>
                  <TableHead className="text-right">Faturamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((client, index) => (
                  <TableRow key={client.leadId}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-500">
                          {client.completedOrders > 1 ? 'Cliente recorrente' : 'Primeiro atendimento'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {client.completedOrders}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {client.appointmentsCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {client.totalRevenue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Estatísticas adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Distribuição de Clientes</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">Primeira vez</span>
                <span className="text-sm text-gray-600">
                  {clientsAnalysis.filter(c => c.completedOrders === 1).length} clientes
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">2-3 atendimentos</span>
                <span className="text-sm text-gray-600">
                  {clientsAnalysis.filter(c => c.completedOrders >= 2 && c.completedOrders <= 3).length} clientes
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">4+ atendimentos</span>
                <span className="text-sm text-gray-600">
                  {clientsAnalysis.filter(c => c.completedOrders >= 4).length} clientes
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Faixas de Faturamento</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">Até R$ 500</span>
                <span className="text-sm text-gray-600">
                  {clientsAnalysis.filter(c => c.totalRevenue <= 500).length} clientes
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">R$ 501 - R$ 1.500</span>
                <span className="text-sm text-gray-600">
                  {clientsAnalysis.filter(c => c.totalRevenue > 500 && c.totalRevenue <= 1500).length} clientes
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">Acima de R$ 1.500</span>
                <span className="text-sm text-gray-600">
                  {clientsAnalysis.filter(c => c.totalRevenue > 1500).length} clientes
                </span>
              </div>
            </div>
          </div>
        </div>

        {clientsAnalysis.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Nenhum cliente com ordens de serviço concluídas no período</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientsAnalysisModule;
