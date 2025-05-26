
import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Trash2, FileText, Car, Wrench, Calendar, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceOrder, ServiceOrderService, OS_STATUS } from '@/types/serviceOrder';
import { getLeadName, getActiveServices, getServiceName, Service } from '@/utils/serviceOrderUtils';

interface ServiceOrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceOrder: ServiceOrder | null;
  onSave: (updatedOrder: ServiceOrder) => void;
  onDelete?: (orderId: string) => void;
}

const ServiceOrderDetailsModal = ({ isOpen, onClose, serviceOrder, onSave, onDelete }: ServiceOrderDetailsModalProps) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<ServiceOrder | null>(null);
  const [leadName, setLeadName] = useState('');
  const [activeServices, setActiveServices] = useState<Service[]>([]);

  useEffect(() => {
    if (serviceOrder) {
      setFormData({ 
        ...serviceOrder,
        serviceId: serviceOrder.serviceId || 'none'
      });
      setLeadName(getLeadName(serviceOrder.leadId));
      setActiveServices(getActiveServices());
    }
  }, [serviceOrder]);

  if (!serviceOrder || !formData) return null;

  const addService = () => {
    const newService: ServiceOrderService = {
      serviceId: `service_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      description: '',
      parts: '',
      cost: 0
    };
    setFormData({
      ...formData,
      services: [...formData.services, newService]
    });
  };

  const updateService = (index: number, field: keyof ServiceOrderService, value: string | number) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    setFormData({
      ...formData,
      services: updatedServices
    });
  };

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    });
  };

  const handleSave = () => {
    const updatedOrder = {
      ...formData,
      serviceId: formData.serviceId === 'none' ? undefined : formData.serviceId
    };
    onSave(updatedOrder);
    setEditMode(false);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta OS? Esta ação não pode ser desfeita.')) {
      onDelete?.(serviceOrder.id);
      onClose();
    }
  };

  const totalCost = formData.services.reduce((sum, service) => sum + service.cost, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case OS_STATUS.DIAGNOSIS: return 'bg-blue-100 text-blue-800';
      case OS_STATUS.WAITING_PARTS: return 'bg-orange-100 text-orange-800';
      case OS_STATUS.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
      case OS_STATUS.COMPLETED: return 'bg-green-100 text-green-800';
      case OS_STATUS.WAITING_PICKUP: return 'bg-purple-100 text-purple-800';
      case OS_STATUS.PAID: return 'bg-emerald-100 text-emerald-800';
      case OS_STATUS.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>OS #{serviceOrder.osNumber}</span>
              <Badge className={getStatusColor(formData.status)}>
                {formData.status}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {!editMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    Editar
                  </Button>
                  {onDelete && (
                    <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <div className="p-2 bg-muted rounded">
                {leadName}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              {editMode ? (
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OS_STATUS).map(status => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2">
                  <Badge className={getStatusColor(formData.status)}>
                    {formData.status}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Serviço Principal */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Briefcase className="h-4 w-4" />
              <span>Serviço Principal</span>
            </Label>
            {editMode ? (
              <Select 
                value={formData.serviceId || 'none'} 
                onValueChange={(value) => setFormData({ ...formData, serviceId: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Nenhum / Serviço Avulso --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Nenhum / Serviço Avulso --</SelectItem>
                  {activeServices.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {service.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-muted rounded">
                {getServiceName(formData.serviceId)}
              </div>
            )}
          </div>

          {/* Informações do Veículo */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-1">
              <Car className="h-4 w-4" />
              <span>Veículo</span>
            </Label>
            {editMode ? (
              <Input
                value={formData.vehicleInfo}
                onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
              />
            ) : (
              <div className="p-2 bg-muted rounded">
                {formData.vehicleInfo}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Problemas Relatados</Label>
            {editMode ? (
              <Textarea
                value={formData.reportedIssues}
                onChange={(e) => setFormData({ ...formData, reportedIssues: e.target.value })}
                className="min-h-[100px]"
              />
            ) : (
              <div className="p-3 bg-muted rounded min-h-[100px]">
                {formData.reportedIssues}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center space-x-1">
                <Wrench className="h-4 w-4" />
                <span>Serviços</span>
              </Label>
              {editMode && (
                <Button type="button" onClick={addService} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Serviço
                </Button>
              )}
            </div>

            {formData.services.map((service, index) => (
              <Card key={service.serviceId}>
                <CardContent className="p-4">
                  {editMode ? (
                    <div className="flex items-start space-x-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <Label>Descrição do Serviço</Label>
                          <Textarea
                            value={service.description}
                            onChange={(e) => updateService(index, 'description', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Valor (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={service.cost}
                            onChange={(e) => updateService(index, 'cost', parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Label>Peças Necessárias</Label>
                          <Input
                            value={service.parts}
                            onChange={(e) => updateService(index, 'parts', e.target.value)}
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
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{service.description || 'Serviço sem descrição'}</h4>
                        <Badge variant="outline">
                          R$ {service.cost.toFixed(2)}
                        </Badge>
                      </div>
                      {service.parts && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Peças:</strong> {service.parts}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {formData.services.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum serviço cadastrado</p>
              </div>
            )}

            {formData.services.length > 0 && (
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total dos Serviços</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {totalCost.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Data de Criação</span>
              </Label>
              <div className="p-2 bg-muted rounded">
                {new Date(formData.createdAt).toLocaleString('pt-BR')}
              </div>
            </div>
            
            {formData.completedAt && (
              <div className="space-y-2">
                <Label className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Data de Conclusão</span>
                </Label>
                <div className="p-2 bg-muted rounded">
                  {new Date(formData.completedAt).toLocaleString('pt-BR')}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceOrderDetailsModal;
