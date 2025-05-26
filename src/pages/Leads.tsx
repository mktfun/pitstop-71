
import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Kanban, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KanbanView from '@/components/leads/KanbanView';
import ListView from '@/components/leads/ListView';
import AddLeadModal from '@/components/leads/AddLeadModal';
import LeadDetailsModal from '@/components/leads/LeadDetailsModal';
import { updateLeadStatus, addLeadHistoryEntry, KANBAN_COLUMNS, HISTORY_TYPES } from '@/utils/leadAutomation';

export interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface LeadHistoryEntry {
  timestamp: string;
  type: string;
  description: string;
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
  history: LeadHistoryEntry[];
}

type ViewMode = 'kanban' | 'list';

const Leads = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
        // Initialize with 11 default columns for complete workflow
        const defaultColumns: KanbanColumn[] = [
          { id: 'col-prospect', name: 'Prospecto', color: 'blue', order: 0 },
          { id: 'col-first-contact', name: 'Primeiro Contato', color: 'yellow', order: 1 },
          { id: 'col-qualification', name: 'Qualificação', color: 'orange', order: 2 },
          { id: 'col-proposal', name: 'Proposta Enviada', color: 'purple', order: 3 },
          { id: 'col-negotiation', name: 'Negociação', color: 'pink', order: 4 },
          { id: 'col-scheduled', name: 'Agendado', color: 'green', order: 5 },
          { id: 'col-in-service', name: 'Em Atendimento', color: 'red', order: 6 },
          { id: 'col-waiting-parts', name: 'Aguardando Peças', color: 'gray', order: 7 },
          { id: 'col-completed', name: 'Serviço Concluído', color: 'green', order: 8 },
          { id: 'col-invoiced', name: 'Faturado', color: 'blue', order: 9 },
          { id: 'col-closed', name: 'Fechado', color: 'green', order: 10 }
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

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'columnId' | 'history'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      columnId: KANBAN_COLUMNS.PROSPECT,
      history: [{
        timestamp: new Date().toISOString(),
        type: HISTORY_TYPES.CREATION,
        description: 'Lead criado'
      }]
    };

    saveLeads([...leads, newLead]);
    setIsAddLeadModalOpen(false);
  };

  const handleEditLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'columnId' | 'history'>) => {
    if (!editingLead) return;

    const updatedLeads = leads.map(lead =>
      lead.id === editingLead.id
        ? { 
            ...lead, 
            ...leadData,
            history: [
              {
                timestamp: new Date().toISOString(),
                type: HISTORY_TYPES.EDIT,
                description: 'Dados do lead atualizados'
              },
              ...lead.history
            ]
          }
        : lead
    );

    saveLeads(updatedLeads);
    setEditingLead(null);
  };

  const handleLeadMove = (leadId: string, newColumnId: string) => {
    const targetColumn = columns.find(col => col.id === newColumnId);
    if (!targetColumn) return;

    // Usar função utilitária para atualizar lead
    updateLeadStatus({
      leadId,
      newColumnId,
      historyType: HISTORY_TYPES.STAGE_CHANGE,
      historyDescription: `Movido para '${targetColumn.name}'`
    });

    // Recarregar dados para refletir mudanças
    loadData();
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
  };

  const openDetailsModal = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
      const updatedLeads = leads.filter(lead => lead.id !== leadId);
      saveLeads(updatedLeads);
      setSelectedLead(null);
    }
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
        <Button onClick={() => setIsAddLeadModalOpen(true)} className="bg-primary hover:bg-primary/90">
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
          onLeadMove={handleLeadMove}
          onEditLead={openEditModal}
          onViewLead={openDetailsModal}
        />
      ) : (
        <ListView
          columns={columns}
          leads={leads}
          onEditLead={openEditModal}
          onViewLead={openDetailsModal}
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

      {/* Lead Details Modal */}
      <LeadDetailsModal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        onEdit={openEditModal}
        onDelete={handleDeleteLead}
        columns={columns}
      />
    </div>
  );
};

export default Leads;
