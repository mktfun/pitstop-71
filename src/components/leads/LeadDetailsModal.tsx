
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, MapPin, Calendar, FileText, Car, Trash2, Edit, Clock } from 'lucide-react';
import { Lead, KanbanColumn, LeadHistoryEntry } from '@/pages/Leads';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  columns: KanbanColumn[];
}

const LeadDetailsModal = ({ isOpen, onClose, lead, onEdit, onDelete, columns }: LeadDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!lead) return null;

  const currentColumn = columns.find(col => col.id === lead.columnId);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy às HH:mm', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getHistoryIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'criação':
        return <User className="h-4 w-4 text-green-500" />;
      case 'mudança de etapa':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'edição':
        return <Edit className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Detalhes do Lead</span>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(lead);
                    onClose();
                  }}
                  className="flex items-center space-x-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onDelete(lead.id);
                    onClose();
                  }}
                  className="flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir</span>
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Dados do Lead</TabsTrigger>
            <TabsTrigger value="history">Histórico ({lead.history?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="overflow-y-auto max-h-[60vh]">
            <div className="space-y-6">
              {/* Status atual */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Status Atual
                    {currentColumn && (
                      <Badge 
                        className={colorVariants[currentColumn.color as keyof typeof colorVariants] || colorVariants.gray} 
                        variant="outline"
                      >
                        {currentColumn.name}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Informações pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Informações Pessoais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                      <p className="text-base font-medium">{lead.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">CPF</label>
                      <p className="text-base font-mono">{lead.cpf}</p>
                    </div>
                    {lead.birthDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                        <p className="text-base">{formatDate(lead.birthDate)}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Criado em</label>
                      <p className="text-base">{formatDateTime(lead.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Phone className="h-5 w-5" />
                    <span>Contato</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <p className="text-base font-mono">{lead.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-base">{lead.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                    <p className="text-base">{lead.address}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Veículo */}
              {(lead.carModel || lead.carPlate) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Car className="h-5 w-5" />
                      <span>Veículo</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lead.carModel && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Modelo</label>
                          <p className="text-base">{lead.carModel}</p>
                        </div>
                      )}
                      {lead.carPlate && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Placa</label>
                          <p className="text-base font-mono">{lead.carPlate}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="overflow-y-auto max-h-[60vh]">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Histórico de Atividades</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lead.history && lead.history.length > 0 ? (
                  <div className="space-y-4">
                    {lead.history.map((entry, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                        {getHistoryIcon(entry.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">{entry.type}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma atividade registrada ainda.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsModal;
