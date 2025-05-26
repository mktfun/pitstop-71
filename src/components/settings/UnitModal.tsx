
import React, { useState, useEffect } from 'react';
import { X } from 'react-feather';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Unit } from './UnitsManagement';

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: Omit<Unit, 'id' | 'createdAt'>) => void;
  unit?: Unit | null;
}

const UnitModal: React.FC<UnitModalProps> = ({ isOpen, onClose, onSave, unit }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form when modal opens/closes or unit changes
  useEffect(() => {
    if (isOpen) {
      if (unit) {
        setFormData({
          name: unit.name,
          address: unit.address,
          phone: unit.phone,
        });
      } else {
        setFormData({
          name: '',
          address: '',
          phone: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, unit]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da unidade é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave({
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
      });
    }
  };

  const handleClose = () => {
    setFormData({ name: '', address: '', phone: '' });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {unit ? 'Editar Unidade' : 'Adicionar Nova Unidade'}
          </DialogTitle>
          <DialogDescription>
            {unit 
              ? 'Modifique as informações da unidade conforme necessário.'
              : 'Preencha as informações da nova unidade da mecânica.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Nome da Unidade *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.name ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Ex: Oficina Centro, Filial Norte..."
            />
            {errors.name && (
              <p className="mt-1 text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Endereço Field */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
              Endereço
            </label>
            <input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: Rua das Flores, 123 - Centro"
            />
          </div>

          {/* Telefone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Ex: (11) 99999-9999"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {unit ? 'Salvar Alterações' : 'Adicionar Unidade'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnitModal;
