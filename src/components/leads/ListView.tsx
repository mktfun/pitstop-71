
import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KanbanColumn, Lead } from '@/pages/Leads';

interface ListViewProps {
  columns: KanbanColumn[];
  leads: Lead[];
  onEditLead?: (lead: Lead) => void;
}

type SortField = 'name' | 'phone' | 'email' | 'createdAt' | 'status' | 'carModel';
type SortOrder = 'asc' | 'desc';

const colorVariants = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

const ListView = ({ columns, leads, onEditLead }: ListViewProps) => {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const columnsMap = useMemo(() => {
    return columns.reduce((acc, col) => {
      acc[col.id] = col;
      return acc;
    }, {} as Record<string, KanbanColumn>);
  }, [columns]);

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'phone':
          aValue = a.phone.toLowerCase();
          bValue = b.phone.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = columnsMap[a.columnId]?.name.toLowerCase() || '';
          bValue = columnsMap[b.columnId]?.name.toLowerCase() || '';
          break;
        case 'carModel':
          aValue = (a.carModel || '').toLowerCase();
          bValue = (b.carModel || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortField, sortOrder, columnsMap]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </TableHead>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Leads</CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum lead encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader field="name">Nome</SortableHeader>
                <SortableHeader field="phone">Telefone</SortableHeader>
                <SortableHeader field="email">Email</SortableHeader>
                <SortableHeader field="carModel">Carro</SortableHeader>
                <SortableHeader field="createdAt">Data Criação</SortableHeader>
                <SortableHeader field="status">Status/Etapa</SortableHeader>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedLeads.map((lead) => {
                const column = columnsMap[lead.columnId];
                const colorClass = colorVariants[column?.color as keyof typeof colorVariants] || colorVariants.gray;
                
                return (
                  <TableRow key={lead.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{lead.email}</TableCell>
                    <TableCell>{lead.carModel || '-'}</TableCell>
                    <TableCell>
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {column ? (
                        <Badge className={colorClass} variant="outline">
                          {column.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Status não encontrado</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {onEditLead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditLead(lead)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ListView;
