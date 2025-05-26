
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Service } from './ServicesManagement';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => void;
  service?: Service | null;
}

const ServiceModal = ({ isOpen, onClose, onSubmit, service }: ServiceModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    estimatedTime: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or service changes
  useEffect(() => {
    if (isOpen) {
      if (service) {
        setFormData({
          name: service.name,
          description: service.description || '',
          price: service.price.toString(),
          estimatedTime: service.estimatedTime?.toString() || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          estimatedTime: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, service]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Preço é obrigatório';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Preço deve ser um número maior que zero';
      }
    }

    if (formData.estimatedTime.trim()) {
      const time = parseInt(formData.estimatedTime);
      if (isNaN(time) || time <= 0) {
        newErrors.estimatedTime = 'Tempo deve ser um número positivo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const serviceData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: parseFloat(formData.price),
      estimatedTime: formData.estimatedTime.trim() ? parseInt(formData.estimatedTime) : undefined,
    };

    onSubmit(serviceData);
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome do Serviço *
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Troca de óleo"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição opcional do serviço"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Preço (R$) *
            </label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0,00"
              className={errors.price ? 'border-destructive' : ''}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price}</p>
            )}
          </div>

          {/* Estimated Time */}
          <div className="space-y-2">
            <label htmlFor="estimatedTime" className="text-sm font-medium">
              Tempo Estimado (minutos)
            </label>
            <Input
              id="estimatedTime"
              type="number"
              min="1"
              value={formData.estimatedTime}
              onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
              placeholder="Ex: 30"
              className={errors.estimatedTime ? 'border-destructive' : ''}
            />
            {errors.estimatedTime && (
              <p className="text-sm text-destructive">{errors.estimatedTime}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {service ? 'Salvar Alterações' : 'Adicionar Serviço'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceModal;
