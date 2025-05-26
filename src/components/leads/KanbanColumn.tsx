
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeadCard from './LeadCard';
import EditColumnModal from './EditColumnModal';
import { KanbanColumn as KanbanColumnType, Lead } from '@/pages/Leads';

interface KanbanColumnProps {
  column: KanbanColumnType;
  leads: Lead[];
  onEditColumn: (columnId: string, updates: Partial<KanbanColumnType>) => void;
  onDeleteColumn: (columnId: string) => void;
}

const colorClasses = {
  blue: 'bg-blue-100 border-blue-200',
  yellow: 'bg-yellow-100 border-yellow-200',
  orange: 'bg-orange-100 border-orange-200',
  green: 'bg-green-100 border-green-200',
  red: 'bg-red-100 border-red-200',
  purple: 'bg-purple-100 border-purple-200',
  pink: 'bg-pink-100 border-pink-200',
  gray: 'bg-gray-100 border-gray-200',
};

const KanbanColumn = ({ column, leads, onEditColumn, onDeleteColumn }: KanbanColumnProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  const colorClass = colorClasses[column.color as keyof typeof colorClasses] || colorClasses.gray;

  return (
    <div className="min-w-[280px]">
      <div
        ref={setNodeRef}
        className={`rounded-lg border-2 ${colorClass} ${
          isOver ? 'border-primary' : ''
        } transition-colors duration-200`}
      >
        {/* Column Header */}
        <div className="p-4 border-b border-current/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{column.name}</h3>
              <span className="text-sm text-gray-600">{leads.length} leads</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditModalOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeleteColumn(column.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Column Content */}
        <div className="p-4 space-y-3 min-h-[200px]">
          <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
            {leads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </SortableContext>
          
          {leads.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">Nenhum lead nesta etapa</p>
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
