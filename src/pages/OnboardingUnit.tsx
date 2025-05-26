
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const OnboardingUnit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orgId = location.state?.orgId;

  const handleContinue = () => {
    // Por enquanto, redirecionar para o dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            Configuração da Unidade
          </h1>
          <p className="text-muted-foreground text-lg">
            Em desenvolvimento - Etapa 2/3
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>Próxima Etapa</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Organização criada com sucesso!</p>
            <p className="text-sm text-muted-foreground">ID: {orgId}</p>
            <Button onClick={handleContinue} className="w-full">
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingUnit;
