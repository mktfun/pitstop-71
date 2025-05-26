
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  data: string;
  hora: string;
  cliente: string;
  servico: string;
  veiculo?: string;
}

interface AppointmentsTableProps {
  appointments: Appointment[];
}

const AppointmentsTable = ({ appointments }: AppointmentsTableProps) => {
  const [sortField, setSortField] = useState<keyof Appointment>('data');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  const handleSort = (field: keyof Appointment) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortField === 'data') {
      const dateA = new Date(aValue as string);
      const dateB = new Date(bValue as string);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }
    
    const comparison = (aValue as string).localeCompare(bValue as string);
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleRowClick = (appointmentId: string) => {
    navigate(`/agendamentos/${appointmentId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p>Nenhum agendamento próximo encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('data')}
                  >
                    Data
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('hora')}
                  >
                    Hora
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('cliente')}
                  >
                    Cliente
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort('servico')}
                  >
                    Serviço
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAppointments.slice(0, 5).map((appointment) => (
                  <TableRow 
                    key={appointment.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(appointment.id)}
                  >
                    <TableCell className="font-medium">
                      {formatDate(appointment.data)}
                    </TableCell>
                    <TableCell>{appointment.hora}</TableCell>
                    <TableCell>{appointment.cliente}</TableCell>
                    <TableCell className="truncate max-w-32">
                      {appointment.servico}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsTable;
