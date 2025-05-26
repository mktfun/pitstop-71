
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { User, Phone, Car, Edit, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/pages/Leads';

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
  onEdit?: (lead: Lead) => void;
}

const LeadCard = ({ lead, isDragging = false, onEdit }: LeadCardProps) => {
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(lead);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-all duration-200 bg-card text-card-foreground shadow-sm hover:shadow-md border border-border ${
        isDragging || isSortableDragging
          ? 'opacity-50 rotate-2 shadow-xl scale-105 z-50'
          : 'hover:scale-[1.02]'
      }`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <User className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="font-semibold text-base leading-tight text-foreground">{lead.name}</span>
            </div>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="h-7 w-7 p-0 opacity-60 hover:opacity-100 hover:bg-muted"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate font-medium">{lead.phone}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">{lead.email}</span>
            </div>

            {lead.carModel && (
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm text-muted-foreground truncate font-medium">{lead.carModel}</span>
              </div>
            )}
          </div>

          {lead.cpf && (
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-xs">
                CPF: {lead.cpf.slice(-4)}
              </Badge>
            </div>
          )}
          
          <div className="pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Criado em {createdDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
