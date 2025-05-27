
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const OnboardingUnitStep = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obter organizationId da etapa anterior
  const organizationId = location.state?.orgId;

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 10) {
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!name.trim()) {
      setError('O nome da unidade é obrigatório');
      return;
    }

    if (!organizationId) {
      setError('ID da organização não encontrado');
      return;
    }

    setIsLoading(true);

    try {
      // Criar unidade no Supabase
      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .insert({
          name: name.trim(),
          address: address.trim() || null,
          phone: phone.trim() || null,
          organization_id: organizationId
        })
        .select()
        .single();

      if (unitError) throw unitError;

      console.log('Unidade criada:', unitData);

      // Navegar para próxima etapa
      navigate('/onboarding/convites', { 
        state: { 
          orgId: organizationId,
          unitId: unitData.id
        } 
      });
    } catch (err: any) {
      console.error('Erro ao criar unidade:', err);
      setError(err.message || 'Erro ao salvar unidade. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Se não há organizationId, redirecionar para primeira etapa
  if (!organizationId) {
    navigate('/onboarding/organizacao');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            Sua Primeira Unidade
          </h1>
          <p className="text-muted-foreground text-lg">
            Configure a unidade principal da sua mecânica
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Dados da Unidade</CardTitle>
            <CardDescription>
              Toda organização precisa de pelo menos uma unidade para funcionar. Esta será sua unidade principal.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome da Unidade */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome da Unidade *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Matriz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Endereço
                </Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Rua das Flores, 123 - Centro"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefone da Unidade
                </Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="h-11"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <span className="text-sm text-destructive font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </div>
                ) : (
                  'Salvar e Continuar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Etapa 2 de 3 - Configuração da Unidade Principal
          </p>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full w-2/3 transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingUnitStep;
