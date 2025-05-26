
import React from 'react';
import { Clock, User, Car, MapPin, Wrench } from 'lucide-react';
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

interface DayViewProps {
  appointments: Appointment[];
  leads: Lead[];
  units: Unit[];
  services: Service[];
  onAppointmentClick: (appointment: Appointment) => void;
}

const DayView = ({ appointments, leads, units, services, onAppointmentClick }: DayViewProps) => {
  const sortedAppointments = [...appointments].sort((a, b) => a.time.localeCompare(b.time));

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

  if (sortedAppointments.length === 0) {
    return (
      <div className="p-8 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Nenhum agendamento para este dia</p>
        <p className="text-sm text-muted-foreground mt-2">Adicione um novo agendamento para começar</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {sortedAppointments.map((appointment) => {
        const lead = getLeadById(appointment.leadId);
        const unit = getUnitById(appointment.unitId);
        const serviceName = getServiceName(appointment);
        
        return (
          <div
            key={appointment.id}
            onClick={() => onAppointmentClick(appointment)}
            className="bg-muted/50 hover:bg-muted border border-border rounded-lg p-4 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-primary font-semibold">
                    <Clock className="h-4 w-4" />
                    <span className="text-lg">{appointment.time}</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-foreground">
                      {lead?.name || 'Lead não encontrado'}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-foreground">
                      {unit?.name || 'Unidade Removida'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Serviço</p>
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4 text-purple-500" />
                      <span className="font-medium text-foreground">{serviceName}</span>
                    </div>
                  </div>
                  
                  {lead?.carModel && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Veículo</p>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-foreground">{lead.carModel}</span>
                        {lead.carPlate && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            {lead.carPlate}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {appointment.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm text-foreground">{appointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DayView;
