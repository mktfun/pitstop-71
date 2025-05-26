
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email === 'teste@teste.com' && password === '123456') {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('userEmail', email);
      navigate('/dashboard');
    } else {
      setError('Email ou senha inválidos.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand Section */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Settings className="h-12 w-12 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            PitStop
          </h1>
          <p className="text-muted-foreground text-lg">
            Sistema de Gerenciamento
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-semibold">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-base">
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive font-medium">{error}</span>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-medium bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button 
                type="button"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 hover:underline"
                onClick={() => setError('Funcionalidade em desenvolvimento.')}
              >
                Esqueceu sua senha?
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-4">
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-sm text-muted-foreground">
                Credenciais de Demonstração
              </h3>
              <p className="text-xs text-muted-foreground">
                Email: <span className="font-mono bg-background px-1 rounded">teste@teste.com</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Senha: <span className="font-mono bg-background px-1 rounded">123456</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;
