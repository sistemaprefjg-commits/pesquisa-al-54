import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, CheckCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const createAdminUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('setup-admin-users', {
        body: {}
      });

      if (error) {
        setError(error.message || 'Erro ao criar usuários');
      } else if (data?.success) {
        setCredentials(data.credentials);
      } else {
        setError(data?.error || 'Erro ao criar usuários');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Configuração de Usuários Administrativos
          </CardTitle>
          <CardDescription>
            Crie automaticamente as contas de admin e recepção com senhas pré-definidas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!credentials ? (
            <Button 
              onClick={createAdminUsers} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Criando usuários...' : 'Criar Usuários Administrativos'}
            </Button>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Usuários criados com sucesso! Guarde estas credenciais:
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">👑 Administrador</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="font-mono text-sm">{credentials.admin.email}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(credentials.admin.email, 'admin-email')}
                      >
                        {copied === 'admin-email' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="font-mono text-sm">{credentials.admin.password}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(credentials.admin.password, 'admin-pass')}
                      >
                        {copied === 'admin-pass' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">🏥 Recepção</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="font-mono text-sm">{credentials.recepcao.email}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(credentials.recepcao.email, 'rec-email')}
                      >
                        {copied === 'rec-email' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="font-mono text-sm">{credentials.recepcao.password}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(credentials.recepcao.password, 'rec-pass')}
                      >
                        {copied === 'rec-pass' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>IMPORTANTE:</strong> Salve estas credenciais em local seguro. 
                  Você pode agora fazer login com qualquer uma dessas contas.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;