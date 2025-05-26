
export interface ServiceOrderService {
  serviceId: string;
  description: string;
  parts: string;
  cost: number;
}

export interface ServiceOrder {
  id: string;
  osNumber: string;
  leadId: string;
  vehicleInfo: string;
  reportedIssues: string;
  services: ServiceOrderService[];
  status: string;
  createdAt: string;
  completedAt?: string;
  serviceId?: string; // Campo opcional para o serviço principal
}

export const OS_STATUS = {
  DIAGNOSIS: 'Diagnóstico',
  WAITING_PARTS: 'Aguardando Peças',
  IN_PROGRESS: 'Em Execução',
  COMPLETED: 'Concluída',
  WAITING_PICKUP: 'Aguardando Retirada',
  PAID: 'Paga',
  CANCELLED: 'Cancelada'
} as const;

export const OS_STATUS_TO_COLUMN_MAP = {
  [OS_STATUS.DIAGNOSIS]: 'col-in-service',
  [OS_STATUS.WAITING_PARTS]: 'col-waiting-parts',
  [OS_STATUS.IN_PROGRESS]: 'col-in-service',
  [OS_STATUS.COMPLETED]: 'col-completed',
  [OS_STATUS.WAITING_PICKUP]: 'col-completed',
  [OS_STATUS.PAID]: 'col-invoiced',
  [OS_STATUS.CANCELLED]: 'col-closed'
} as const;
