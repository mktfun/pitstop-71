
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ServiceModal from './ServiceModal';

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedTime?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ServicesManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Load services from localStorage on component mount
  useEffect(() => {
    const savedServices = localStorage.getItem('pitstop_services');
    if (savedServices) {
      try {
        const parsedServices = JSON.parse(savedServices);
        setServices(parsedServices);
      } catch (error) {
        console.error('Error parsing services from localStorage:', error);
        setServices([]);
      }
    }
  }, []);

  // Save services to localStorage
  const saveServicesToStorage = (updatedServices: Service[]) => {
    localStorage.setItem('pitstop_services', JSON.stringify(updatedServices));
    setServices(updatedServices);
  };

  // Add new service
  const handleAddService = (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
    const now = new Date().toISOString();
    const newService: Service = {
      ...serviceData,
      id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const updatedServices = [...services, newService];
    saveServicesToStorage(updatedServices);
    setIsModalOpen(false);
  };

  // Edit service
  const handleEditService = (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
    if (!editingService) return;

    const updatedServices = services.map(service =>
      service.id === editingService.id
        ? {
            ...service,
            ...serviceData,
            updatedAt: new Date().toISOString(),
          }
        : service
    );

    saveServicesToStorage(updatedServices);
    setEditingService(null);
    setIsModalOpen(false);
  };

  // Toggle service active status
  const handleToggleActive = (serviceId: string) => {
    const updatedServices = services.map(service =>
      service.id === serviceId
        ? {
            ...service,
            isActive: !service.isActive,
            updatedAt: new Date().toISOString(),
          }
        : service
    );

    saveServicesToStorage(updatedServices);
  };

  // Open edit modal
  const openEditModal = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  // Open add modal
  const openAddModal = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Format estimated time
  const formatEstimatedTime = (time?: number) => {
    if (!time) return '-';
    return `${time} min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Gerenciamento de Serviços
          </h2>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pela sua oficina
          </p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Novo Serviço
        </Button>
      </div>

      {/* Services Table */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-accent/50 rounded-full p-4 mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum serviço cadastrado
          </h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Comece adicionando os serviços que sua oficina oferece para facilitar a criação de ordens de serviço.
          </p>
          <Button onClick={openAddModal} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Serviço
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Tempo Estimado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-muted-foreground">
                          {service.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(service.price)}</TableCell>
                  <TableCell>{formatEstimatedTime(service.estimatedTime)}</TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? 'default' : 'secondary'}>
                      {service.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(service)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(service.id)}
                        className="h-8 w-8 p-0"
                      >
                        {service.isActive ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
        onSubmit={editingService ? handleEditService : handleAddService}
        service={editingService}
      />
    </div>
  );
};

export default ServicesManagement;
