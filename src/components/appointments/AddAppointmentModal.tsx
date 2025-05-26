
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => void;
  leads: Lead[];
  units: Unit[];
  editingAppointment?: Appointment | null;
}

const AddAppointmentModal = ({ isOpen, onClose, onSave, leads, units, editingAppointment }: AddAppointmentModalProps) => {
  const [formData, setFormData] = useState({
    leadId: '',
    unitId: '',
    date: '',
    time: '',
    serviceId: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [services, setServices] = useState<Service[]>([]);

  // Load services from localStorage
  useEffect(() => {
    const loadServices = () => {
      try {
        const storedServices = localStorage.getItem('pitstop_services');
        if (storedServices) {
          const parsedServices = JSON.parse(storedServices);
          setServices(parsedServices);
        }
      } catch (error) {
        console.error('Error loading services:', error);
        setServices([]);
      }
    };

    loadServices();
  }, [isOpen]);

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        leadId: editingAppointment.leadId,
        unitId: editingAppointment.unitId,
        date: editingAppointment.date,
        time: editingAppointment.time,
        serviceId: editingAppointment.serviceId || '',
        notes: editingAppointment.notes || ''
      });
    } else {
      setFormData({
        leadId: '',
        unitId: '',
        date: '',
        time: '',
        serviceId: '',
        notes: ''
      });
    }
    setErrors({});
  }, [editingAppointment, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.leadId) {
      newErrors.leadId = 'Selecione um lead';
    }

    if (!formData.unitId) {
      newErrors.unitId = 'Selecione uma unidade';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.time) {
      newErrors.time = 'Horário é obrigatório';
    }

    if (!formData.serviceId) {
      newErrors.serviceId = 'Selecione um serviço';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      leadId: '',
      unitId: '',
      date: '',
      time: '',
      serviceId: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const getSelectedLead = () => {
    return leads.find(lead => lead.id === formData.leadId);
  };

  const getSelectedUnit = () => {
    return units.find(unit => unit.id === formData.unitId);
  };

  const getSelectedService = () => {
    return services.find(service => service.id === formData.serviceId);
  };

  const selectedLead = getSelectedLead();
  const selectedUnit = getSelectedUnit();
  const selectedService = getSelectedService();

  // Get active services
  const activeServices = services.filter(service => service.isActive);

  // Check if units and services are available
  const isUnitsAvailable = units.length > 0;
  const isServicesAvailable = activeServices.length > 0;
  const isFormDisabled = !isUnitsAvailable || !isServicesAvailable;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        
        {!isUnitsAvailable && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">
              Cadastre unidades nas Configurações antes de criar agendamentos.{' '}
              <a href="/configuracoes" className="underline font-medium">Ir para Configurações</a>
            </p>
          </div>
        )}

        {!isServicesAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              Cadastre serviços ativos nas Configurações antes de criar agendamentos.{' '}
              <a href="/configuracoes" className="underline font-medium">Ir para Configurações</a>
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lead Selection */}
          <div className="space-y-2">
            <Label htmlFor="leadId">Cliente *</Label>
            <Select 
              value={formData.leadId} 
              onValueChange={(value) => setFormData({ ...formData, leadId: value })}
              disabled={isFormDisabled}
            >
              <SelectTrigger className={errors.leadId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{lead.name}</span>
                      <span className="text-sm text-muted-foreground">{lead.phone}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leadId && <p className="text-red-500 text-sm">{errors.leadId}</p>}
            
            {/* Lead info preview */}
            {selectedLead && (
              <div className="bg-muted/50 rounded-md p-3 space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Email:</span> {selectedLead.email}
                </div>
                {selectedLead.carModel && (
                  <div className="text-sm">
                    <span className="font-medium">Veículo:</span> {selectedLead.carModel}
                    {selectedLead.carPlate && ` - ${selectedLead.carPlate}`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unit Selection */}
          <div className="space-y-2">
            <Label htmlFor="unitId">Unidade do Agendamento *</Label>
            <Select 
              value={formData.unitId} 
              onValueChange={(value) => setFormData({ ...formData, unitId: value })}
              disabled={isFormDisabled}
            >
              <SelectTrigger className={errors.unitId ? 'border-red-500' : ''}>
                <SelectValue placeholder="-- Selecione a Unidade --" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unitId && <p className="text-red-500 text-sm">{errors.unitId}</p>}
            
            {/* Unit info preview */}
            {selectedUnit && (
              <div className="bg-muted/50 rounded-md p-3 space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Endereço:</span> {selectedUnit.address}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Telefone:</span> {selectedUnit.phone}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={errors.date ? 'border-red-500' : ''}
                disabled={isFormDisabled}
              />
              {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={errors.time ? 'border-red-500' : ''}
                disabled={isFormDisabled}
              />
              {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="serviceId">Serviço *</Label>
            <Select 
              value={formData.serviceId} 
              onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
              disabled={isFormDisabled}
            >
              <SelectTrigger className={errors.serviceId ? 'border-red-500' : ''}>
                <SelectValue placeholder="-- Selecione o Serviço --" />
              </SelectTrigger>
              <SelectContent>
                {activeServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-sm text-muted-foreground">{formatPrice(service.price)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceId && <p className="text-red-500 text-sm">{errors.serviceId}</p>}
            
            {/* Service info preview */}
            {selectedService && (
              <div className="bg-muted/50 rounded-md p-3 space-y-1">
                <div className="text-sm">
                  <span className="font-medium">Preço:</span> {formatPrice(selectedService.price)}
                </div>
                {selectedService.estimatedTime && (
                  <div className="text-sm">
                    <span className="font-medium">Tempo estimado:</span> {selectedService.estimatedTime} min
                  </div>
                )}
                {selectedService.description && (
                  <div className="text-sm">
                    <span className="font-medium">Descrição:</span> {selectedService.description}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais sobre o agendamento"
              rows={3}
              disabled={isFormDisabled}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={isFormDisabled}
            >
              {editingAppointment ? 'Salvar Alterações' : 'Criar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointmentModal;
