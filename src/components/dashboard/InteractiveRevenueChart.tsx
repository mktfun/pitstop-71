
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, isSameMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PeriodFilter } from '@/types/dashboard';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ServiceOrder {
  id: string;
  osNumber: string;
  leadId: string;
  vehicleInfo: string;
  reportedIssues: string;
  services: Array<{
    serviceId: string;
    description: string;
    parts: string;
    cost: number;
  }>;
  status: string;
  createdAt: string;
  completedAt?: string;
}

interface RevenueData {
  mes: string;
  valor: number;
  fullDate: Date;
}

interface InteractiveRevenueChartProps {
  selectedPeriod: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
}

const chartConfig = {
  valor: {
    label: "Faturamento",
    color: "hsl(var(--primary))",
  },
};

const periodLabels = {
  last6months: 'Últimos 6 Meses',
  thisyear: 'Este Ano',
  lastyear: 'Ano Passado',
  all: 'Todos os Períodos'
};

const InteractiveRevenueChart = ({ selectedPeriod, onPeriodChange }: InteractiveRevenueChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);

  useEffect(() => {
    loadServiceOrders();
  }, []);

  const loadServiceOrders = () => {
    try {
      const osData = localStorage.getItem('pitstop_os');
      const orders: ServiceOrder[] = osData ? JSON.parse(osData) : [];
      setServiceOrders(orders);
    } catch (error) {
      console.error('Error loading service orders:', error);
      setServiceOrders([]);
    }
  };

  const revenueData = useMemo(() => {
    const completedStatuses = ['Concluída', 'Paga', 'Fechado/Ganho'];
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // Define date range based on selected period
    switch (selectedPeriod) {
      case 'last6months':
        startDate = subMonths(startOfMonth(now), 5);
        break;
      case 'thisyear':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      case 'lastyear':
        startDate = startOfYear(subMonths(now, 12));
        endDate = endOfYear(subMonths(now, 12));
        break;
      case 'all':
        // Find earliest OS date
        const earliestOS = serviceOrders.reduce((earliest, os) => {
          try {
            const osDate = parseISO(os.createdAt);
            return !earliest || osDate < earliest ? osDate : earliest;
          } catch {
            return earliest;
          }
        }, null as Date | null);
        startDate = earliestOS || subMonths(now, 12);
        break;
      default:
        startDate = subMonths(startOfMonth(now), 5);
    }

    // Generate monthly data
    const monthlyData: { [key: string]: { month: Date; revenue: number } } = {};
    
    // Initialize months in range
    let currentMonth = startOfMonth(startDate);
    while (currentMonth <= endOfMonth(endDate)) {
      const monthKey = format(currentMonth, 'yyyy-MM');
      monthlyData[monthKey] = {
        month: currentMonth,
        revenue: 0
      };
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    }

    // Aggregate revenue by month
    serviceOrders.forEach(os => {
      if (!completedStatuses.includes(os.status)) return;
      
      try {
        const completionDate = parseISO(os.completedAt || os.createdAt);
        
        // Check if date is within our range
        if (!isWithinInterval(completionDate, { start: startDate, end: endDate })) return;
        
        const monthKey = format(completionDate, 'yyyy-MM');
        
        if (monthlyData[monthKey]) {
          const osRevenue = os.services.reduce((total, service) => total + service.cost, 0);
          monthlyData[monthKey].revenue += osRevenue;
        }
      } catch (error) {
        console.error('Error processing OS date:', error);
      }
    });

    // Convert to chart format
    return Object.values(monthlyData)
      .sort((a, b) => a.month.getTime() - b.month.getTime())
      .map(({ month, revenue }) => ({
        mes: format(month, 'MMM/yy', { locale: ptBR }),
        valor: revenue,
        fullDate: month
      }));
  }, [serviceOrders, selectedPeriod]);

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.valor, 0);
  const averageRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0;

  return (
    <Card className="bg-card/95 backdrop-blur-sm h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Faturamento Mensal</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {periodLabels[selectedPeriod]} • Total: R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Period Filter Buttons */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {Object.entries(periodLabels).map(([key, label]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedPeriod === key ? "default" : "ghost"}
                  onClick={() => onPeriodChange(key as PeriodFilter)}
                  className="h-7 px-2 text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
            
            {/* Chart Type Toggle */}
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <Button
                size="sm"
                variant={chartType === 'bar' ? "default" : "ghost"}
                onClick={() => setChartType('bar')}
                className="h-7 px-2"
              >
                <BarChart3 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant={chartType === 'line' ? "default" : "ghost"}
                onClick={() => setChartType('line')}
                className="h-7 px-2"
              >
                <TrendingUp className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        {revenueData.length === 0 || totalRevenue === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Não há dados de faturamento para o período selecionado.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Média Mensal</p>
                <p className="font-semibold">R$ {averageRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Meses com Vendas</p>
                <p className="font-semibold">{revenueData.filter(item => item.valor > 0).length} de {revenueData.length}</p>
              </div>
            </div>
            
            {/* Chart */}
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="mes" 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs fill-muted-foreground"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs fill-muted-foreground"
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
                    />
                    <Bar 
                      dataKey="valor" 
                      fill="var(--color-valor)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis 
                      dataKey="mes" 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs fill-muted-foreground"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      className="text-xs fill-muted-foreground"
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
                    />
                    <Line 
                      type="monotone"
                      dataKey="valor" 
                      stroke="var(--color-valor)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-valor)", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveRevenueChart;
