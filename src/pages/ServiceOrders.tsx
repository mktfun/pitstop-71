
import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Plus, FileText, Search, Filter, Eye, Calendar, Car, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreateServiceOrderModal from '@/components/service-orders/CreateServiceOrderModal';
import ServiceOrderDetailsModal from '@/components/service-orders/ServiceOrderDetailsModal';
import { ServiceOrder, OS_STATUS } from '@/types/serviceOrder';
import { 
  getServiceOrders, 
  saveServiceOrders, 
  createServiceOrder, 
  updateServiceOrderStatus, 
  getLeadName 
} from '@/utils/serviceOrderUtils';

const ServiceOrders = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadServiceOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [serviceOrders, searchTerm, statusFilter]);

  const loadServiceOrders = () => {
    const orders = getServiceOrders();
    setServiceOrders(orders);
  };

  const filterOrders = () => {
    let filtered = [...serviceOrders];

    // Filtro por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.osNumber.toLowerCase().includes(term) ||
        getLeadName(order.leadId).toLowerCase().includes(term) ||
        order.vehicleInfo.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Ordenar por data de criação (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const handleCreateOrder = (orderData: {
    leadId: string;
    vehicleInfo: string;
    reportedIssues: string;
    services: any[];
    status: string;
  }) => {
    createServiceOrder(orderData);
    loadServiceOrders();
    setIsCreateModalOpen(false);
  };

  const handleUpdateOrder = (updatedOrder: ServiceOrder) => {
    const orders = getServiceOrders();
    const orderIndex = orders.findIndex(order => order.id === updatedOrder.id);
    
    if (orderIndex !== -1) {
      const oldStatus = orders[orderIndex].status;
      orders[orderIndex] = updatedOrder;
      saveServiceOrders(orders);

      // Se o status mudou, atualizar no sistema de automação
      if (oldStatus !== updatedOrder.status) {
        updateServiceOrderStatus(updatedOrder.id, updatedOrder.status);
      }

      loadServiceOrders();
      setSelectedOrder(null);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    const orders = getServiceOrders();
    const updatedOrders = orders.filter(order => order.id !== orderId);
    saveServiceOrders(updatedOrders);
    loadServiceOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case OS_STATUS.DIAGNOSIS: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OS_STATUS.WAITING_PARTS: return 'bg-orange-100 text-orange-800 border-orange-200';
      case OS_STATUS.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OS_STATUS.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
      case OS_STATUS.WAITING_PICKUP: return 'bg-purple-100 text-purple-800 border-purple-200';
      case OS_STATUS.PAID: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case OS_STATUS.CANCELLED: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    Object.values(OS_STATUS).forEach(status => {
      counts[status] = serviceOrders.filter(order => order.status === status).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço</h1>
            <p className="text-muted-foreground">Gerencie as ordens de serviço da oficina</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nova OS
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{serviceOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground truncate">{status}</p>
                <p className="text-xl font-bold">{count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nº OS, cliente ou veículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.values(OS_STATUS).map(status => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Service Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Lista de Ordens de Serviço</span>
            <Badge variant="secondary" className="ml-2">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'OS' : 'OSs'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg text-muted-foreground mb-2">
                {serviceOrders.length === 0 ? 'Nenhuma OS encontrada' : 'Nenhuma OS corresponde aos filtros'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {serviceOrders.length === 0 
                  ? 'Crie sua primeira ordem de serviço para começar.' 
                  : 'Tente ajustar os filtros de busca.'
                }
              </p>
              {serviceOrders.length === 0 && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira OS
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº OS</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono font-medium">
                        {order.osNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{getLeadName(order.leadId)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{order.vehicleInfo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)} variant="outline">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 w-8 p-0"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateServiceOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateOrder}
      />

      <ServiceOrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        serviceOrder={selectedOrder}
        onSave={handleUpdateOrder}
        onDelete={handleDeleteOrder}
      />
    </div>
  );
};

export default ServiceOrders;
