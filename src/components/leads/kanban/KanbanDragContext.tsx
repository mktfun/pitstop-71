
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
import LeadCard from '../LeadCard';
import { KanbanColumn as KanbanColumnType, Lead } from '@/pages/Leads';

interface KanbanDragContextProps {
  columns: KanbanColumnType[];
  leads: Lead[];
  onColumnsChange: (columns: KanbanColumnType[]) => void;
  onLeadMove: (leadId: string, newColumnId: string) => void;
  children: React.ReactNode;
}

const KanbanDragContext = ({
  columns,
  leads,
  onColumnsChange,
  onLeadMove,
  children
}: KanbanDragContextProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const activeCard = activeId && !activeId.startsWith('column-') 
    ? leads.find(lead => lead.id === activeId) 
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={sortedColumns.map(col => `column-${col.id}`)} 
        strategy={horizontalListSortingStrategy}
      >
        {children}
      </SortableContext>
      
      <DragOverlay>
        {activeCard ? <LeadCard lead={activeCard} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanDragContext;
