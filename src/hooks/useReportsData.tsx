
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useActiveOrganization } from './useActiveOrganization';

export interface ReportLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  column_id: string;
  unit_id: string;
}

export interface ReportAppointment {
  id: string;
  lead_id: string;
  service_name: string;
  appointment_date: string;
  status: string;
  created_at: string;
  unit_id: string;
}

export interface ReportServiceOrder {
  id: string;
  lead_id: string;
  description: string;
  status: string;
  total_cost: number;
  created_at: string;
  completed_at: string;
  unit_id: string;
}

export interface ReportUnit {
  id: string;
  name: string;
}

export const useReportsData = () => {
  const { organization } = useActiveOrganization();
  const [leads, setLeads] = useState<ReportLead[]>([]);
  const [appointments, setAppointments] = useState<ReportAppointment[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ReportServiceOrder[]>([]);
  const [units, setUnits] = useState<ReportUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!organization) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [leadsResponse, appointmentsResponse, serviceOrdersResponse, unitsResponse] = await Promise.all([
          supabase
            .from('leads')
            .select('id, name, email, phone, created_at, column_id, unit_id')
            .eq('organization_id', organization.id),
          
          supabase
            .from('appointments')
            .select('id, lead_id, service_name, appointment_date, status, created_at, unit_id')
            .eq('organization_id', organization.id),
          
          supabase
            .from('service_orders')
            .select('id, lead_id, description, status, total_cost, created_at, completed_at, unit_id')
            .eq('organization_id', organization.id),
          
          supabase
            .from('units')
            .select('id, name')
            .eq('organization_id', organization.id)
        ]);

        if (leadsResponse.error) throw leadsResponse.error;
        if (appointmentsResponse.error) throw appointmentsResponse.error;
        if (serviceOrdersResponse.error) throw serviceOrdersResponse.error;
        if (unitsResponse.error) throw unitsResponse.error;

        setLeads(leadsResponse.data || []);
        setAppointments(appointmentsResponse.data || []);
        setServiceOrders(serviceOrdersResponse.data || []);
        setUnits(unitsResponse.data || []);

      } catch (err) {
        console.error('Error fetching reports data:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [organization]);

  return {
    leads,
    appointments,
    serviceOrders,
    units,
    isLoading,
    error
  };
};
