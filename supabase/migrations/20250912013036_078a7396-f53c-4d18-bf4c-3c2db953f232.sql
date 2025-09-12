-- Tabela para configurações de segurança do WhatsApp
CREATE TABLE public.whatsapp_safety_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  max_messages_per_hour INTEGER NOT NULL DEFAULT 20,
  max_messages_per_day INTEGER NOT NULL DEFAULT 50,
  min_delay_minutes INTEGER NOT NULL DEFAULT 2,
  max_delay_minutes INTEGER NOT NULL DEFAULT 5,
  warming_mode BOOLEAN NOT NULL DEFAULT true,
  daily_warming_limit INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para templates de mensagem (rotação)
CREATE TABLE public.whatsapp_message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para controle de envios (já existe whatsapp_messages, vamos melhorar)
ALTER TABLE public.whatsapp_messages 
ADD COLUMN IF NOT EXISTS attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS delay_applied_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS template_used_id UUID REFERENCES public.whatsapp_message_templates(id),
ADD COLUMN IF NOT EXISTS safety_status TEXT DEFAULT 'normal' CHECK (safety_status IN ('normal', 'delayed', 'blocked', 'warming'));

-- Enable RLS
ALTER TABLE public.whatsapp_safety_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_templates ENABLE ROW LEVEL SECURITY;

-- Policies para whatsapp_safety_config
CREATE POLICY "Users can view their own safety config" 
ON public.whatsapp_safety_config 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own safety config" 
ON public.whatsapp_safety_config 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own safety config" 
ON public.whatsapp_safety_config 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policies para whatsapp_message_templates (público para leitura, apenas admins criam)
CREATE POLICY "Everyone can view active templates" 
ON public.whatsapp_message_templates 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage templates" 
ON public.whatsapp_message_templates 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Função para atualizar timestamps
CREATE TRIGGER update_safety_config_updated_at
BEFORE UPDATE ON public.whatsapp_safety_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.whatsapp_message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir templates padrão de mensagem
INSERT INTO public.whatsapp_message_templates (template_text) VALUES
('Olá {name}! 👋

Sua opinião é importante para melhorarmos. Responda nossa pesquisa de satisfação após o seu atendimento:

{survey_url}

⏰ 2 minutos
📝 Confidencial
💙 Nos ajuda a cuidar melhor

Obrigado!
Hospital Municipal Ana Anita Gomes Fragoso'),

('Oi {name}, gostaríamos de sua avaliação! 😊

Que tal nos ajudar respondendo uma pesquisa rápida sobre seu atendimento?

{survey_url}

✨ Apenas 2 minutos
🔒 Totalmente anônima
❤️ Sua opinião nos ajuda muito

Agradecemos!
Hospital Municipal Ana Anita Gomes Fragoso'),

('Bom dia {name}! ☀️

Como foi sua experiência conosco hoje? Nos conte respondendo nossa pesquisa:

{survey_url}

📋 Super rápida (2min)
🤝 Confidencial
🎯 Para melhorarmos sempre

Muito obrigado!
Hospital Municipal Ana Anita Gomes Fragoso'),

('{name}, sua experiência nos interessa muito! 💫

Poderia avaliar nosso atendimento? É rapidinho:

{survey_url}

⚡ 2 minutos apenas
🛡️ Resposta segura
💚 Nos ajuda a evoluir

Gratidão!
Hospital Municipal Ana Anita Gomes Fragoso'),

('Olá {name}, esperamos que esteja bem! 🌟

Sua avaliação sobre o atendimento é muito valiosa para nós:

{survey_url}

🕐 Só 2 minutinhos
🔐 Totalmente privada
💙 Faz toda diferença

Obrigado pelo cuidado!
Hospital Municipal Ana Anita Gomes Fragoso');