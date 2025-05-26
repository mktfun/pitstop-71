import React, { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DayView from '@/components/appointments/DayView';
import WeekView from '@/components/appointments/WeekView';
import MonthView from '@/components/appointments/MonthView';
import AddAppointmentModal from '@/components/appointments/AddAppointmentModal';
import ViewAppointmentModal from '@/components/appointments/ViewAppointmentModal';
import { Lead } from '@/pages/Leads';
import { updateLeadStatus, addLeadHistoryEntry, KANBAN_COLUMNS, HISTORY_TYPES } from '@/utils/leadAutomation';

export interface Appointment {
  id: string;
  leadId: string;
  date: string;
  time: string;
  serviceType: string;
  notes: string;
  createdAt: string;
  attended?: boolean;
}

type ViewMode = 'day' | 'week' | 'month';

const Appointments = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      // Load appointments
      const storedAppointments = localStorage.getItem('pitstop_appointments');
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      }

      // Load leads
      const storedLeads = localStorage.getItem('pitstop_leads');
      if (storedLeads) {
        setLeads(JSON.parse(storedLeads));
      }
    } catch (error) {
      console.error('Error loading appointments data:', error);
    }
  };

  const saveAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem('pitstop_appointments', JSON.stringify(newAppointments));
  };

  const handleAddAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      attended: false
    };

    saveAppointments([...appointments, newAppointment]);
    
    // Usar função utilitária para atualizar lead
    const formattedDate = format(new Date(appointmentData.date), 'dd/MM/yyyy', { locale: ptBR });
    updateLeadStatus({
      leadId: appointmentData.leadId,
      newColumnId: KANBAN_COLUMNS.SCHEDULED,
      historyType: HISTORY_TYPES.APPOINTMENT_CREATED,
      historyDescription: `Agendado para ${formattedDate} ${appointmentData.time} - Serviço: ${appointmentData.serviceType}`
    });
    
    // Recarregar leads para refletir mudanças
    loadData();
    setIsAddModalOpen(false);
  };

  const handleEditAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    if (!editingAppointment) return;

    const updatedAppointments = appointments.map(appointment =>
      appointment.id === editingAppointment.id
        ? { ...appointment, ...appointmentData }
        : appointment
    );

    saveAppointments(updatedAppointments);
    
    // Usar função utilitária para adicionar ao histórico
    const formattedDate = format(new Date(appointmentData.date), 'dd/MM/yyyy', { locale: ptBR });
    addLeadHistoryEntry(
      appointmentData.leadId,
      HISTORY_TYPES.APPOINTMENT_EDITED,
      `Agendamento atualizado para ${formattedDate} ${appointmentData.time} - Serviço: ${appointmentData.serviceType}`
    );
    
    // Recarregar leads para refletir mudanças
    loadData();
    setEditingAppointment(null);
    setIsViewModalOpen(false);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      const appointmentToDelete = appointments.find(app => app.id === appointmentId);
      if (appointmentToDelete) {
        const updatedAppointments = appointments.filter(appointment => appointment.id !== appointmentId);
        saveAppointments(updatedAppointments);
        
        // Usar função utilitária para adicionar ao histórico
        const formattedDate = format(new Date(appointmentToDelete.date), 'dd/MM/yyyy', { locale: ptBR });
        addLeadHistoryEntry(
          appointmentToDelete.leadId,
          HISTORY_TYPES.APPOINTMENT_DELETED,
          `Agendamento de ${formattedDate} ${appointmentToDelete.time} excluído`
        );
        
        // Recarregar leads para refletir mudanças
        loadData();
      }
      setIsViewModalOpen(false);
    }
  };

  const handleMarkAttendance = (appointmentId: string) => {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (!appointment) return;

    // Update appointment as attended
    const updatedAppointments = appointments.map(app =>
      app.id === appointmentId
        ? { ...app, attended: true }
        : app
    );
    saveAppointments(updatedAppointments);

    // Usar função utilitária para atualizar lead
    const formattedDate = format(new Date(appointment.date), 'dd/MM/yyyy', { locale: ptBR });
    updateLeadStatus({
      leadId: appointment.leadId,
      newColumnId: KANBAN_COLUMNS.IN_SERVICE,
      historyType: HISTORY_TYPES.ATTENDANCE_REGISTERED,
      historyDescription: `Cliente compareceu ao agendamento de ${formattedDate} ${appointment.time}`
    });
    
    // Recarregar leads para refletir mudanças
    loadData();
    setIsViewModalOpen(false);
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsViewModalOpen(false);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeText = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(weekEnd, 'd MMM yyyy', { locale: ptBR })}`;
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      default:
        return '';
    }
  };

  const getFilteredAppointments = () => {
    switch (viewMode) {
      case 'day':
        return appointments.filter(appointment => 
          appointment.date === format(currentDate, 'yyyy-MM-dd')
        );
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= weekStart && appointmentDate <= weekEnd;
        });
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= monthStart && appointmentDate <= monthEnd;
        });
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SidebarTrigger className="md:hidden" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground">Gerencie os agendamentos da oficina</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-primary hover:bg-primary/90"
          disabled={leads.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* No leads warning */}
      {leads.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Você precisa ter pelo menos um lead cadastrado para criar agendamentos.{' '}
            <a href="/leads" className="underline font-medium">Cadastre um lead primeiro</a>.
          </p>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {getDateRangeText()}
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Dia
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Mês
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-lg">
        {viewMode === 'day' && (
          <DayView
            appointments={getFilteredAppointments()}
            leads={leads}
            onAppointmentClick={handleViewAppointment}
          />
        )}
        {viewMode === 'week' && (
          <WeekView
            appointments={getFilteredAppointments()}
            leads={leads}
            currentDate={currentDate}
            onAppointmentClick={handleViewAppointment}
          />
        )}
        {viewMode === 'month' && (
          <MonthView
            appointments={getFilteredAppointments()}
            leads={leads}
            currentDate={currentDate}
            onAppointmentClick={handleViewAppointment}
          />
        )}
      </div>

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        isOpen={isAddModalOpen || !!editingAppointment}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAppointment(null);
        }}
        onSave={editingAppointment ? handleEditAppointment : handleAddAppointment}
        leads={leads}
        editingAppointment={editingAppointment}
      />

      {/* View Appointment Modal */}
      <ViewAppointmentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        lead={selectedAppointment ? leads.find(lead => lead.id === selectedAppointment.leadId) : null}
        onEdit={handleEditClick}
        onDelete={handleDeleteAppointment}
        onMarkAttendance={handleMarkAttendance}
      />
    </div>
  );
};

export default Appointments;
