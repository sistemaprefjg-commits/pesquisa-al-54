import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ShieldX className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={logout} className="w-full">
            Voltar ao Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;