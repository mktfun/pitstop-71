
import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';
import AddColumnModal from './AddColumnModal';
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're dragging a lead over a column
    if (!activeId.startsWith('column-') && !overId.startsWith('column-')) {
      const activeLead = leads.find(lead => lead.id === activeId);
      const overLead = leads.find(lead => lead.id === overId);
      
      if (activeLead && overLead && activeLead.columnId !== overLead.columnId) {
        onLeadMove(activeId, overLead.columnId);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column reordering
    if (activeId.startsWith('column-') && overId.startsWith('column-')) {
      const activeColumnId = activeId.replace('column-', '');
      const overColumnId = overId.replace('column-', '');
      
      if (activeColumnId !== overColumnId) {
        const activeColumn = columns.find(col => col.id === activeColumnId);
        const overColumn = columns.find(col => col.id === overColumnId);
        
        if (activeColumn && overColumn) {
          const activeIndex = sortedColumns.findIndex(col => col.id === activeColumnId);
          const overIndex = sortedColumns.findIndex(col => col.id === overColumnId);
          
          const newColumns = [...sortedColumns];
          newColumns.splice(activeIndex, 1);
          newColumns.splice(overIndex, 0, activeColumn);
          
          // Update order property
          const updatedColumns = newColumns.map((col, index) => ({
            ...col,
            order: index
          }));
          
          onColumnsChange(updatedColumns);
        }
      }
    }
    // Handle lead drop on column
    else if (!activeId.startsWith('column-')) {
      const targetColumn = columns.find(col => col.id === overId);
      
      if (targetColumn) {
        onLeadMove(activeId, targetColumn.id);
      }
    }

    setActiveId(null);
  };

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

  const activeCard = activeId && !activeId.startsWith('column-') 
    ? leads.find(lead => lead.id === activeId) 
    : null;

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-4">
          <SortableContext 
            items={sortedColumns.map(col => `column-${col.id}`)} 
            strategy={horizontalListSortingStrategy}
          >
            {sortedColumns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                leads={leads.filter(lead => lead.columnId === column.id)}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
                onEditLead={onEditLead}
                onViewLead={onViewLead}
              />
            ))}
          </SortableContext>
          
          {/* Add Column Button */}
          <div className="min-w-[320px] flex-shrink-0">
            <Button
              variant="outline"
              className="w-full h-16 border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={() => setIsAddColumnModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Coluna
            </Button>
          </div>
        </div>

        <DragOverlay>
          {activeCard ? <LeadCard lead={activeCard} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      <AddColumnModal
        isOpen={isAddColumnModalOpen}
        onClose={() => setIsAddColumnModalOpen(false)}
        onSave={handleAddColumn}
      />
    </div>
  );
};

export default KanbanView;
