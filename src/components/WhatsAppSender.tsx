import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Copy, Link as LinkIcon, User, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsAppSafety } from "@/hooks/useWhatsAppSafety";
import SafetyStatusPanel from "@/components/SafetyStatusPanel";
import SafetyConfigPanel from "@/components/SafetyConfigPanel";

const WhatsAppSender = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { config, status, lastSendTime, updateConfig, getRandomTemplate, calculateOptimalDelay } = useWhatsAppSafety();
  
  const [patientData, setPatientData] = useState({
    name: "",
    phone: "",
    additionalMessage: ""
  });
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);

  // URL do formulário de pesquisa
  const surveyUrl = `${window.location.origin}/formulario`;

  // Carrega um template aleatório ao mudar o nome
  useEffect(() => {
    const loadTemplate = async () => {
      const template = await getRandomTemplate();
      setCurrentTemplate(template);
    };
    
    if (patientData.name) {
      loadTemplate();
    }
  }, [patientData.name]);

  const generateMessage = (name: string, useTemplate: boolean = true) => {
    if (useTemplate && currentTemplate) {
      return currentTemplate.template_text
        .replace(/{name}/g, name || 'cidadão')
        .replace(/{survey_url}/g, surveyUrl);
    }
    
    // Fallback para mensagem padrão
    return `Olá ${name || 'cidadão'}! 👋

Sua opinião é importante para melhorarmos. Responda nossa pesquisa de satisfação após o seu atendimento:

${surveyUrl}

⏰ 2 minutos
📝 Confidencial
💙 Nos ajuda a cuidar melhor

Obrigado!
Hospital Municipal Ana Anita Gomes Fragoso`;
  };

  const getCurrentMessage = () => {
    if (isEditingMessage && customMessage) {
      return customMessage;
    }
    const baseMessage = generateMessage(patientData.name);
    return patientData.additionalMessage 
      ? `${baseMessage}\n\n---\n${patientData.additionalMessage}`
      : baseMessage;
  };

  const handleEditMessage = () => {
    if (!isEditingMessage) {
      setCustomMessage(getCurrentMessage());
    }
    setIsEditingMessage(!isEditingMessage);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const logWhatsAppMessage = async (phone: string, message: string, name: string, templateId?: string, delayApplied?: number) => {
    try {
      await supabase
        .from('whatsapp_messages')
        .insert({
          phone,
          message,
          patient_name: name,
          status: 'sent',
          sent_by: user?.id,
          template_used_id: templateId,
          delay_applied_seconds: delayApplied ? Math.floor(delayApplied / 1000) : 0,
          safety_status: status.canSend ? 'normal' : 'delayed'
        });
    } catch (error) {
      console.error('Error logging WhatsApp message:', error);
    }
  };

  const sendViaMegaAPI = async () => {
    if (!patientData.phone) {
      toast({
        title: "Erro",
        description: "Por favor, insira o telefone da pessoa",
        variant: "destructive",
      });
      return;
    }

    // Verifica se pode enviar (controle de segurança)
    if (!status.canSend) {
      toast({
        title: "Envio bloqueado",
        description: status.statusMessage,
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    // Aplica delay inteligente se necessário
    const delayMs = calculateOptimalDelay();
    if (delayMs > 120000) { // Só mostra se delay > 2min
      toast({
        title: "Aguardando delay de segurança",
        description: `Enviando em ${Math.floor(delayMs / 60000)}min ${Math.floor((delayMs % 60000) / 1000)}s`,
      });
    }
    
    setTimeout(async () => {
      try {
        const finalMessage = getCurrentMessage();
        
        // Enviar mensagem via MegaAPI
        const response = await supabase.functions.invoke('send-whatsapp-message', {
          body: {
            phone: patientData.phone,
            message: finalMessage,
            patientName: patientData.name,
            userId: user?.id
          }
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        const result = response.data;
        
        if (result.success) {
          toast({
            title: "Mensagem Enviada!",
            description: `Mensagem enviada com sucesso para ${patientData.name} (${result.phoneUsed})`,
          });
        } else {
          throw new Error(result.error || 'Erro ao enviar mensagem');
        }

        // Limpar formulário após envio
        setPatientData({ name: "", phone: "", additionalMessage: "" });
        setCustomMessage("");
        setIsEditingMessage(false);
        setCurrentTemplate(null);
        
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar mensagem via API",
          variant: "destructive",
        });
      } finally {
        setIsSending(false);
      }
    }, delayMs > 120000 ? delayMs : 0); // Só aplica delay se > 2min, senão envia imediatamente
  };

  return (
    <div className="space-y-6">
      {/* Patient Data Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Dados da Pessoa
          </CardTitle>
          <CardDescription>
            Insira os dados do cidadão para enviar a pesquisa via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName">Nome da Pessoa</Label>
              <Input
                id="patientName"
                placeholder="Ex: Maria Silva"
                value={patientData.name}
                onChange={(e) => setPatientData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="patientPhone">Telefone (WhatsApp)</Label>
              <Input
                id="patientPhone"
                placeholder="Ex: (11) 99999-9999"
                value={patientData.phone}
                onChange={(e) => setPatientData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="additionalMessage">Mensagem Adicional (opcional)</Label>
            <Textarea
              id="additionalMessage"
              placeholder="Ex: Obrigado pela visita hoje. Esperamos que esteja se sentindo melhor."
              value={patientData.additionalMessage}
              onChange={(e) => setPatientData(prev => ({ ...prev, additionalMessage: e.target.value }))}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Message Preview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-success" />
            Prévia da Mensagem
          </CardTitle>
          <CardDescription>
            Esta é a mensagem que será enviada para a pessoa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditingMessage ? (
            <div className="space-y-4">
              <Label htmlFor="customMessage">Editar Mensagem</Label>
              <Textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-lg border-l-4 border-l-success">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {getCurrentMessage()}
              </pre>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button 
              variant={isEditingMessage ? "default" : "outline"}
              size="sm"
              onClick={handleEditMessage}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditingMessage ? "Salvar" : "Editar Mensagem"}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(getCurrentMessage())}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Mensagem
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(surveyUrl)}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MegaAPI Sender */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-success" />
            Enviar via API
          </CardTitle>
          <CardDescription>
            Envia a mensagem diretamente através da MegaAPI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={sendViaMegaAPI}
            className="w-full"
            size="lg"
            disabled={!patientData.phone || isSending || !status.canSend}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {isSending ? 'Enviando...' : 
             !status.canSend ? 'Aguarde para enviar' : 
             'Enviar via API'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            * Mensagem será enviada diretamente via MegaAPI
          </p>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Como Usar & Dicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Instruções:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Preencha o nome e telefone da pessoa</li>
                <li>• Adicione uma mensagem personalizada se desejar</li>
                <li>• Clique em "Enviar via API"</li>
                <li>• A mensagem será enviada diretamente pela MegaAPI</li>
                <li>• Aguarde a confirmação de entrega</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Modo Seguro Ativo:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ✅ Controle automático de limites por hora/dia</li>
                <li>• ✅ Delays inteligentes entre envios</li>
                <li>• ✅ Rotação automática de mensagens</li>
                <li>• ✅ Modo aquecimento para números novos</li>
                <li>• ✅ Monitoramento em tempo real</li>
                <li>• 🛡️ <strong>Proteção contra banimentos</strong></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Painel de Status de Segurança */}
      <SafetyStatusPanel 
        status={status}
        config={config}
        lastSendTime={lastSendTime}
      />

      {/* Painel de Configurações de Segurança */}
      <SafetyConfigPanel 
        config={config}
        onUpdateConfig={updateConfig}
      />
    </div>
  );
};

export default WhatsAppSender;