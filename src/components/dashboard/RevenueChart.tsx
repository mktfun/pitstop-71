
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface RevenueData {
  mes: string;
  valor: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const chartConfig = {
  valor: {
    label: "Faturamento",
    color: "hsl(var(--primary))",
  },
};

const RevenueChart = ({ data }: RevenueChartProps) => {
  return (
    <Card className="bg-card/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Faturamento Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Não há dados de faturamento para exibir o gráfico.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
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
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
