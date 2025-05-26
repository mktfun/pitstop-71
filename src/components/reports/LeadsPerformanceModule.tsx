import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { FunnelChart, Funnel, ResponsiveContainer, LabelList, Tooltip } from 'recharts';
import { TrendingUp, Users, Clock, Target, ChevronDown, ChevronUp } from 'react-feather';
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
  const [isLeadsStagesExpanded, setIsLeadsStagesExpanded] = useState(false);

  // Dados do funil - usa os leads já filtrados que vêm como prop
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

  // KPIs calculados - usa os leads já filtrados
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

  // Dados dos estágios para a tabela expansível
  const allStagesData = useMemo(() => {
    return KANBAN_STAGES.map(stage => {
      const count = leads.filter(lead => lead.columnId === stage.id).length;
      const percentage = kpis.totalLeads > 0 ? (count / kpis.totalLeads) * 100 : 0;
      
      return {
        ...stage,
        count,
        percentage
      };
    }).filter(stage => stage.count > 0);
  }, [leads, kpis.totalLeads]);

  const stagesToShow = isLeadsStagesExpanded ? allStagesData : allStagesData.slice(0, 3);

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-900/5 h-full">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Desempenho de Leads</h2>
            <p className="text-slate-600">Análise do funil de conversão</p>
          </div>
        </div>

        {/* KPIs Refinados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/40 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Taxa de Conversão</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              {kpis.conversionRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/40 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Target className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-emerald-900 uppercase tracking-wide">Leads Fechados</span>
            </div>
            <p className="text-3xl font-bold text-emerald-900">
              {kpis.closedLeads}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/40 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-amber-900 uppercase tracking-wide">Tempo Médio</span>
            </div>
            <p className="text-3xl font-bold text-amber-900">
              {kpis.avgTimeToClose} dias
            </p>
          </div>
        </div>

        {/* Gráfico de Funil Refinado */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Funil de Conversão</h3>
          {funnelData.length > 0 ? (
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/40 rounded-2xl p-6">
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
                      <LabelList position="center" fill="#fff" stroke="none" fontSize={12} fontWeight="bold" />
                    </Funnel>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </FunnelChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white border border-slate-200/40 rounded-2xl">
              <TrendingUp className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-slate-500 font-medium">Nenhum dado disponível para o período selecionado</p>
            </div>
          )}
        </div>

        {/* Distribuição por Estágio Refinada com Expansão */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Distribuição por Estágio</h3>
          <div className="space-y-3">
            {stagesToShow.map(stage => (
              <div key={stage.id} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border border-slate-200/40 rounded-xl hover:bg-white/80 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-semibold text-slate-900">{stage.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 font-medium">{stage.count} leads</span>
                  <span className="text-lg font-bold text-slate-900 min-w-[60px] text-right">
                    {stage.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Botão Ver Mais/Ver Menos */}
          {allStagesData.length > 3 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLeadsStagesExpanded(!isLeadsStagesExpanded)}
                className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-2 mx-auto transition-colors duration-200"
              >
                <span className="font-medium">
                  {isLeadsStagesExpanded ? 'Ver Menos' : 'Ver Mais'}
                </span>
                {isLeadsStagesExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsPerformanceModule;
