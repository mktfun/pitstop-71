
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Building2, MapPin, Users } from 'lucide-react';

const OnboardingCompletionStep = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const orgId = location.state?.orgId;
  const unitId = location.state?.unitId;
  const invitesCount = location.state?.invitesCount || 0;

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            Parabéns! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">
            Sua organização foi configurada com sucesso
          </p>
        </div>

        {/* Summary Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Configuração Concluída</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Summary Items */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Building2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Organização criada</p>
                  <p className="text-sm text-muted-foreground">ID: {orgId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Primeira unidade configurada</p>
                  <p className="text-sm text-muted-foreground">ID: {unitId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium">
                    {invitesCount > 0 
                      ? `${invitesCount} convite(s) enviado(s)` 
                      : 'Nenhum convite enviado'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invitesCount > 0 
                      ? 'Os convites foram salvos e podem ser gerenciados nas configurações'
                      : 'Você pode convidar membros depois nas configurações'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Próximos passos:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Explore o dashboard para ver as funcionalidades disponíveis</li>
                <li>• Configure serviços oferecidos pela sua mecânica</li>
                <li>• Comece a gerenciar leads e agendamentos</li>
                <li>• Personalize as configurações da sua organização</li>
              </ul>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleGoToDashboard}
              className="w-full h-11 text-base font-medium"
            >
              Ir para o Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingCompletionStep;
