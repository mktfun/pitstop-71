
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useMemo } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Appointments from "./pages/Appointments";
import ServiceOrders from "./pages/ServiceOrders";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/AppLayout";
import OnboardingOrgStep from "./components/onboarding/OnboardingOrgStep";
import OnboardingUnitStep from "./components/onboarding/OnboardingUnitStep";
import OnboardingInvitesStep from "./components/onboarding/OnboardingInvitesStep";
import OnboardingCompletionStep from "./components/onboarding/OnboardingCompletionStep";

const App = () => {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/onboarding/organizacao" element={<OnboardingOrgStep />} />
            <Route path="/onboarding/unidade" element={<OnboardingUnitStep />} />
            <Route path="/onboarding/convites" element={<OnboardingInvitesStep />} />
            <Route path="/onboarding/concluido" element={<OnboardingCompletionStep />} />
            <Route path="/" element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/agendamentos" element={<Appointments />} />
              <Route path="/ordens-servico" element={<ServiceOrders />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/configuracoes" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
