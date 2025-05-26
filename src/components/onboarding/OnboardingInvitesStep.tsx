
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

const OnboardingInvitesStep = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orgId = location.state?.orgId;
  const unitId = location.state?.unitId;

  const handleContinue = () => {
    // Por enquanto, redirecionar para o dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            Convites para Equipe
          </h1>
          <p className="text-muted-foreground text-lg">
            Em desenvolvimento - Etapa 3/3
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>Próxima Etapa</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Unidade criada com sucesso!</p>
            <p className="text-sm text-muted-foreground">Organização: {orgId}</p>
            <p className="text-sm text-muted-foreground">Unidade: {unitId}</p>
            <Button onClick={handleContinue} className="w-full">
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingInvitesStep;
