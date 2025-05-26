
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Clock, User } from 'lucide-react';
import { Appointment } from '@/pages/Appointments';
import { Lead } from '@/pages/Leads';

interface MonthViewProps {
  appointments: Appointment[];
  leads: Lead[];
  currentDate: Date;
  onAppointmentClick: (appointment: Appointment) => void;
}

const MonthView = ({ appointments, leads, currentDate, onAppointmentClick }: MonthViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(currentDate);

  const getLeadById = (leadId: string) => {
    return leads.find(lead => lead.id === leadId);
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(appointment => appointment.date === dateStr);
  };

  const getSelectedDateAppointments = () => {
    if (!selectedDate) return [];
    return getAppointmentsForDate(selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getDaysWithAppointments = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return daysInMonth.filter(day => {
      const dayAppointments = getAppointmentsForDate(day);
      return dayAppointments.length > 0;
    });
  };

  const daysWithAppointments = getDaysWithAppointments();
  const selectedDateAppointments = getSelectedDateAppointments();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Calendar */}
      <div className="lg:col-span-1">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentDate}
          className="rounded-md border bg-background p-3"
          modifiers={{
            hasAppointments: daysWithAppointments,
          }}
          modifiersStyles={{
            hasAppointments: {
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              fontWeight: 'bold',
            },
          }}
        />
        <div className="mt-4 text-sm text-muted-foreground">
          <p>• Dias em destaque possuem agendamentos</p>
          <p>• Clique em um dia para ver os agendamentos</p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {selectedDate 
              ? `Agendamentos - ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`
              : 'Selecione um dia no calendário'
            }
          </h3>

          {selectedDate && selectedDateAppointments.length > 0 ? (
            <div className="space-y-3">
              {selectedDateAppointments.map((appointment) => {
                const lead = getLeadById(appointment.leadId);
                
                return (
                  <div
                    key={appointment.id}
                    onClick={() => onAppointmentClick(appointment)}
                    className="bg-muted/50 hover:bg-muted border border-border rounded-lg p-4 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 text-primary font-semibold">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="h-4 w-px bg-border" />
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-foreground">
                              {lead?.name || 'Lead não encontrado'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-foreground">
                          <strong>Serviço:</strong> {appointment.serviceType}
                        </div>

                        {appointment.notes && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Observações:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : selectedDate ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento para este dia</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Selecione um dia no calendário para ver os agendamentos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
