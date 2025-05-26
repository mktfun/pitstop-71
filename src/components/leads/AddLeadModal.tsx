
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
  }, [editingLead, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      alert('Nome, telefone e email são obrigatórios');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Por favor, insira um email válido');
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingLead ? 'Editar Lead' : 'Adicionar Novo Lead'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, número, cidade - UF"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carModel">Modelo do Carro</Label>
              <Input
                id="carModel"
                value={formData.carModel}
                onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                placeholder="Ex: Honda Civic 2020"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carPlate">Placa do Carro</Label>
              <Input
                id="carPlate"
                value={formData.carPlate}
                onChange={(e) => setFormData({ ...formData, carPlate: e.target.value })}
                placeholder="ABC-1234"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingLead ? 'Salvar Alterações' : 'Adicionar Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadModal;
