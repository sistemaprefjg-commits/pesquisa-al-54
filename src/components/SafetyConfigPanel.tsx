import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SafetyConfigPanelProps {
  config: {
    max_messages_per_hour: number;
    max_messages_per_day: number;
    min_delay_minutes: number;
    max_delay_minutes: number;
    warming_mode: boolean;
    daily_warming_limit: number;
  };
  onUpdateConfig: (config: any) => Promise<void>;
}

const SafetyConfigPanel: React.FC<SafetyConfigPanelProps> = ({
  config,
  onUpdateConfig
}) => {
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState(config);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateConfig(localConfig);
      toast({
        title: "Configurações salvas!",
        description: "As novas configurações de segurança foram aplicadas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isExpanded) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações Anti-Ban
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Configurações de Segurança
        </CardTitle>
        <CardDescription>
          Ajuste os limites para evitar bloqueios do WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Limites de envio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxHour">Máximo por hora</Label>
            <Input
              id="maxHour"
              type="number"
              min="1"
              max="50"
              value={localConfig.max_messages_per_hour}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                max_messages_per_hour: parseInt(e.target.value) || 20
              }))}
            />
          </div>
          <div>
            <Label htmlFor="maxDay">Máximo por dia</Label>
            <Input
              id="maxDay"
              type="number"
              min="1"
              max="200"
              value={localConfig.max_messages_per_day}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                max_messages_per_day: parseInt(e.target.value) || 50
              }))}
            />
          </div>
        </div>

        {/* Delays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minDelay">Delay mínimo (min)</Label>
            <Input
              id="minDelay"
              type="number"
              min="1"
              max="30"
              value={localConfig.min_delay_minutes}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                min_delay_minutes: parseInt(e.target.value) || 2
              }))}
            />
          </div>
          <div>
            <Label htmlFor="maxDelay">Delay máximo (min)</Label>
            <Input
              id="maxDelay"
              type="number"
              min="2"
              max="60"
              value={localConfig.max_delay_minutes}
              onChange={(e) => setLocalConfig(prev => ({
                ...prev,
                max_delay_minutes: parseInt(e.target.value) || 5
              }))}
            />
          </div>
        </div>

        {/* Modo Aquecimento */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="warmingMode"
              checked={localConfig.warming_mode}
              onCheckedChange={(checked) => setLocalConfig(prev => ({
                ...prev,
                warming_mode: checked
              }))}
            />
            <Label htmlFor="warmingMode">Modo Aquecimento</Label>
          </div>
          
          {localConfig.warming_mode && (
            <div>
              <Label htmlFor="warmingLimit">Limite durante aquecimento</Label>
              <Input
                id="warmingLimit"
                type="number"
                min="1"
                max="50"
                value={localConfig.daily_warming_limit}
                onChange={(e) => setLocalConfig(prev => ({
                  ...prev,
                  daily_warming_limit: parseInt(e.target.value) || 10
                }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Limite reduzido para números novos evitarem banimento
              </p>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsExpanded(false)}
          >
            Fechar
          </Button>
        </div>

        {/* Dicas */}
        <div className="bg-muted p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 Dicas para evitar banimentos:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Começe com limites baixos e aumente gradualmente</li>
            <li>• Use delays aleatórios entre 2-5 minutos</li>
            <li>• Ative o modo aquecimento para números novos</li>
            <li>• Evite enviar muitas mensagens idênticas seguidas</li>
            <li>• Monitore sempre o status de segurança</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyConfigPanel;