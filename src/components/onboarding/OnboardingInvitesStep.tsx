
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, X, Loader2 } from 'lucide-react';

interface PendingInvite {
  email: string;
  role: string;
}

interface Invitation {
  id: string;
  organizationId: string;
  invitedEmail: string;
  inviterUserId: string;
  role: string;
  status: 'pending';
  createdAt: string;
  expiresAt: string | null;
}

const OnboardingInvitesStep = () => {
  const [invitedEmail, setInvitedEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  
  const organizationId = location.state?.orgId;
  const unitId = location.state?.unitId;

  // Get current user from localStorage (assuming it was set during login)
  const userEmail = localStorage.getItem('userEmail');
  const userId = userEmail ? `user_${btoa(userEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)}` : null;

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Add invitation to pending list
  const handleAddInvite = () => {
    setError(null);

    // Validate email
    if (!invitedEmail.trim()) {
      setError('O email é obrigatório');
      return;
    }

    if (!isValidEmail(invitedEmail.trim())) {
      setError('Digite um email válido');
      return;
    }

    const normalizedEmail = invitedEmail.trim().toLowerCase();

    // Check if email already exists in pending invites
    if (pendingInvites.some(invite => invite.email === normalizedEmail)) {
      setError('Este email já foi adicionado');
      return;
    }

    // Add to pending invites
    setPendingInvites(prev => [...prev, {
      email: normalizedEmail,
      role: selectedRole
    }]);

    // Clear form
    setInvitedEmail('');
    setSelectedRole('member');
  };

  // Remove invitation from pending list
  const handleRemoveInvite = (emailToRemove: string) => {
    setPendingInvites(prev => prev.filter(invite => invite.email !== emailToRemove));
  };

  // Send invitations and complete onboarding
  const handleInviteAndComplete = async () => {
    if (!organizationId || !userId) {
      setError('Dados da organização ou usuário não encontrados');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Read existing invitations
      const existingInvitations = JSON.parse(localStorage.getItem('pitstop_invitations') || '[]');

      // Create new invitations
      const newInvitations: Invitation[] = pendingInvites.map(invite => ({
        id: `invite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        organizationId,
        invitedEmail: invite.email,
        inviterUserId: userId,
        role: invite.role,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        expiresAt: null
      }));

      // Save to localStorage
      const updatedInvitations = [...existingInvitations, ...newInvitations];
      localStorage.setItem('pitstop_invitations', JSON.stringify(updatedInvitations));

      console.log('Convites criados:', newInvitations);

      // Navigate to completion page
      navigate('/onboarding/concluido', {
        state: {
          orgId: organizationId,
          unitId,
          invitesCount: newInvitations.length
        }
      });
    } catch (err) {
      console.error('Erro ao criar convites:', err);
      setError('Erro ao salvar convites. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Skip invitations step
  const handleSkipStep = () => {
    navigate('/onboarding/concluido', {
      state: {
        orgId: organizationId,
        unitId,
        invitesCount: 0
      }
    });
  };

  // If no organizationId, redirect to first step
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
            <Users className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            Convide sua Equipe
          </h1>
          <p className="text-muted-foreground text-lg">
            Adicione membros à sua organização (opcional)
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Convidar Membros</CardTitle>
            <CardDescription>
              Você pode adicionar membros da sua equipe agora ou fazer isso depois nas configurações.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Add Invitation Form */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email Input */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email do Convidado
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={invitedEmail}
                    onChange={(e) => setInvitedEmail(e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* Role Select */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Papel
                  </Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membro</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Button */}
              <Button 
                onClick={handleAddInvite}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Adicionar Convite
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <span className="text-sm text-destructive font-medium">{error}</span>
              </div>
            )}

            {/* Pending Invites List */}
            {pendingInvites.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-lg">Convites Pendentes ({pendingInvites.length})</h3>
                <div className="space-y-2">
                  {pendingInvites.map((invite, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-background border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {invite.role === 'admin' ? 'Administrador' : 'Membro'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveInvite(invite.email)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleInviteAndComplete}
                disabled={isLoading}
                className="flex-1 h-11"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <>
                    {pendingInvites.length > 0 ? 'Convidar e Concluir' : 'Concluir'}
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSkipStep}
                disabled={isLoading}
                className="flex-1 h-11"
              >
                Pular Etapa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Etapa 3 de 3 - Convite de Membros (Opcional)
          </p>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full w-full transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingInvitesStep;
