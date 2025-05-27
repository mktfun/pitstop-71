
import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarBase64: string;
}

const ProfileManagement = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    role: '',
    avatarBase64: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados do localStorage ao montar o componente
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    try {
      const savedProfile = localStorage.getItem('pitstop_user_profile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do perfil.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Tipo de arquivo não suportado. Use JPG, PNG ou GIF.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Erro",
        description: "Arquivo muito grande. O tamanho máximo é 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Converter arquivo para base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setProfile(prev => ({
        ...prev,
        avatarBase64: base64String
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      // Salvar no localStorage
      localStorage.setItem('pitstop_user_profile', JSON.stringify(profile));
      
      toast({
        title: "Sucesso",
        description: "Perfil salvo com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Perfil do Usuário</h2>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências de conta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Atualize suas informações de perfil e foto do avatar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seção do Avatar */}
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {profile.avatarBase64 ? (
                  <AvatarImage src={profile.avatarBase64} alt="Avatar do usuário" />
                ) : (
                  <AvatarFallback className="text-lg">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={triggerFileInput}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-foreground">Foto do Perfil</h3>
              <p className="text-sm text-muted-foreground">
                Clique no ícone da câmera para alterar sua foto.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
              </p>
            </div>
          </div>

          {/* Campos do Perfil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Digite seu nome"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(XX) XXXXX-XXXX"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Input
                id="role"
                placeholder="Digite seu cargo"
                value={profile.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
              />
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveProfile} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
