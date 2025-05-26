
import { ServiceOrder, OS_STATUS_TO_COLUMN_MAP } from '@/types/serviceOrder';
import { Lead } from '@/pages/Leads';
import { updateLeadStatus, addLeadHistoryEntry, HISTORY_TYPES } from './leadAutomation';

export const generateOSNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  return `OS${year}${month}${timestamp.toString().slice(-4)}`;
};

export const getServiceOrders = (): ServiceOrder[] => {
  try {
    const stored = localStorage.getItem('pitstop_os');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar OSs:', error);
    return [];
  }
};

export const saveServiceOrders = (orders: ServiceOrder[]): void => {
  try {
    localStorage.setItem('pitstop_os', JSON.stringify(orders));
  } catch (error) {
    console.error('Erro ao salvar OSs:', error);
  }
};

export const createServiceOrder = (orderData: Omit<ServiceOrder, 'id' | 'osNumber' | 'createdAt'>): ServiceOrder => {
  const newOrder: ServiceOrder = {
    ...orderData,
    id: `os_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    osNumber: generateOSNumber(),
    createdAt: new Date().toISOString()
  };

  const orders = getServiceOrders();
  orders.push(newOrder);
  saveServiceOrders(orders);

  // Atualizar lead para "OS Criada"
  updateLeadStatus({
    leadId: orderData.leadId,
    newColumnId: 'col-in-service',
    historyType: HISTORY_TYPES.SERVICE_ORDER_CREATED,
    historyDescription: `Ordem de Serviço #${newOrder.osNumber} criada`
  });

  return newOrder;
};

export const updateServiceOrderStatus = (orderId: string, newStatus: string): boolean => {
  try {
    const orders = getServiceOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex === -1) return false;

    const order = orders[orderIndex];
    const oldStatus = order.status;
    
    // Atualizar status da OS
    orders[orderIndex] = {
      ...order,
      status: newStatus,
      completedAt: newStatus === 'Concluída' ? new Date().toISOString() : order.completedAt
    };

    saveServiceOrders(orders);

    // Atualizar lead no Kanban se status mudou
    if (oldStatus !== newStatus) {
      const newColumnId = OS_STATUS_TO_COLUMN_MAP[newStatus as keyof typeof OS_STATUS_TO_COLUMN_MAP];
      
      if (newColumnId) {
        updateLeadStatus({
          leadId: order.leadId,
          newColumnId,
          historyType: HISTORY_TYPES.SERVICE_ORDER_STATUS,
          historyDescription: `OS #${order.osNumber} atualizada para '${newStatus}'`
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar status da OS:', error);
    return false;
  }
};

export const getLeadName = (leadId: string): string => {
  try {
    const stored = localStorage.getItem('pitstop_leads');
    if (!stored) return 'Lead não encontrado';

    const leads: Lead[] = JSON.parse(stored);
    const lead = leads.find(l => l.id === leadId);
    return lead ? lead.name : 'Lead não encontrado';
  } catch (error) {
    console.error('Erro ao buscar lead:', error);
    return 'Erro';
  }
};

export const getAvailableLeads = (): Lead[] => {
  try {
    const stored = localStorage.getItem('pitstop_leads');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erro ao carregar leads:', error);
    return [];
  }
};
