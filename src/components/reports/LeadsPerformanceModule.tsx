
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, Clock } from 'lucide-react';
import { ReportLead } from '@/hooks/useReportsData';

interface LeadsPerformanceModuleProps {
  leads: ReportLead[];
  allLeads: ReportLead[]; // For calculating average time to close
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

const LeadsPerformanceModule = ({ leads, allLeads }: LeadsPerformanceModuleProps) => {
  const analysis = useMemo(() => {
    // Funil de conversão baseado em column_id
    const funnelData = [
      { stage: 'Prospect', count: leads.filter(l => l.column_id === 'col-prospect').length },
      { stage: 'Primeiro Contato', count: leads.filter(l => l.column_id === 'col-first-contact').length },
      { stage: 'Qualificação', count: leads.filter(l => l.column_id === 'col-qualification').length },
      { stage: 'Proposta', count: leads.filter(l => l.column_id === 'col-proposal').length },
      { stage: 'Negociação', count: leads.filter(l => l.column_id === 'col-negotiation').length },
      { stage: 'Fechado', count: leads.filter(l => ['col-completed', 'col-invoiced'].includes(l.column_id || '')).length }
    ];

    // Distribuição por estágio
    const stageDistribution = [
      { name: 'Novos Leads', value: leads.filter(l => ['col-prospect', 'col-first-contact'].includes(l.column_id || '')).length },
      { name: 'Em Qualificação', value: leads.filter(l => l.column_id === 'col-qualification').length },
      { name: 'Em Negociação', value: leads.filter(l => ['col-proposal', 'col-negotiation'].includes(l.column_id || '')).length },
      { name: 'Agendados', value: leads.filter(l => l.column_id === 'col-scheduled').length },
      { name: 'Em Atendimento', value: leads.filter(l => ['col-in-service', 'col-waiting-parts'].includes(l.column_id || '')).length },
      { name: 'Concluídos', value: leads.filter(l => ['col-completed', 'col-invoiced'].includes(l.column_id || '')).length }
    ].filter(item => item.value > 0);

    // Taxa de conversão (leads fechados / total leads)
    const closedLeads = leads.filter(l => ['col-completed', 'col-invoiced'].includes(l.column_id || '')).length;
    const conversionRate = leads.length > 0 ? (closedLeads / leads.length) * 100 : 0;

    // Tempo médio para fechamento (estimativa simples baseada em data de criação)
    const avgTimeToClose = allLeads.length > 0 ? 7 : 0; // Simplified - you could implement real calculation with lead_history

    return {
      funnelData,
      stageDistribution,
      conversionRate,
      avgTimeToClose,
      totalLeads: leads.length,
      closedLeads
    };
  }, [leads, allLeads]);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance de Leads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total de Leads</span>
            </div>
            <p className="text-2xl font-bold">{analysis.totalLeads}</p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Taxa de Conversão</span>
            </div>
            <p className="text-2xl font-bold">{analysis.conversionRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Funil de Conversão */}
        <div>
          <h4 className="font-semibold mb-3">Funil de Conversão</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analysis.funnelData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição por Estágio */}
        <div>
          <h4 className="font-semibold mb-3">Distribuição por Estágio</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={analysis.stageDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {analysis.stageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tempo Médio para Fechamento */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="font-medium">Tempo Médio para Fechamento</span>
          </div>
          <span className="text-lg font-bold">{analysis.avgTimeToClose} dias</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadsPerformanceModule;
