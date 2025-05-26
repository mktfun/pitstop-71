
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
    <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-900/5">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-2xl shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Análise de Clientes</h2>
            <p className="text-slate-600">Performance e fidelização</p>
          </div>
        </div>

        {/* KPIs Refinados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/40 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-purple-900 uppercase tracking-wide">Clientes Ativos</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">
              {kpis.activeClients}
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/40 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-emerald-900 uppercase tracking-wide">Faturamento</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              {kpis.totalRevenue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/40 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Ticket Médio</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {kpis.avgRevenuePerClient.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/40 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-amber-900 uppercase tracking-wide">Recorrência</span>
            </div>
            <p className="text-3xl font-bold text-amber-900">
              {kpis.recurrenceRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Top Clientes Refinado */}
        {topClients.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Top 5 Clientes por Faturamento</h3>
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/40 rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200/60">
                    <TableHead className="w-[60px] font-bold text-slate-700">#</TableHead>
                    <TableHead className="font-bold text-slate-700">Cliente</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">OSs</TableHead>
                    <TableHead className="text-center font-bold text-slate-700">Agendamentos</TableHead>
                    <TableHead className="text-right font-bold text-slate-700">Faturamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topClients.map((client, index) => (
                    <TableRow key={client.leadId} className="border-slate-200/40 hover:bg-slate-50/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 
                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">{client.name}</p>
                          <p className="text-sm text-slate-500">
                            {client.completedOrders > 1 ? 'Cliente recorrente' : 'Primeiro atendimento'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {client.completedOrders}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                          {client.appointmentsCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
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
          </div>
        )}

        {/* Estatísticas adicionais refinadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Distribuição de Clientes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200/40 rounded-xl">
                <span className="font-semibold text-slate-900">Primeira vez</span>
                <span className="text-slate-600 font-medium">
                  {clientsAnalysis.filter(c => c.completedOrders === 1).length} clientes
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200/40 rounded-xl">
                <span className="font-semibold text-slate-900">2-3 atendimentos</span>
                <span className="text-slate-600 font-medium">
                  {clientsAnalysis.filter(c => c.completedOrders >= 2 && c.completedOrders <= 3).length} clientes
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200/40 rounded-xl">
                <span className="font-semibold text-slate-900">4+ atendimentos</span>
                <span className="text-slate-600 font-medium">
                  {clientsAnalysis.filter(c => c.completedOrders >= 4).length} clientes
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Faixas de Faturamento</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200/40 rounded-xl">
                <span className="font-semibold text-slate-900">Até R$ 500</span>
                <span className="text-slate-600 font-medium">
                  {clientsAnalysis.filter(c => c.totalRevenue <= 500).length} clientes
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200/40 rounded-xl">
                <span className="font-semibold text-slate-900">R$ 501 - R$ 1.500</span>
                <span className="text-slate-600 font-medium">
                  {clientsAnalysis.filter(c => c.totalRevenue > 500 && c.totalRevenue <= 1500).length} clientes
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200/40 rounded-xl">
                <span className="font-semibold text-slate-900">Acima de R$ 1.500</span>
                <span className="text-slate-600 font-medium">
                  {clientsAnalysis.filter(c => c.totalRevenue > 1500).length} clientes
                </span>
              </div>
            </div>
          </div>
        </div>

        {clientsAnalysis.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-lg">Nenhum cliente com ordens de serviço concluídas no período</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsAnalysisModule;
