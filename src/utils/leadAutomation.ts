
import { supabase } from '@/integrations/supabase/client';

export interface LeadUpdateParams {
  leadId: string;
  newColumnId: string;
  historyType: string;
  historyDescription: string;
  userId?: string;
}

/**
 * Atualiza o status de um lead no Kanban e adiciona entrada ao histórico usando Supabase
 */
export const updateLeadStatus = async (params: LeadUpdateParams): Promise<boolean> => {
  const { leadId, newColumnId, historyType, historyDescription, userId } = params;
  
  try {
    // Atualizar columnId do lead
    const { error: updateError } = await supabase
      .from('leads')
      .update({ column_id: newColumnId })
      .eq('id', leadId);

    if (updateError) {
      console.error('Erro ao atualizar status do lead:', updateError);
      return false;
    }

    // Adicionar entrada ao histórico
    const { error: historyError } = await supabase
      .from('lead_history')
      .insert({
        lead_id: leadId,
        type: historyType,
        description: historyDescription,
        user_id: userId
      });

    if (historyError) {
      console.error('Erro ao adicionar entrada ao histórico:', historyError);
      return false;
    }

    console.log(`Lead ${leadId} atualizado para coluna ${newColumnId}`);
    return true;

  } catch (error) {
    console.error('Erro ao atualizar status do lead:', error);
    return false;
  }
};

/**
 * Adiciona apenas uma entrada ao histórico do lead (sem mudar columnId)
 */
export const addLeadHistoryEntry = async (leadId: string, type: string, description: string, userId?: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('lead_history')
      .insert({
        lead_id: leadId,
        type,
        description,
        user_id: userId
      });

    if (error) {
      console.error('Erro ao adicionar entrada ao histórico:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar entrada ao histórico:', error);
    return false;
  }
};

/**
 * Obtém um lead específico do Supabase
 */
export const getLeadById = async (leadId: string) => {
  try {
    const { data: lead, error } = await supabase
      .from('leads')
      .select(`
        *,
        lead_history (
          id,
          timestamp,
          type,
          description,
          user_id
        )
      `)
      .eq('id', leadId)
      .single();

    if (error) {
      console.error('Erro ao obter lead:', error);
      return null;
    }

    return lead;
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
