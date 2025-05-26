
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
import { KanbanColumn } from '@/pages/Leads';

interface EditColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<KanbanColumn>) => void;
  column: KanbanColumn;
}

const colorOptions = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-200' },
  { value: 'yellow', label: 'Amarelo', class: 'bg-yellow-200' },
  { value: 'orange', label: 'Laranja', class: 'bg-orange-200' },
  { value: 'green', label: 'Verde', class: 'bg-green-200' },
  { value: 'red', label: 'Vermelho', class: 'bg-red-200' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-200' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-200' },
  { value: 'gray', label: 'Cinza', class: 'bg-gray-200' },
];

const EditColumnModal = ({ isOpen, onClose, onSave, column }: EditColumnModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    color: 'blue'
  });

  useEffect(() => {
    if (column) {
      setFormData({
        name: column.name,
        color: column.color
      });
    }
  }, [column]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Coluna</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Coluna</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome da etapa"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-full h-10 rounded-md border-2 ${color.class} ${
                    formData.color === color.value 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-gray-200'
                  } transition-all duration-200`}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditColumnModal;
