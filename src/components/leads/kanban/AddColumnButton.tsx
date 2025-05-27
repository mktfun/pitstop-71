
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddColumnButtonProps {
  onClick: () => void;
}

const AddColumnButton = ({ onClick }: AddColumnButtonProps) => {
  return (
    <div className="min-w-[320px] flex-shrink-0">
      <Button
        variant="outline"
        className="w-full h-16 border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 transition-colors"
        onClick={onClick}
      >
        <Plus className="h-5 w-5 mr-2" />
        Adicionar Coluna
      </Button>
    </div>
  );
};

export default AddColumnButton;
