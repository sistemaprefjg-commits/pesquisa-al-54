import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SafetyStatusPanelProps {
  status: {
    canSend: boolean;
    nextSendTime: Date | null;
    messagesThisHour: number;
    messagesThisDay: number;
    statusMessage: string;
    statusType: 'safe' | 'warning' | 'blocked';
  };
  config: {
    max_messages_per_hour: number;
    max_messages_per_day: number;
    warming_mode: boolean;
    daily_warming_limit: number;
  };
  lastSendTime: Date | null;
}

const SafetyStatusPanel: React.FC<SafetyStatusPanelProps> = ({
  status,
  config,
  lastSendTime
}) => {
  const getStatusIcon = () => {
    switch (status.statusType) {
      case 'safe':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'blocked':
        return <Shield className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusVariant = () => {
    switch (status.statusType) {
      case 'safe':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCountdown = (targetTime: Date) => {
    const now = new Date();
    const diff = Math.max(0, targetTime.getTime() - now.getTime());
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}min ${seconds}s`;
  };

  const dailyLimit = config.warming_mode ? config.daily_warming_limit : config.max_messages_per_day;

  return (
    <Card className="shadow-card border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">Status de Segurança</span>
          </div>
          <Badge variant={getStatusVariant()}>
            {status.statusMessage}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {/* Contadores */}
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {status.messagesThisHour}/{config.max_messages_per_hour}
            </div>
            <div className="text-muted-foreground">Por hora</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {status.messagesThisDay}/{dailyLimit}
            </div>
            <div className="text-muted-foreground">Hoje</div>
          </div>

          {/* Último envio */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs">
                {lastSendTime ? formatTime(lastSendTime) : 'Nenhum'}
              </span>
            </div>
            <div className="text-muted-foreground">Último envio</div>
          </div>

          {/* Próximo envio */}
          <div className="text-center">
            {status.nextSendTime && !status.canSend ? (
              <>
                <div className="text-xs font-mono">
                  {formatCountdown(status.nextSendTime)}
                </div>
                <div className="text-muted-foreground">Liberado em</div>
              </>
            ) : (
              <>
                <div className="text-green-600 font-bold">✓</div>
                <div className="text-muted-foreground">Liberado</div>
              </>
            )}
          </div>
        </div>

        {/* Modo Aquecimento */}
        {config.warming_mode && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 text-xs">
              <Shield className="h-3 w-3" />
              <span>Modo Aquecimento Ativo - Limite: {config.daily_warming_limit} msgs/dia</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SafetyStatusPanel;