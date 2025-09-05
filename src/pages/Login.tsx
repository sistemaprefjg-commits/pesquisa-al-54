import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { login, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Se já estiver logado, redirecionar
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/whatsapp'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(username, password);
    
    if (!success) {
      setError('Usuário ou senha inválidos');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-background">
      <Card className="w-full max-w-md shadow-medical">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/25c56df3-f26f-40d4-928b-178f9a81f224.png" 
              alt="Prefeitura de Joaquim Gomes" 
              className="h-20 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl text-primary">Sistema de Pesquisa</CardTitle>
            <CardDescription className="text-center mt-2">
              Prefeitura de Joaquim Gomes - Entre com suas credenciais
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Usuários de teste:</p>
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Recepção:</strong> recepcao / recepcao123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;