
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeadCard from './LeadCard';
import EditColumnModal from './EditColumnModal';
import { KanbanColumn as KanbanColumnType, Lead } from '@/pages/Leads';

interface KanbanColumnProps {
  column: KanbanColumnType;
  leads: Lead[];
  onEditColumn: (columnId: string, updates: Partial<KanbanColumnType>) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditLead?: (lead: Lead) => void;
}

const colorClasses = {
  blue: 'border-t-blue-500 bg-blue-50/50',
  yellow: 'border-t-yellow-500 bg-yellow-50/50',
  orange: 'border-t-orange-500 bg-orange-50/50',
  green: 'border-t-green-500 bg-green-50/50',
  red: 'border-t-red-500 bg-red-50/50',
  purple: 'border-t-purple-500 bg-purple-50/50',
  pink: 'border-t-pink-500 bg-pink-50/50',
  gray: 'border-t-gray-500 bg-gray-50/50',
};

const KanbanColumn = ({ column, leads, onEditColumn, onDeleteColumn, onEditLead }: KanbanColumnProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: column.id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colorClass = colorClasses[column.color as keyof typeof colorClasses] || colorClasses.gray;

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`min-w-[350px] ${isDragging ? 'opacity-50 scale-105 shadow-2xl z-50 rotate-1' : ''} transition-all duration-200`}
    >
      <div
        ref={setDroppableRef}
        className={`rounded-lg border-2 bg-card shadow-sm ${colorClass} border-t-4 ${
          isOver ? 'border-primary shadow-lg' : 'border-border'
        } transition-all duration-200`}
      >
        {/* Column Header */}
        <div
          {...attributes}
          {...listeners}
          className={`p-4 border-b border-border cursor-grab active:cursor-grabbing hover:bg-muted/30 transition-colors ${colorClass}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-foreground text-lg">{column.name}</h3>
                <span className="text-sm text-muted-foreground font-medium">
                  {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 opacity-70 hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                className="h-8 w-8 p-0 hover:bg-white/50"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteColumn(column.id);
                }}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-white/50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Column Content */}
        <div className="p-4 space-y-3 min-h-[300px] bg-muted/20">
          <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
            {leads.map(lead => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                onEdit={onEditLead}
              />
            ))}
          </SortableContext>
          
          {leads.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p className="text-sm">Nenhum lead nesta etapa</p>
              <p className="text-xs mt-1">Arraste leads para cá</p>
            </div>
          )}
        </div>
      </div>

      <EditColumnModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updates) => onEditColumn(column.id, updates)}
        column={column}
      />
    </div>
  );
};

export default KanbanColumn;
