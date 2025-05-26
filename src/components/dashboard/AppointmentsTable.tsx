
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User } from 'lucide-react';

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
      return format(date, 'dd/MM', { locale: ptBR });
    } catch {
      return '-';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return timeString || '-';
    } catch {
      return '-';
    }
  };

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-sm ring-1 ring-border/50 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Próximos Agendamentos</CardTitle>
            <p className="text-sm text-muted-foreground">
              {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''} próximo{appointments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-6">
            <Calendar className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-center">Nenhum agendamento próximo encontrado.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow className="border-b">
                  <TableHead className="text-xs font-medium text-muted-foreground px-6 py-3">Data</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground px-6 py-3">Cliente</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground px-6 py-3">Serviço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment, index) => (
                  <TableRow 
                    key={appointment.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors border-b border-border/50 group"
                    onClick={() => handleRowClick(appointment.id)}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-foreground">
                          {formatDate(appointment.date)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(appointment.time)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground truncate">
                          {getClientName(appointment.leadId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-sm text-muted-foreground truncate max-w-32 block">
                        {appointment.serviceType}
                      </span>
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
