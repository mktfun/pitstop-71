
import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Plus, FileText, Search, Filter, Eye, Calendar, Car, User, BarChart3, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import CreateServiceOrderModal from '@/components/service-orders/CreateServiceOrderModal';
import ServiceOrderDetailsModal from '@/components/service-orders/ServiceOrderDetailsModal';
import { ServiceOrder, OS_STATUS } from '@/types/serviceOrder';
import { 
  getServiceOrders, 
  saveServiceOrders, 
  createServiceOrder, 
  updateServiceOrderStatus, 
  getLeadName,
  getServiceName
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

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.osNumber.toLowerCase().includes(term) ||
        getLeadName(order.leadId).toLowerCase().includes(term) ||
        order.vehicleInfo.toLowerCase().includes(term) ||
        getServiceName(order.serviceId).toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredOrders(filtered);
  };

  const handleCreateOrder = (orderData: {
    leadId: string;
    vehicleInfo: string;
    reportedIssues: string;
    services: any[];
    status: string;
    serviceId?: string;
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

  const getChartData = () => {
    const statusCounts = getStatusCounts();
    const colors = {
      [OS_STATUS.DIAGNOSIS]: '#3b82f6',
      [OS_STATUS.WAITING_PARTS]: '#f97316',
      [OS_STATUS.IN_PROGRESS]: '#eab308',
      [OS_STATUS.COMPLETED]: '#22c55e',
      [OS_STATUS.WAITING_PICKUP]: '#a855f7',
      [OS_STATUS.PAID]: '#10b981',
      [OS_STATUS.CANCELLED]: '#ef4444'
    };

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status,
        value: count,
        color: colors[status as keyof typeof colors] || '#6b7280'
      }));
  };

  const statusCounts = getStatusCounts();
  const chartData = getChartData();

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

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 2xl:gap-6">
        {/* Status Cards - Top Row */}
        <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-sm ring-1 ring-border/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{serviceOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-sm ring-1 ring-border/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Search className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Diagnóstico</p>
                <p className="text-xl font-bold">{statusCounts[OS_STATUS.DIAGNOSIS] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-sm ring-1 ring-border/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Car className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aguard. Peças</p>
                <p className="text-xl font-bold">{statusCounts[OS_STATUS.WAITING_PARTS] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-sm ring-1 ring-border/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Em Execução</p>
                <p className="text-xl font-bold">{statusCounts[OS_STATUS.IN_PROGRESS] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-sm ring-1 ring-border/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Concluída</p>
                <p className="text-xl font-bold">{statusCounts[OS_STATUS.COMPLETED] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-sm ring-1 ring-border/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paga</p>
                <p className="text-xl font-bold">{statusCounts[OS_STATUS.PAID] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table Section */}
        <Card className="col-span-full lg:col-span-4 xl:col-span-4 bg-card/95 backdrop-blur-sm border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Lista de Ordens de Serviço</span>
                <Badge variant="secondary" className="ml-2">
                  {filteredOrders.length} {filteredOrders.length === 1 ? 'OS' : 'OSs'}
                </Badge>
              </CardTitle>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nº OS, cliente, veículo ou serviço..."
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
                      <TableHead>Serviço Principal</TableHead>
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
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">{getServiceName(order.serviceId)}</span>
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

        {/* Chart Section */}
        <Card className="lg:col-span-2 xl:col-span-2 bg-card/95 backdrop-blur-sm border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Distribuição por Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-center">Nenhum dado para exibir</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
