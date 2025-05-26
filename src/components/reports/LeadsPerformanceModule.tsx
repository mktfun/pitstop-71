
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { FunnelChart, Funnel, ResponsiveContainer, LabelList, Tooltip } from 'recharts';
import { TrendingUp, Users, Clock, Target } from 'react-feather';
import { differenceInDays } from 'date-fns';
import { DateRange, Lead } from '@/pages/Reports';

interface LeadsPerformanceModuleProps {
  leads: Lead[];
  allLeads: Lead[];
  dateRange: DateRange;
}

const KANBAN_STAGES = [
  { id: 'col-prospect', name: 'Prospecção', color: '#8B5CF6' },
  { id: 'col-first-contact', name: 'Primeiro Contato', color: '#06B6D4' },
  { id: 'col-qualification', name: 'Qualificação', color: '#10B981' },
  { id: 'col-proposal', name: 'Proposta', color: '#F59E0B' },
  { id: 'col-negotiation', name: 'Negociação', color: '#EF4444' },
  { id: 'col-scheduled', name: 'Agendado', color: '#8B5CF6' },
  { id: 'col-in-service', name: 'Em Atendimento', color: '#06B6D4' },
  { id: 'col-completed', name: 'Concluído', color: '#10B981' },
  { id: 'col-invoiced', name: 'Faturado', color: '#F59E0B' },
  { id: 'col-closed', name: 'Fechado', color: '#22C55E' }
];

const LeadsPerformanceModule = ({ leads, allLeads, dateRange }: LeadsPerformanceModuleProps) => {
  // Dados do funil
  const funnelData = useMemo(() => {
    const stageCount: Record<string, number> = {};
    
    // Inicializar contadores
    KANBAN_STAGES.forEach(stage => {
      stageCount[stage.id] = 0;
    });

    // Contar leads por estágio atual
    leads.forEach(lead => {
      if (stageCount.hasOwnProperty(lead.columnId)) {
        stageCount[lead.columnId]++;
      }
    });

    // Criar dados para o funil (principais estágios)
    return [
      { name: 'Prospecção', value: stageCount['col-prospect'], fill: '#8B5CF6' },
      { name: 'Primeiro Contato', value: stageCount['col-first-contact'], fill: '#06B6D4' },
      { name: 'Qualificação', value: stageCount['col-qualification'], fill: '#10B981' },
      { name: 'Proposta', value: stageCount['col-proposal'], fill: '#F59E0B' },
      { name: 'Agendado', value: stageCount['col-scheduled'], fill: '#8B5CF6' },
      { name: 'Fechado', value: stageCount['col-closed'], fill: '#22C55E' }
    ].filter(item => item.value > 0);
  }, [leads]);

  // KPIs calculados
  const kpis = useMemo(() => {
    const totalLeads = leads.length;
    const closedLeads = leads.filter(lead => lead.columnId === 'col-closed').length;
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

    // Calcular tempo médio no funil
    const closedLeadsWithTime = allLeads.filter(lead => {
      const closedEvent = lead.history.find(event => 
        event.description.includes('Fechado') || 
        event.description.includes('col-closed')
      );
      return closedEvent && lead.createdAt;
    });

    const avgTimeToClose = closedLeadsWithTime.length > 0 
      ? closedLeadsWithTime.reduce((sum, lead) => {
          const closedEvent = lead.history.find(event => 
            event.description.includes('Fechado') || 
            event.description.includes('col-closed')
          );
          if (closedEvent) {
            const daysDiff = differenceInDays(new Date(closedEvent.timestamp), new Date(lead.createdAt));
            return sum + daysDiff;
          }
          return sum;
        }, 0) / closedLeadsWithTime.length
      : 0;

    return {
      totalLeads,
      closedLeads,
      conversionRate,
      avgTimeToClose: Math.round(avgTimeToClose)
    };
  }, [leads, allLeads]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Desempenho de Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Taxa de Conversão</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">
              {kpis.conversionRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Leads Fechados</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {kpis.closedLeads}
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Tempo Médio</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {kpis.avgTimeToClose} dias
            </p>
          </div>
        </div>

        {/* Gráfico de Funil */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil de Conversão</h3>
          {funnelData.length > 0 ? (
            <ChartContainer
              config={{
                value: {
                  label: "Leads",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Funnel
                    dataKey="value"
                    data={funnelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                  >
                    <LabelList position="center" fill="#fff" stroke="none" />
                  </Funnel>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </FunnelChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Nenhum dado disponível para o período selecionado</p>
            </div>
          )}
        </div>

        {/* Distribuição por Estágio */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Distribuição por Estágio</h3>
          <div className="space-y-2">
            {KANBAN_STAGES.map(stage => {
              const count = leads.filter(lead => lead.columnId === stage.id).length;
              const percentage = kpis.totalLeads > 0 ? (count / kpis.totalLeads) * 100 : 0;
              
              if (count === 0) return null;
              
              return (
                <div key={stage.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm font-medium">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{count} leads</span>
                    <span className="text-sm font-medium text-gray-900">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadsPerformanceModule;
