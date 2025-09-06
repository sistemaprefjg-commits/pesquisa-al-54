import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navigate, Link } from 'react-router-dom';
import { Settings, Shield, Users } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Se já estiver logado, redirecionar
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/whatsapp'} replace />;
  }

  const handleAdminLogin = async () => {
    setIsLoading(true);
    setError('');

    const result = await login('admin@hospital.com', 'Hospital@Admin2024');
    
    if (result.error) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const handleReceptionLogin = async () => {
    setIsLoading(true);
    setError('');

    const result = await login('recepcao@hospital.com', 'Recepcao@2024');
    
    if (result.error) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-background p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/25c56df3-f26f-40d4-928b-178f9a81f224.png" 
              alt="Prefeitura de Joaquim Gomes" 
              className="h-20 w-auto"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Sistema de Pesquisa</h1>
            <p className="text-muted-foreground mt-2">
              Prefeitura de Joaquim Gomes - Escolha seu tipo de acesso
            </p>
          </div>
        </div>

        {/* Login Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Card */}
          <Card className="shadow-medical hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">Administração</CardTitle>
              <CardDescription>
                Acesso completo ao sistema para gestores e administradores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2 text-sm text-muted-foreground">
                <p>• Dashboard completo</p>
                <p>• Relatórios detalhados</p>
                <p>• Gestão de usuários</p>
                <p>• Configurações avançadas</p>
              </div>
              
              <Button 
                onClick={handleAdminLogin}
                disabled={isLoading}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isLoading ? 'Entrando...' : 'Entrar como Administrador'}
              </Button>
            </CardContent>
          </Card>

          {/* Reception Card */}
          <Card className="shadow-medical hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-secondary/10 rounded-full">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-xl">Recepção</CardTitle>
              <CardDescription>
                Acesso operacional para equipe de atendimento e recepcionistas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2 text-sm text-muted-foreground">
                <p>• Envio de pesquisas WhatsApp</p>
                <p>• Cadastro de pacientes</p>
                <p>• Visualização de respostas</p>
                <p>• Relatórios básicos</p>
              </div>
              
              <Button 
                onClick={handleReceptionLogin}
                disabled={isLoading}
                className="w-full h-12 text-lg"
                variant="secondary"
                size="lg"
              >
                {isLoading ? 'Entrando...' : 'Entrar como Recepção'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-md mx-auto">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Setup Link */}
        <div className="text-center pt-4">
          <Link 
            to="/admin-setup" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Settings className="h-4 w-4" />
            Configuração do Sistema
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;