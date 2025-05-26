
import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, Unit } from '@/pages/Appointments';
import { Lead } from '@/pages/Leads';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedTime?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WeekViewProps {
  appointments: Appointment[];
  leads: Lead[];
  units: Unit[];
  services: Service[];
  currentDate: Date;
  onAppointmentClick: (appointment: Appointment) => void;
}

const WeekView = ({ appointments, leads, units, services, currentDate, onAppointmentClick }: WeekViewProps) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Generate time slots from 8:00 to 18:00
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getLeadById = (leadId: string) => {
    return leads.find(lead => lead.id === leadId);
  };

  const getUnitById = (unitId: string) => {
    return units.find(unit => unit.id === unitId);
  };

  const getServiceById = (serviceId: string) => {
    return services.find(service => service.id === serviceId);
  };

  const getServiceName = (appointment: Appointment) => {
    if (appointment.serviceId) {
      const service = getServiceById(appointment.serviceId);
      return service ? service.name : 'Serviço Removido/Inativo';
    }
    // Legacy fallback
    return appointment.serviceType || 'Serviço não especificado';
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(appointment => appointment.date === dateStr);
  };

  const getAppointmentForTimeSlot = (date: Date, timeSlot: string) => {
    const dayAppointments = getAppointmentsForDay(date);
    return dayAppointments.find(appointment => appointment.time === timeSlot);
  };

  return (
    <div className="overflow-auto">
      <div className="min-w-[800px] grid grid-cols-8 border-b border-border">
        {/* Time column header */}
        <div className="p-4 bg-muted/50 border-r border-border">
          <span className="text-sm font-medium text-muted-foreground">Horário</span>
        </div>
        
        {/* Day headers */}
        {weekDays.map((day, index) => (
          <div key={index} className="p-4 bg-muted/50 border-r border-border text-center">
            <div className="text-sm font-medium text-foreground">
              {format(day, 'EEE', { locale: ptBR })}
            </div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots and appointments */}
      {timeSlots.map((timeSlot) => (
        <div key={timeSlot} className="grid grid-cols-8 border-b border-border min-h-[80px]">
          {/* Time slot */}
          <div className="p-4 bg-muted/30 border-r border-border flex items-center">
            <span className="text-sm font-medium text-muted-foreground">{timeSlot}</span>
          </div>
          
          {/* Day slots */}
          {weekDays.map((day, dayIndex) => {
            const appointment = getAppointmentForTimeSlot(day, timeSlot);
            const lead = appointment ? getLeadById(appointment.leadId) : null;
            const unit = appointment ? getUnitById(appointment.unitId) : null;
            const serviceName = appointment ? getServiceName(appointment) : null;
            
            return (
              <div key={dayIndex} className="border-r border-border p-2 relative">
                {appointment ? (
                  <div
                    onClick={() => onAppointmentClick(appointment)}
                    className="bg-primary/10 border border-primary/20 rounded-md p-2 cursor-pointer hover:bg-primary/20 transition-colors h-full"
                  >
                    <div className="text-xs font-medium text-primary mb-1 truncate">
                      {lead?.name || 'Lead não encontrado'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {serviceName}
                    </div>
                    <div className="text-xs text-green-600 truncate mt-1">
                      @ {unit?.name || 'Unidade Removida'}
                    </div>
                    {lead?.carModel && (
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {lead.carModel}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full hover:bg-muted/30 rounded-md transition-colors" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WeekView;
