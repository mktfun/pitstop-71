
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
import { Lead } from '@/pages/Leads';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Omit<Lead, 'id' | 'createdAt' | 'columnId'>) => void;
  editingLead?: Lead | null;
}

const AddLeadModal = ({ isOpen, onClose, onSave, editingLead }: AddLeadModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    birthDate: '',
    cpf: '',
    carModel: '',
    carPlate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingLead) {
      setFormData({
        name: editingLead.name,
        phone: editingLead.phone,
        email: editingLead.email,
        address: editingLead.address,
        birthDate: editingLead.birthDate,
        cpf: editingLead.cpf,
        carModel: editingLead.carModel || '',
        carPlate: editingLead.carPlate || ''
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        birthDate: '',
        cpf: '',
        carModel: '',
        carPlate: ''
      });
    }
    setErrors({});
  }, [editingLead, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email deve ter um formato válido';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else {
      // Basic CPF validation (just length and numbers)
      const cpfNumbers = formData.cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11) {
        newErrors.cpf = 'CPF deve ter 11 dígitos';
      }
    }

    // Phone validation
    const phoneNumbers = formData.phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      ...formData,
      carModel: formData.carModel || undefined,
      carPlate: formData.carPlate || undefined
    });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      birthDate: '',
      cpf: '',
      carModel: '',
      carPlate: ''
    });
    setErrors({});
    onClose();
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingLead ? 'Editar Lead' : 'Adicionar Novo Lead'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo do lead"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            
            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                placeholder="(11) 99999-9999"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Endereço */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, bairro, cidade - UF"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                placeholder="000.000.000-00"
                className={errors.cpf ? 'border-red-500' : ''}
              />
              {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf}</p>}
            </div>

            {/* Modelo do Carro */}
            <div className="space-y-2">
              <Label htmlFor="carModel">Modelo do Carro</Label>
              <Input
                id="carModel"
                value={formData.carModel}
                onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                placeholder="Ex: Honda Civic 2020"
              />
            </div>

            {/* Placa do Carro */}
            <div className="space-y-2">
              <Label htmlFor="carPlate">Placa do Carro</Label>
              <Input
                id="carPlate"
                value={formData.carPlate}
                onChange={(e) => setFormData({ ...formData, carPlate: e.target.value.toUpperCase() })}
                placeholder="ABC-1234"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {editingLead ? 'Salvar Alterações' : 'Adicionar Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadModal;
