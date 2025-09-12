import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SafetyConfig {
  max_messages_per_hour: number;
  max_messages_per_day: number;
  min_delay_minutes: number;
  max_delay_minutes: number;
  warming_mode: boolean;
  daily_warming_limit: number;
}

interface SafetyStatus {
  canSend: boolean;
  nextSendTime: Date | null;
  messagesThisHour: number;
  messagesThisDay: number;
  statusMessage: string;
  statusType: 'safe' | 'warning' | 'blocked';
}

export const useWhatsAppSafety = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState<SafetyConfig>({
    max_messages_per_hour: 20,
    max_messages_per_day: 50,
    min_delay_minutes: 0,  // Removido delay para teste
    max_delay_minutes: 1,  // Delay mínimo para teste
    warming_mode: false,   // Desabilitado para teste
    daily_warming_limit: 5
  });
  
  const [status, setStatus] = useState<SafetyStatus>({
    canSend: true,
    nextSendTime: null,
    messagesThisHour: 0,
    messagesThisDay: 0,
    statusMessage: '🟢 Modo Teste - Envio Liberado',
    statusType: 'safe'
  });

  const [lastSendTime, setLastSendTime] = useState<Date | null>(null);

  // Carrega configuração do usuário
  useEffect(() => {
    const loadConfig = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('whatsapp_safety_config')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setConfig({
          max_messages_per_hour: data.max_messages_per_hour,
          max_messages_per_day: data.max_messages_per_day,
          min_delay_minutes: data.min_delay_minutes,
          max_delay_minutes: data.max_delay_minutes,
          warming_mode: data.warming_mode,
          daily_warming_limit: data.daily_warming_limit
        });
      } else {
        // Cria configuração padrão
        await createDefaultConfig();
      }
    };

    loadConfig();
  }, [user]);

  // Verifica status de envio em tempo real
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Conta mensagens da última hora
      const { data: hourlyMessages } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('sent_by', user.id)
        .gte('sent_at', oneHourAgo.toISOString());

      // Conta mensagens do dia
      const { data: dailyMessages } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('sent_by', user.id)
        .gte('sent_at', startOfDay.toISOString());

      const messagesThisHour = hourlyMessages?.length || 0;
      const messagesThisDay = dailyMessages?.length || 0;

      // Pega último envio
      const { data: lastMessage } = await supabase
        .from('whatsapp_messages')
        .select('sent_at')
        .eq('sent_by', user.id)
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastMessage) {
        setLastSendTime(new Date(lastMessage.sent_at));
      }

      updateSafetyStatus(messagesThisHour, messagesThisDay, lastMessage?.sent_at);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Atualiza a cada 30s

    return () => clearInterval(interval);
  }, [user, config]);

  const createDefaultConfig = async () => {
    if (!user) return;

    await supabase
      .from('whatsapp_safety_config')
      .insert({
        user_id: user.id,
        max_messages_per_hour: config.max_messages_per_hour,
        max_messages_per_day: config.max_messages_per_day,
        min_delay_minutes: config.min_delay_minutes,
        max_delay_minutes: config.max_delay_minutes,
        warming_mode: config.warming_mode,
        daily_warming_limit: config.daily_warming_limit
      });
  };

  const updateSafetyStatus = (messagesThisHour: number, messagesThisDay: number, lastSentAt?: string) => {
    const now = new Date();
    let canSend = true;
    let nextSendTime: Date | null = null;
    let statusMessage = '🟢 Liberado para teste';
    let statusType: 'safe' | 'warning' | 'blocked' = 'safe';

    // MODO TESTE - sempre permitir envio
    if (config.min_delay_minutes === 0) {
      canSend = true;
      statusMessage = '🟢 Modo Teste - Envio Liberado';
      statusType = 'safe';
    }
    // Verifica limite diário (apenas se não estiver em modo teste)
    else if (messagesThisDay >= (config.warming_mode ? config.daily_warming_limit : config.max_messages_per_day)) {
      canSend = false;
      statusMessage = `🛑 Limite diário atingido (${messagesThisDay}/${config.warming_mode ? config.daily_warming_limit : config.max_messages_per_day})`;
      statusType = 'blocked';
    }
    // Verifica limite por hora
    else if (messagesThisHour >= config.max_messages_per_hour) {
      canSend = false;
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      nextSendTime = nextHour;
      statusMessage = `⏰ Limite/hora atingido. Próximo envio: ${nextHour.toLocaleTimeString()}`;
      statusType = 'blocked';
    }
    // Verifica delay entre envios (apenas se não estiver em modo teste)
    else if (lastSentAt && config.min_delay_minutes > 0) {
      const lastSent = new Date(lastSentAt);
      const minDelayMs = config.min_delay_minutes * 60 * 1000;
      const nextAllowedTime = new Date(lastSent.getTime() + minDelayMs);
      
      if (now < nextAllowedTime) {
        canSend = false;
        nextSendTime = nextAllowedTime;
        const remaining = Math.ceil((nextAllowedTime.getTime() - now.getTime()) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        statusMessage = `⏳ Aguarde ${minutes}min ${seconds}s para envio seguro`;
        statusType = 'warning';
      }
    }

    setStatus({
      canSend,
      nextSendTime,
      messagesThisHour,
      messagesThisDay,
      statusMessage,
      statusType
    });
  };

  const updateConfig = async (newConfig: Partial<SafetyConfig>) => {
    if (!user) return;

    const updatedConfig = { ...config, ...newConfig };
    
    await supabase
      .from('whatsapp_safety_config')
      .upsert({
        user_id: user.id,
        ...updatedConfig
      });

    setConfig(updatedConfig);
  };

  const getRandomTemplate = async () => {
    const { data: templates } = await supabase
      .from('whatsapp_message_templates')
      .select('*')
      .eq('is_active', true);

    if (!templates || templates.length === 0) {
      return null;
    }

    // Pega template com menor uso para rotação equilibrada
    const sortedTemplates = templates.sort((a, b) => a.usage_count - b.usage_count);
    const selectedTemplate = sortedTemplates[0];

    // Atualiza contador de uso
    await supabase
      .from('whatsapp_message_templates')
      .update({ usage_count: selectedTemplate.usage_count + 1 })
      .eq('id', selectedTemplate.id);

    return selectedTemplate;
  };

  const calculateOptimalDelay = () => {
    const minMs = config.min_delay_minutes * 60 * 1000;
    const maxMs = config.max_delay_minutes * 60 * 1000;
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  };

  return {
    config,
    status,
    lastSendTime,
    updateConfig,
    getRandomTemplate,
    calculateOptimalDelay
  };
};