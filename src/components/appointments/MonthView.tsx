
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User, Car } from 'lucide-react';
import { Appointment } from '@/pages/Appointments';
import { Lead } from '@/pages/Leads';

interface MonthViewProps {
  appointments: Appointment[];
  leads: Lead[];
  currentDate: Date;
  onAppointmentClick: (appointment: Appointment) => void;
}

const MonthView = ({ appointments, leads, currentDate, onAppointmentClick }: MonthViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = [];
  let day = calendarStart;
  
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getLeadById = (leadId: string) => {
    return leads.find(lead => lead.id === leadId);
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(appointment => appointment.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getSelectedDayAppointments = () => {
    if (selectedDate) {
      return getAppointmentsForDay(selectedDate);
    }
    return appointments.sort((a, b) => {
      const dateComparison = a.date.localeCompare(b.date);
      if (dateComparison === 0) {
        return a.time.localeCompare(b.time);
      }
      return dateComparison;
    });
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <div className="bg-background border border-border rounded-lg">
          {/* Week headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((weekDay) => (
              <div key={weekDay} className="p-3 text-center font-medium text-muted-foreground bg-muted/50">
                {weekDay}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[100px] p-2 border-b border-r border-border cursor-pointer hover:bg-muted/30 transition-colors ${
                    !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
                  } ${isSelected ? 'bg-primary/10' : ''} ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => {
                      const lead = getLeadById(appointment.leadId);
                      return (
                        <div
                          key={appointment.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(appointment);
                          }}
                          className="bg-primary/20 text-primary text-xs px-2 py-1 rounded truncate hover:bg-primary/30 transition-colors"
                        >
                          {appointment.time} - {lead?.name || 'Sem nome'}
                        </div>
                      );
                    })}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground px-2">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appointments list */}
      <div className="bg-background border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            {selectedDate 
              ? `Agendamentos - ${format(selectedDate, "d 'de' MMMM", { locale: ptBR })}`
              : 'Todos os Agendamentos'
            }
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-sm text-primary hover:underline mt-1"
            >
              Ver todos os agendamentos
            </button>
          )}
        </div>
        
        <div className="max-h-[500px] overflow-y-auto">
          {getSelectedDayAppointments().length === 0 ? (
            <div className="p-6 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {selectedDate ? 'Nenhum agendamento neste dia' : 'Nenhum agendamento no mês'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {getSelectedDayAppointments().map((appointment) => {
                const lead = getLeadById(appointment.leadId);
                
                return (
                  <div
                    key={appointment.id}
                    onClick={() => onAppointmentClick(appointment)}
                    className="bg-muted/50 hover:bg-muted border border-border rounded-lg p-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {format(new Date(appointment.date), 'd/MM')} - {appointment.time}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-3 w-3 text-blue-500" />
                        <span className="text-sm text-foreground">
                          {lead?.name || 'Lead não encontrado'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {appointment.serviceType}
                      </div>
                      
                      {lead?.carModel && (
                        <div className="flex items-center space-x-2">
                          <Car className="h-3 w-3 text-orange-500" />
                          <span className="text-sm text-muted-foreground">
                            {lead.carModel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthView;
