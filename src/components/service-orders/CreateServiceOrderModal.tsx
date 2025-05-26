
import React, { useState, useEffect } from 'react';
import { Plus, X, Car, FileText, Wrench } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceOrderService, OS_STATUS } from '@/types/serviceOrder';
import { Lead } from '@/pages/Leads';
import { getAvailableLeads } from '@/utils/serviceOrderUtils';

interface CreateServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: {
    leadId: string;
    vehicleInfo: string;
    reportedIssues: string;
    services: ServiceOrderService[];
    status: string;
  }) => void;
}

const CreateServiceOrderModal = ({ isOpen, onClose, onSave }: CreateServiceOrderModalProps) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [formData, setFormData] = useState({
    leadId: '',
    vehicleInfo: '',
    reportedIssues: '',
    status: OS_STATUS.DIAGNOSIS
  });
  const [services, setServices] = useState<ServiceOrderService[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLeads(getAvailableLeads());
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      leadId: '',
      vehicleInfo: '',
      reportedIssues: '',
      status: OS_STATUS.DIAGNOSIS
    });
    setServices([]);
  };

  const handleLeadChange = (leadId: string) => {
    setFormData(prev => ({ ...prev, leadId }));
    
    // Pré-preencher informações do veículo
    const selectedLead = leads.find(lead => lead.id === leadId);
    if (selectedLead) {
      const vehicleInfo = [selectedLead.carModel, selectedLead.carPlate].filter(Boolean).join(' - ');
      setFormData(prev => ({ ...prev, vehicleInfo }));
    }
  };

  const addService = () => {
    const newService: ServiceOrderService = {
      serviceId: `service_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      description: '',
      parts: '',
      cost: 0
    };
    setServices([...services, newService]);
  };

  const updateService = (index: number, field: keyof ServiceOrderService, value: string | number) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setServices(updatedServices);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leadId) {
      alert('Selecione um lead para criar a OS');
      return;
    }

    onSave({
      ...formData,
      services
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Nova Ordem de Serviço</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leadId">Cliente *</Label>
              <Select value={formData.leadId} onValueChange={handleLeadChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {leads.length === 0 ? (
                    <SelectItem value="no-leads" disabled>
                      Nenhum lead encontrado
                    </SelectItem>
                  ) : (
                    leads.map(lead => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} - {lead.phone}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {leads.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  <a href="/leads" className="text-primary hover:underline">
                    Cadastre leads primeiro
                  </a>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Inicial</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OS_STATUS.DIAGNOSIS}>Diagnóstico</SelectItem>
                  <SelectItem value={OS_STATUS.WAITING_PARTS}>Aguardando Peças</SelectItem>
                  <SelectItem value={OS_STATUS.IN_PROGRESS}>Em Execução</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleInfo" className="flex items-center space-x-1">
              <Car className="h-4 w-4" />
              <span>Informações do Veículo</span>
            </Label>
            <Input
              id="vehicleInfo"
              value={formData.vehicleInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleInfo: e.target.value }))}
              placeholder="Ex: Honda Civic 2020 - ABC-1234"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportedIssues">Problemas Relatados</Label>
            <Textarea
              id="reportedIssues"
              value={formData.reportedIssues}
              onChange={(e) => setFormData(prev => ({ ...prev, reportedIssues: e.target.value }))}
              placeholder="Descreva os problemas relatados pelo cliente"
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-1">
                <Wrench className="h-4 w-4" />
                <span>Serviços</span>
              </Label>
              <Button type="button" onClick={addService} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Serviço
              </Button>
            </div>

            {services.map((service, index) => (
              <Card key={service.serviceId}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor={`service-description-${index}`}>Descrição do Serviço</Label>
                        <Textarea
                          id={`service-description-${index}`}
                          value={service.description}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          placeholder="Descrição do serviço a ser realizado"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`service-cost-${index}`}>Valor (R$)</Label>
                        <Input
                          id={`service-cost-${index}`}
                          type="number"
                          step="0.01"
                          value={service.cost}
                          onChange={(e) => updateService(index, 'cost', parseFloat(e.target.value) || 0)}
                          placeholder="0,00"
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label htmlFor={`service-parts-${index}`}>Peças Necessárias</Label>
                        <Input
                          id={`service-parts-${index}`}
                          value={service.parts}
                          onChange={(e) => updateService(index, 'parts', e.target.value)}
                          placeholder="Liste as peças necessárias"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeService(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {services.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum serviço adicionado</p>
                <p className="text-sm">Clique em "Adicionar Serviço" para começar</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.leadId}>
              Criar Ordem de Serviço
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServiceOrderModal;
