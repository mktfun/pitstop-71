
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Lead } from '@/pages/Leads';

interface Unit {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
}

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
    carPlate: '',
    unitId: '',
    history: [] as Array<{timestamp: string; type: string; description: string}>
  });

  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [units, setUnits] = useState<Unit[]>([]);

  // Load units from localStorage
  useEffect(() => {
    try {
      const storedUnits = localStorage.getItem('pitstop_units');
      if (storedUnits) {
        setUnits(JSON.parse(storedUnits));
      }
    } catch (error) {
      console.error('Error loading units:', error);
    }
  }, [isOpen]);

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
        carPlate: editingLead.carPlate || '',
        unitId: editingLead.unitId || '',
        history: editingLead.history
      });
      if (editingLead.birthDate) {
        setBirthDate(new Date(editingLead.birthDate));
      }
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        birthDate: '',
        cpf: '',
        carModel: '',
        carPlate: '',
        unitId: '',
        history: []
      });
      setBirthDate(undefined);
    }
  }, [editingLead, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setBirthDate(date);
    setFormData(prev => ({
      ...prev,
      birthDate: date ? format(date, 'yyyy-MM-dd') : ''
    }));
  };

  const handleUnitChange = (value: string) => {
    // Convert "none" back to empty string for storage
    const unitId = value === 'none' ? '' : value;
    setFormData(prev => ({ ...prev, unitId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const leadData = {
      ...formData,
      carModel: formData.carModel || undefined,
      carPlate: formData.carPlate || undefined,
      unitId: formData.unitId || undefined,
    };

    onSave(leadData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingLead ? 'Editar Lead' : 'Novo Lead'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  required
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? format(birthDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="unitId">Unidade Associada</Label>
                <Select value={formData.unitId || 'none'} onValueChange={handleUnitChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Nenhuma --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Nenhuma --</SelectItem>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Contato</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Endereço Completo</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Rua, número, bairro, cidade, CEP"
                rows={3}
              />
            </div>
          </div>

          {/* Veículo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Veículo (Opcional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carModel">Modelo do Veículo</Label>
                <Input
                  id="carModel"
                  name="carModel"
                  value={formData.carModel}
                  onChange={handleInputChange}
                  placeholder="Ex: Honda Civic 2020"
                />
              </div>

              <div>
                <Label htmlFor="carPlate">Placa do Veículo</Label>
                <Input
                  id="carPlate"
                  name="carPlate"
                  value={formData.carPlate}
                  onChange={handleInputChange}
                  placeholder="ABC-1234"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingLead ? 'Salvar Alterações' : 'Criar Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadModal;
