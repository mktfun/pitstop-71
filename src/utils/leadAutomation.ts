import { Lead, LeadHistoryEntry } from '@/pages/Leads';

export interface LeadUpdateParams {
  leadId: string;
  newColumnId: string;
  historyType: string;
  historyDescription: string;
}

/**
 * Atualiza o status de um lead no Kanban e adiciona entrada ao histórico
 */
export const updateLeadStatus = (params: LeadUpdateParams): boolean => {
  const { leadId, newColumnId, historyType, historyDescription } = params;
  
  try {
    // Ler leads do localStorage
    const storedLeads = localStorage.getItem('pitstop_leads');
    if (!storedLeads) {
      console.error('Nenhum lead encontrado no localStorage');
      return false;
    }

    const leads: Lead[] = JSON.parse(storedLeads);
    
    // Encontrar o lead
    const leadIndex = leads.findIndex(lead => lead.id === leadId);
    if (leadIndex === -1) {
      console.error(`Lead com ID ${leadId} não encontrado`);
      return false;
    }

    // Atualizar columnId
    leads[leadIndex].columnId = newColumnId;

    // Adicionar entrada ao histórico
    const historyEntry: LeadHistoryEntry = {
      timestamp: new Date().toISOString(),
      type: historyType,
      description: historyDescription
    };

    leads[leadIndex].history = [historyEntry, ...leads[leadIndex].history];

    // Salvar de volta no localStorage
    localStorage.setItem('pitstop_leads', JSON.stringify(leads));
    
    console.log(`Lead ${leadId} atualizado para coluna ${newColumnId}:`, historyEntry);
    return true;

  } catch (error) {
    console.error('Erro ao atualizar status do lead:', error);
    return false;
  }
};

/**
 * Adiciona apenas uma entrada ao histórico do lead (sem mudar columnId)
 */
export const addLeadHistoryEntry = (leadId: string, type: string, description: string): boolean => {
  try {
    const storedLeads = localStorage.getItem('pitstop_leads');
    if (!storedLeads) return false;

    const leads: Lead[] = JSON.parse(storedLeads);
    const leadIndex = leads.findIndex(lead => lead.id === leadId);
    
    if (leadIndex === -1) {
      console.error(`Lead com ID ${leadId} não encontrado`);
      return false;
    }

    const historyEntry: LeadHistoryEntry = {
      timestamp: new Date().toISOString(),
      type,
      description
    };

    leads[leadIndex].history = [historyEntry, ...leads[leadIndex].history];
    localStorage.setItem('pitstop_leads', JSON.stringify(leads));
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar entrada ao histórico:', error);
    return false;
  }
};

/**
 * Obtém um lead específico do localStorage
 */
export const getLeadById = (leadId: string): Lead | null => {
  try {
    const storedLeads = localStorage.getItem('pitstop_leads');
    if (!storedLeads) return null;

    const leads: Lead[] = JSON.parse(storedLeads);
    return leads.find(lead => lead.id === leadId) || null;
  } catch (error) {
    console.error('Erro ao obter lead:', error);
    return null;
  }
};

/**
 * Constantes para os IDs das colunas do Kanban (baseado nas 11 colunas padrão)
 */
export const KANBAN_COLUMNS = {
  PROSPECT: 'col-prospect',
  FIRST_CONTACT: 'col-first-contact', 
  QUALIFICATION: 'col-qualification',
  PROPOSAL: 'col-proposal',
  NEGOTIATION: 'col-negotiation',
  SCHEDULED: 'col-scheduled',
  IN_SERVICE: 'col-in-service',
  WAITING_PARTS: 'col-waiting-parts',
  COMPLETED: 'col-completed',
  INVOICED: 'col-invoiced',
  CLOSED: 'col-closed'
} as const;

/**
 * Tipos de eventos para o histórico
 */
export const HISTORY_TYPES = {
  CREATION: 'Criação',
  STAGE_CHANGE: 'Mudança de Etapa',
  APPOINTMENT_CREATED: 'Agendamento Criado',
  APPOINTMENT_EDITED: 'Agendamento Editado',
  APPOINTMENT_DELETED: 'Agendamento Excluído',
  ATTENDANCE_REGISTERED: 'Comparecimento Registrado',
  EDIT: 'Edição',
  // Tipos para Ordens de Serviço:
  SERVICE_ORDER_CREATED: 'OS Criada',
  SERVICE_ORDER_STATUS: 'Status OS',
  SERVICE_ORDER_FINISHED: 'OS Finalizada',
  SERVICE_ORDER_DELETED: 'OS Excluída',
  // Futuros tipos para outras telas:
  DIAGNOSIS_COMPLETED: 'Diagnóstico Realizado',
  LEAD_LOST: 'Lead Perdido'
} as const;
