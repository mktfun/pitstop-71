
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/pages/Leads';

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
}

const LeadCard = ({ lead, isDragging = false }: LeadCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const createdDate = new Date(lead.createdAt).toLocaleDateString('pt-BR');

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging || isSortableDragging
          ? 'opacity-50 rotate-3 shadow-lg scale-105'
          : 'hover:shadow-md'
      }`}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-sm">{lead.name}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{lead.contact}</span>
          </div>
          
          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Criado em {createdDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
