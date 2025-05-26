
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import KPICard from '@/components/dashboard/KPICard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import AppointmentsTable from '@/components/dashboard/AppointmentsTable';
import PermissionsTestComponent from '@/components/PermissionsTestComponent';
import { Users, Calendar, DollarSign, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu painel de controle
        </p>
      </div>

      {/* Componente de teste de permissões */}
      <PermissionsTestComponent />
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Leads Ativos"
          value="24"
          description="+12% em relação ao mês passado"
          icon={Users}
        />
        <KPICard
          title="Agendamentos Hoje"
          value="8"
          description="3 confirmados, 5 pendentes"
          icon={Calendar}
        />
        <KPICard
          title="Receita do Mês"
          value="R$ 15.430"
          description="+8% em relação ao mês passado"
          icon={DollarSign}
        />
        <KPICard
          title="Serviços Concluídos"
          value="156"
          description="+23% em relação ao mês passado"
          icon={CheckCircle}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Receita</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Agendamentos Recentes</CardTitle>
            <CardDescription>
              Você tem 3 agendamentos hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentsTable />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
              + Novo Lead
            </button>
            <button className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
              + Novo Agendamento
            </button>
            <button className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors">
              + Nova Ordem de Serviço
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Sem alertas pendentes
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Taxa de Conversão</span>
              <span className="text-sm font-medium">15.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Tempo Médio de Atendimento</span>
              <span className="text-sm font-medium">2.5h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Satisfação do Cliente</span>
              <span className="text-sm font-medium">4.8/5</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
