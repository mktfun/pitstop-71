
import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Kanban, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KanbanView from '@/components/leads/KanbanView';
import ListView from '@/components/leads/ListView';
import AddLeadModal from '@/components/leads/AddLeadModal';

export interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  cpf: string;
  carModel?: string;
  carPlate?: string;
  createdAt: string;
  columnId: string;
}

type ViewMode = 'kanban' | 'list';

const Leads = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load columns
      const storedColumns = localStorage.getItem('pitstop_kanban_columns');
      if (storedColumns) {
        setColumns(JSON.parse(storedColumns));
      } else {
        // Initialize with default columns
        const defaultColumns: KanbanColumn[] = [
          { id: 'prospecto', name: 'Prospecto', color: 'blue', order: 0 },
          { id: 'contato', name: 'Primeiro Contato', color: 'yellow', order: 1 },
          { id: 'proposta', name: 'Proposta Enviada', color: 'orange', order: 2 },
          { id: 'fechado', name: 'Fechado', color: 'green', order: 3 }
        ];
        setColumns(defaultColumns);
        localStorage.setItem('pitstop_kanban_columns', JSON.stringify(defaultColumns));
      }

      // Load leads
      const storedLeads = localStorage.getItem('pitstop_leads');
      if (storedLeads) {
        setLeads(JSON.parse(storedLeads));
      }
    } catch (error) {
      console.error('Error loading leads data:', error);
    }
  };

  const saveColumns = (newColumns: KanbanColumn[]) => {
    setColumns(newColumns);
    localStorage.setItem('pitstop_kanban_columns', JSON.stringify(newColumns));
  };

  const saveLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    localStorage.setItem('pitstop_leads', JSON.stringify(newLeads));
  };

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'columnId'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      columnId: columns[0]?.id || 'prospecto'
    };

    saveLeads([...leads, newLead]);
    setIsAddLeadModalOpen(false);
  };

  const handleEditLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'columnId'>) => {
    if (!editingLead) return;

    const updatedLeads = leads.map(lead =>
      lead.id === editingLead.id
        ? { ...lead, ...leadData }
        : lead
    );

    saveLeads(updatedLeads);
    setEditingLead(null);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground">Gerencie seus leads e oportunidades</p>
          </div>
        </div>
        <Button onClick={() => setIsAddLeadModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* View Mode Selector */}
      <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={viewMode === 'kanban' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('kanban')}
          className="flex items-center space-x-2"
        >
          <Kanban className="h-4 w-4" />
          <span>Kanban</span>
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('list')}
          className="flex items-center space-x-2"
        >
          <List className="h-4 w-4" />
          <span>Lista</span>
        </Button>
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <KanbanView
          columns={columns}
          leads={leads}
          onColumnsChange={saveColumns}
          onLeadsChange={saveLeads}
          onEditLead={openEditModal}
        />
      ) : (
        <ListView
          columns={columns}
          leads={leads}
          onEditLead={openEditModal}
        />
      )}

      {/* Add/Edit Lead Modal */}
      <AddLeadModal
        isOpen={isAddLeadModalOpen || !!editingLead}
        onClose={() => {
          setIsAddLeadModalOpen(false);
          setEditingLead(null);
        }}
        onSave={editingLead ? handleEditLead : handleAddLead}
        editingLead={editingLead}
      />
    </div>
  );
};

export default Leads;
