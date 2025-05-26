
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  leadId: string;
  date: string;
  time: string;
  serviceType: string;
}

interface AppointmentsTableProps {
  appointments: Appointment[];
}

interface Lead {
  id: string;
  name: string;
}

const AppointmentsTable = ({ appointments }: AppointmentsTableProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Load leads for name lookup
    try {
      const leadsData = localStorage.getItem('pitstop_leads');
      if (leadsData) {
        setLeads(JSON.parse(leadsData));
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  }, []);

  const getClientName = (leadId: string): string => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.name : 'Cliente não encontrado';
  };

  const handleRowClick = (appointmentId: string) => {
    navigate(`/agendamentos`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // Assume time is in HH:MM format
      return timeString || '-';
    } catch {
      return '-';
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
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs">Hora</TableHead>
                  <TableHead className="text-xs">Cliente</TableHead>
                  <TableHead className="text-xs">Serviço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow 
                    key={appointment.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(appointment.id)}
                  >
                    <TableCell className="font-medium text-sm">
                      {formatDate(appointment.date)}
                    </TableCell>
                    <TableCell className="text-sm">{formatTime(appointment.time)}</TableCell>
                    <TableCell className="text-sm">{getClientName(appointment.leadId)}</TableCell>
                    <TableCell className="text-sm truncate max-w-32">
                      {appointment.serviceType}
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
