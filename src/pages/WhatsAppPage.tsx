import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import WhatsAppSender from '@/components/WhatsAppSender';

const WhatsAppPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'Envios WhatsApp' : 'Sistema de Envios - Recepção'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Olá, <strong>{user?.username}</strong>
              </span>
              <Button variant="outline" onClick={logout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WhatsAppSender />
      </main>
    </div>
  );
};

export default WhatsAppPage;