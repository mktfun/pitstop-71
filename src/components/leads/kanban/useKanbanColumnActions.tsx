
import { useState } from 'react';
import { KanbanColumn as KanbanColumnType, Lead } from '@/pages/Leads';

export const useKanbanColumnActions = (
  columns: KanbanColumnType[],
  leads: Lead[],
  onColumnsChange: (columns: KanbanColumnType[]) => void,
  onLeadsChange: (leads: Lead[]) => void
) => {
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);

  const handleAddColumn = (columnData: { name: string; color: string }) => {
    const newColumn: KanbanColumnType = {
      id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: columnData.name,
      color: columnData.color,
      order: columns.length
    };

    onColumnsChange([...columns, newColumn]);
    setIsAddColumnModalOpen(false);
  };

  const handleEditColumn = (columnId: string, updates: Partial<KanbanColumnType>) => {
    const updatedColumns = columns.map(col =>
      col.id === columnId ? { ...col, ...updates } : col
    );
    onColumnsChange(updatedColumns);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta coluna? Os leads serão movidos para a primeira coluna.')) {
      const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
      const firstColumnId = sortedColumns[0]?.id;
      
      // Move leads from deleted column to first column
      const updatedLeads = leads.map(lead =>
        lead.columnId === columnId
          ? { ...lead, columnId: firstColumnId }
          : lead
      );
      
      // Remove the column and reorder
      const updatedColumns = columns
        .filter(col => col.id !== columnId)
        .map((col, index) => ({ ...col, order: index }));
      
      onLeadsChange(updatedLeads);
      onColumnsChange(updatedColumns);
    }
  };

  return {
    isAddColumnModalOpen,
    setIsAddColumnModalOpen,
    handleAddColumn,
    handleEditColumn,
    handleDeleteColumn
  };
};
