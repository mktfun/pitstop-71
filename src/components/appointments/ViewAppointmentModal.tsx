
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Phone, Mail, Car, Calendar, Edit, Trash2, MapPin, CheckCircle, Building } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, Unit } from '@/pages/Appointments';
import { Lead } from '@/pages/Leads';

interface ViewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  lead: Lead | null;
  unit: Unit | null;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  onMarkAttendance?: (appointmentId: string) => void;
}

const ViewAppointmentModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  lead, 
  unit,
  onEdit, 
  onDelete,
  onMarkAttendance
}: ViewAppointmentModalProps) => {
  if (!appointment) return null;

  const appointmentDate = new Date(appointment.date);
  const formattedDate = format(appointmentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  const handleEdit = () => {
    onEdit(appointment);
  };

  const handleDelete = () => {
    onDelete(appointment.id);
  };

  const handleMarkAttendance = () => {
    if (onMarkAttendance && !appointment.attended) {
      onMarkAttendance(appointment.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Detalhes do Agendamento</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{formattedDate}</p>
                  <p className="text-lg font-bold text-primary">{appointment.time}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-sm">
                  {appointment.serviceType}
                </Badge>
                {appointment.attended && (
                  <Badge variant="default" className="text-sm bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Compareceu
                  </Badge>
                )}
              </div>
            </div>

            {/* Unit Info */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center space-x-2 mb-2">
                <Building className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">Unidade:</span>
              </div>
              {unit ? (
                <div className="bg-background border border-border rounded-md p-3 space-y-1">
                  <p className="font-medium text-foreground">{unit.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {unit.address}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {unit.phone}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-500 italic">Unidade Removida</p>
              )}
            </div>

            {appointment.notes && (
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                <p className="text-foreground">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-foreground">Informações do Cliente</h3>
            </div>

            {lead ? (
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-lg text-foreground">{lead.name}</p>
                  {lead.cpf && (
                    <p className="text-sm text-muted-foreground">CPF: ***.***.***-{lead.cpf.slice(-2)}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-foreground">{lead.phone}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-foreground">{lead.email}</span>
                  </div>
                </div>

                {lead.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                    <span className="text-sm text-foreground">{lead.address}</span>
                  </div>
                )}

                {lead.carModel && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-border">
                    <Car className="h-4 w-4 text-orange-500" />
                    <div>
                      <span className="text-sm font-medium text-foreground">{lead.carModel}</span>
                      {lead.carPlate && (
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {lead.carPlate}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Cliente não encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  O lead associado a este agendamento pode ter sido removido
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </Button>

              {onMarkAttendance && !appointment.attended && (
                <Button
                  variant="default"
                  onClick={handleMarkAttendance}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Marcar Comparecimento</span>
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button onClick={handleEdit} className="flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewAppointmentModal;
