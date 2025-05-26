
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
}

const KanbanView = ({ columns, leads, onColumnsChange, onLeadsChange }: KanbanViewProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're dropping on a column
    const targetColumn = columns.find(col => col.id === overId);
    
    if (targetColumn) {
      // Update the lead's columnId
      const updatedLeads = leads.map(lead => 
        lead.id === activeId 
          ? { ...lead, columnId: targetColumn.id }
          : lead
      );
      onLeadsChange(updatedLeads);
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
      
      // Remove the column
      const updatedColumns = columns.filter(col => col.id !== columnId);
      
      onLeadsChange(updatedLeads);
      onColumnsChange(updatedColumns);
    }
  };

  const activeCard = activeId ? leads.find(lead => lead.id === activeId) : null;

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <SortableContext items={sortedColumns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
            {sortedColumns.map(column => (
              <KanbanColumn
                key={column.id}
                column={column}
                leads={leads.filter(lead => lead.columnId === column.id)}
                onEditColumn={handleEditColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}
          </SortableContext>
          
          {/* Add Column Button */}
          <div className="min-w-[280px]">
            <Button
              variant="outline"
              className="w-full h-12 border-dashed"
              onClick={() => setIsAddColumnModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
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
