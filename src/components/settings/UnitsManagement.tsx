
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, MapPin } from 'react-feather';
import UnitModal from './UnitModal';

export interface Unit {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
}

const UnitsManagement = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Load units from localStorage on component mount
  useEffect(() => {
    try {
      const storedUnits = localStorage.getItem('pitstop_units');
      if (storedUnits) {
        const parsedUnits = JSON.parse(storedUnits);
        if (Array.isArray(parsedUnits)) {
          setUnits(parsedUnits);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar unidades do localStorage:', error);
      setUnits([]);
    }
  }, []);

  // Save units to localStorage
  const saveUnitsToStorage = (updatedUnits: Unit[]) => {
    try {
      localStorage.setItem('pitstop_units', JSON.stringify(updatedUnits));
      setUnits(updatedUnits);
    } catch (error) {
      console.error('Erro ao salvar unidades no localStorage:', error);
    }
  };

  const handleAddUnit = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleDeleteUnit = (unit: Unit) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a unidade "${unit.name}"? Esta ação não pode ser desfeita.`
    );
    
    if (confirmDelete) {
      const updatedUnits = units.filter(u => u.id !== unit.id);
      saveUnitsToStorage(updatedUnits);
    }
  };

  const handleSaveUnit = (unitData: Omit<Unit, 'id' | 'createdAt'>) => {
    if (editingUnit) {
      // Update existing unit
      const updatedUnits = units.map(unit =>
        unit.id === editingUnit.id
          ? { ...unit, ...unitData }
          : unit
      );
      saveUnitsToStorage(updatedUnits);
    } else {
      // Add new unit
      const newUnit: Unit = {
        id: `unit-${Date.now()}`,
        ...unitData,
        createdAt: new Date().toISOString(),
      };
      const updatedUnits = [...units, newUnit];
      saveUnitsToStorage(updatedUnits);
    }
    setIsModalOpen(false);
    setEditingUnit(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Gerenciamento de Unidades</h2>
        </div>
        <button
          onClick={handleAddUnit}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Adicionar Nova Unidade
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {units.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-accent/50 rounded-full p-6 mb-4">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma unidade cadastrada
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Clique em "Adicionar Nova Unidade" para começar a gerenciar as filiais da sua oficina.
            </p>
            <button
              onClick={handleAddUnit}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Adicionar Nova Unidade
            </button>
          </div>
        ) : (
          // Units table
          <div className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Endereço</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Telefone</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit, index) => (
                    <tr 
                      key={unit.id} 
                      className={`border-b border-border hover:bg-muted/25 transition-colors ${
                        index === units.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{unit.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-muted-foreground">
                          {unit.address || <span className="italic">Não informado</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-muted-foreground">
                          {unit.phone || <span className="italic">Não informado</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditUnit(unit)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Editar unidade"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Excluir unidade"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <UnitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUnit(null);
        }}
        onSave={handleSaveUnit}
        unit={editingUnit}
      />
    </div>
  );
};

export default UnitsManagement;
