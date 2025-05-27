import React, { useState, useEffect } from 'react';
import { Kanban, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveOrganization } from '@/hooks/useActiveOrganization';
import KanbanView from '@/components/leads/KanbanView';
import ListView from '@/components/leads/ListView';
import AddLeadModal from '@/components/leads/AddLeadModal';
import LeadDetailsModal from '@/components/leads/LeadDetailsModal';

export interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface LeadHistoryEntry {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  user_id?: string;
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
  unitId?: string;
  createdAt: string;
  columnId: string;
  organizationId: string;
  assignedUserId?: string;
  history: LeadHistoryEntry[];
}

type ViewMode = 'kanban' | 'list';

const Leads = () => {
  const { user } = useAuth();
  const { organization, isLoading: orgLoading } = useActiveOrganization();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (organization && !orgLoading) {
      loadData();
    }
  }, [organization, orgLoading]);

  const loadData = async () => {
    if (!organization) return;

    setIsLoading(true);
    try {
      await Promise.all([loadColumns(), loadLeads()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos leads",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadColumns = async () => {
    if (!organization) return;

    try {
      // Buscar colunas existentes
      const { data: existingColumns, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('organization_id', organization.id)
        .order('order');

      if (error) throw error;

      if (existingColumns && existingColumns.length > 0) {
        setColumns(existingColumns.map(col => ({
          id: col.id,
          name: col.name,
          color: col.color,
          order: col.order
        })));
      } else {
        // Criar colunas padrão se não existirem
        await createDefaultColumns();
      }
    } catch (error) {
      console.error('Erro ao carregar colunas:', error);
      throw error;
    }
  };

  const createDefaultColumns = async () => {
    if (!organization) return;

    const defaultColumns = [
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

    const columnsToInsert = defaultColumns.map(col => ({
      ...col,
      organization_id: organization.id
    }));

    const { error } = await supabase
      .from('kanban_columns')
      .insert(columnsToInsert);

    if (error) throw error;

    setColumns(defaultColumns);
  };

  const loadLeads = async () => {
    if (!organization) return;

    try {
      const { data: leadsData, error } = await supabase
        .from('leads')
        .select(`
          *,
          lead_history (
            id,
            timestamp,
            type,
            description,
            user_id
          )
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLeads: Lead[] = (leadsData || []).map(lead => ({
        id: lead.id,
        name: lead.name,
        phone: lead.phone || '',
        email: lead.email || '',
        address: lead.address || '',
        birthDate: lead.birth_date || '',
        cpf: lead.cpf || '',
        carModel: lead.car_model,
        carPlate: lead.car_plate,
        unitId: lead.unit_id,
        createdAt: lead.created_at,
        columnId: lead.column_id || 'col-prospect',
        organizationId: lead.organization_id,
        assignedUserId: lead.assigned_user_id,
        history: (lead.lead_history || []).map((h: any) => ({
          id: h.id,
          timestamp: h.timestamp,
          type: h.type,
          description: h.description,
          user_id: h.user_id
        }))
      }));

      setLeads(formattedLeads);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      throw error;
    }
  };

  const saveColumns = async (newColumns: KanbanColumn[]) => {
    if (!organization) return;

    try {
      // Atualizar ordem das colunas
      const updates = newColumns.map(col => ({
        id: col.id,
        name: col.name,
        color: col.color,
        order: col.order,
        organization_id: organization.id
      }));

      const { error } = await supabase
        .from('kanban_columns')
        .upsert(updates);

      if (error) throw error;

      setColumns(newColumns);
      
      toast({
        title: "Sucesso",
        description: "Colunas atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar colunas:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações das colunas",
        variant: "destructive",
      });
    }
  };

  const handleAddLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'columnId' | 'history'>) => {
    if (!organization || !user) return;

    try {
      const newLeadData = {
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        address: leadData.address,
        birth_date: leadData.birthDate || null,
        cpf: leadData.cpf,
        car_model: leadData.carModel,
        car_plate: leadData.carPlate,
        unit_id: leadData.unitId,
        organization_id: organization.id,
        column_id: 'col-prospect',
        assigned_user_id: user.id
      };

      const { data: insertedLead, error: leadError } = await supabase
        .from('leads')
        .insert(newLeadData)
        .select()
        .single();

      if (leadError) throw leadError;

      // Criar entrada de histórico
      const { error: historyError } = await supabase
        .from('lead_history')
        .insert({
          lead_id: insertedLead.id,
          type: 'Criação',
          description: 'Lead criado',
          user_id: user.id
        });

      if (historyError) throw historyError;

      await loadLeads();
      setIsAddLeadModalOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Lead criado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar lead",
        variant: "destructive",
      });
    }
  };

  const handleEditLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'columnId' | 'history'>) => {
    if (!editingLead || !user) return;

    try {
      const updateData = {
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        address: leadData.address,
        birth_date: leadData.birthDate || null,
        cpf: leadData.cpf,
        car_model: leadData.carModel,
        car_plate: leadData.carPlate,
        unit_id: leadData.unitId
      };

      const { error: updateError } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', editingLead.id);

      if (updateError) throw updateError;

      // Criar entrada de histórico
      const { error: historyError } = await supabase
        .from('lead_history')
        .insert({
          lead_id: editingLead.id,
          type: 'Edição',
          description: 'Dados do lead atualizados',
          user_id: user.id
        });

      if (historyError) throw historyError;

      await loadLeads();
      setEditingLead(null);
      
      toast({
        title: "Sucesso",
        description: "Lead atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao editar lead:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar lead",
        variant: "destructive",
      });
    }
  };

  const handleLeadMove = async (leadId: string, newColumnId: string) => {
    if (!user) return;

    const targetColumn = columns.find(col => col.id === newColumnId);
    if (!targetColumn) return;

    try {
      const { error: updateError } = await supabase
        .from('leads')
        .update({ column_id: newColumnId })
        .eq('id', leadId);

      if (updateError) throw updateError;

      // Criar entrada de histórico
      const { error: historyError } = await supabase
        .from('lead_history')
        .insert({
          lead_id: leadId,
          type: 'Mudança de Etapa',
          description: `Movido para '${targetColumn.name}'`,
          user_id: user.id
        });

      if (historyError) throw historyError;

      await loadLeads();
    } catch (error) {
      console.error('Erro ao mover lead:', error);
      toast({
        title: "Erro",
        description: "Erro ao mover lead",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('leads')
          .delete()
          .eq('id', leadId);

        if (error) throw error;

        await loadLeads();
        setSelectedLead(null);
        
        toast({
          title: "Sucesso",
          description: "Lead excluído com sucesso",
        });
      } catch (error) {
        console.error('Erro ao excluir lead:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir lead",
          variant: "destructive",
        });
      }
    }
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
  };

  const openDetailsModal = (lead: Lead) => {
    setSelectedLead(lead);
  };

  if (orgLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Carregando leads...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Nenhuma organização encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
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
          onLeadsChange={async () => await loadLeads()}
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
        organizationId={organization?.id || ''}
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
