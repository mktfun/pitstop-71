
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Organization {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  logoUrl: string | null;
  ownerUserId: string;
  createdAt: string;
}

interface UserOrgAssociation {
  userId: string;
  organizationId: string;
  role: string;
  joinedAt: string;
}

const OnboardingOrgStep = () => {
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Função para formatar CNPJ
  const formatCNPJ = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

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

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!name.trim()) {
      setError('O nome da mecânica é obrigatório');
      return;
    }

    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setIsLoading(true);

    try {
      // Gerar IDs e timestamps
      const orgId = `org-${Date.now()}`;
      const createdAt = new Date().toISOString();

      // Criar objeto da organização
      const newOrg: Organization = {
        id: orgId,
        name: name.trim(),
        cnpj: cnpj.trim(),
        phone: phone.trim(),
        logoUrl: logoUrl.trim() || null,
        ownerUserId: user.id,
        createdAt
      };

      // Ler organizações existentes e adicionar nova
      const existingOrgs = JSON.parse(localStorage.getItem('pitstop_organizations') || '[]');
      existingOrgs.push(newOrg);
      localStorage.setItem('pitstop_organizations', JSON.stringify(existingOrgs));

      // Criar associação usuário-organização
      const newAssoc: UserOrgAssociation = {
        userId: user.id,
        organizationId: orgId,
        role: 'owner',
        joinedAt: createdAt
      };

      // Ler associações existentes e adicionar nova
      const existingAssocs = JSON.parse(localStorage.getItem('pitstop_user_org_associations') || '[]');
      existingAssocs.push(newAssoc);
      localStorage.setItem('pitstop_user_org_associations', JSON.stringify(existingAssocs));

      console.log('Organização criada:', newOrg);
      console.log('Associação criada:', newAssoc);

      // Navegar para próxima etapa
      navigate('/onboarding/unidade', { state: { orgId } });
    } catch (err) {
      console.error('Erro ao criar organização:', err);
      setError('Erro ao salvar organização. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            Bem-vindo ao PitStop
          </h1>
          <p className="text-muted-foreground text-lg">
            Vamos configurar sua mecânica
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sobre sua Mecânica</CardTitle>
            <CardDescription>
              Informe os dados principais da sua oficina mecânica
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome da Mecânica */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome da Mecânica *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Auto Center Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-sm font-medium">
                  CNPJ
                </Label>
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={handleCnpjChange}
                  className="h-11"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefone Principal
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

              {/* URL do Logo */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-sm font-medium">
                  URL do Logo
                </Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://exemplo.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
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
            Etapa 1 de 3 - Configuração da Organização
          </p>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full w-1/3 transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOrgStep;
