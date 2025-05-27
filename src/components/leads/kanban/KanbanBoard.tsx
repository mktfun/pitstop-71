
import React from 'react';
import KanbanColumn from '../KanbanColumn';
import { KanbanColumn as KanbanColumnType, Lead } from '@/pages/Leads';

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  leads: Lead[];
  onEditColumn: (columnId: string, updates: Partial<KanbanColumnType>) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditLead?: (lead: Lead) => void;
  onViewLead?: (lead: Lead) => void;
}

const KanbanBoard = ({
  columns,
  leads,
  onEditColumn,
  onDeleteColumn,
  onEditLead,
  onViewLead
}: KanbanBoardProps) => {
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return (
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {sortedColumns.map(column => (
        <KanbanColumn
          key={column.id}
          column={column}
          leads={leads.filter(lead => lead.columnId === column.id)}
          onEditColumn={onEditColumn}
          onDeleteColumn={onDeleteColumn}
          onEditLead={onEditLead}
          onViewLead={onViewLead}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
