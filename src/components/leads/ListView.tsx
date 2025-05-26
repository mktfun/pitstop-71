
import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Edit, Eye } from 'lucide-react';
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
  onViewLead?: (lead: Lead) => void;
}

type SortField = 'name' | 'phone' | 'email' | 'createdAt' | 'status' | 'carModel' | 'cpf' | 'address' | 'birthDate';
type SortOrder = 'asc' | 'desc';

const colorVariants = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  green: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
  red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
  pink: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300',
  gray: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300',
};

const ListView = ({ columns, leads, onEditLead, onViewLead }: ListViewProps) => {
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
        case 'address':
          aValue = a.address.toLowerCase();
          bValue = b.address.toLowerCase();
          break;
        case 'birthDate':
          aValue = a.birthDate || '';
          bValue = b.birthDate || '';
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
        case 'cpf':
          aValue = a.cpf.toLowerCase();
          bValue = b.cpf.toLowerCase();
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
        <CardTitle className="flex items-center justify-between">
          <span>Lista de Leads</span>
          <Badge variant="secondary" className="ml-2">
            {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhum lead encontrado.</p>
            <p className="text-muted-foreground text-sm mt-2">Adicione seu primeiro lead para começar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader field="name">Nome</SortableHeader>
                  <SortableHeader field="phone">Telefone</SortableHeader>
                  <SortableHeader field="email">Email</SortableHeader>
                  <SortableHeader field="address">Endereço</SortableHeader>
                  <SortableHeader field="cpf">CPF</SortableHeader>
                  <SortableHeader field="carModel">Veículo</SortableHeader>
                  <SortableHeader field="birthDate">Nascimento</SortableHeader>
                  <SortableHeader field="createdAt">Criado em</SortableHeader>
                  <SortableHeader field="status">Status</SortableHeader>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLeads.map((lead) => {
                  const column = columnsMap[lead.columnId];
                  const colorClass = colorVariants[column?.color as keyof typeof colorVariants] || colorVariants.gray;
                  
                  return (
                    <TableRow key={lead.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell className="font-mono">{lead.phone}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{lead.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{lead.address}</TableCell>
                      <TableCell className="font-mono">
                        {lead.cpf ? `***.***.***-${lead.cpf.slice(-2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {lead.carModel ? (
                          <div>
                            <div className="font-medium">{lead.carModel}</div>
                            {lead.carPlate && <div className="text-xs text-muted-foreground">{lead.carPlate}</div>}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {lead.birthDate ? new Date(lead.birthDate).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
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
                        <div className="flex items-center space-x-1">
                          {onViewLead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewLead(lead)}
                              className="h-8 w-8 p-0"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEditLead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditLead(lead)}
                              className="h-8 w-8 p-0"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListView;
