
import React from 'react';
import KanbanDragContext from './kanban/KanbanDragContext';
import KanbanBoard from './kanban/KanbanBoard';
import AddColumnButton from './kanban/AddColumnButton';
import AddColumnModal from './AddColumnModal';
import { useKanbanColumnActions } from './kanban/useKanbanColumnActions';
import { KanbanColumn as KanbanColumnType, Lead } from '@/pages/Leads';

interface KanbanViewProps {
  columns: KanbanColumnType[];
  leads: Lead[];
  onColumnsChange: (columns: KanbanColumnType[]) => void;
  onLeadsChange: (leads: Lead[]) => void;
  onLeadMove: (leadId: string, newColumnId: string) => void;
  onEditLead?: (lead: Lead) => void;
  onViewLead?: (lead: Lead) => void;
}

const KanbanView = ({ 
  columns, 
  leads, 
  onColumnsChange, 
  onLeadsChange, 
  onLeadMove,
  onEditLead,
  onViewLead 
}: KanbanViewProps) => {
  const {
    isAddColumnModalOpen,
    setIsAddColumnModalOpen,
    handleAddColumn,
    handleEditColumn,
    handleDeleteColumn
  } = useKanbanColumnActions(columns, leads, onColumnsChange, onLeadsChange);

  return (
    <div className="h-full">
      <KanbanDragContext
        columns={columns}
        leads={leads}
        onColumnsChange={onColumnsChange}
        onLeadMove={onLeadMove}
      >
        <KanbanBoard
          columns={columns}
          leads={leads}
          onEditColumn={handleEditColumn}
          onDeleteColumn={handleDeleteColumn}
          onEditLead={onEditLead}
          onViewLead={onViewLead}
        />
        
        <AddColumnButton onClick={() => setIsAddColumnModalOpen(true)} />
      </KanbanDragContext>

      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onSave={handleAddColumn}
      />
    </div>
  );
};

export default KanbanView;
