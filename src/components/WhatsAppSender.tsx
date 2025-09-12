import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Copy, Link as LinkIcon, User, Edit, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const WhatsAppSender = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [patientData, setPatientData] = useState({
    name: "",
    phone: "",
    additionalMessage: ""
  });
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messageVariationIndex, setMessageVariationIndex] = useState(0);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  // URL do formulário de pesquisa
  const surveyUrl = `${window.location.origin}/formulario`;

  // Variações de mensagem para evitar SPAM
  const messageVariations = [
    {
      greeting: "Olá ${name}! 👋",
      intro: "Sua opinião é muito importante para melhorarmos nosso atendimento.",
      action: "Por favor, responda nossa breve pesquisa de satisfação:",
      features: ["⏰ Apenas 2 minutos", "📝 Totalmente confidencial", "💙 Nos ajuda a cuidar melhor de você"],
      closing: "Muito obrigado pelo seu tempo!"
    },
    {
      greeting: "Oi ${name}! 😊",
      intro: "Queremos saber como foi sua experiência conosco hoje.",
      action: "Compartilhe sua opinião nesta pesquisa rápida:",
      features: ["🕐 Super rápido - 2 min", "🔒 Suas respostas são privadas", "❤️ Sua avaliação nos motiva"],
      closing: "Agradecemos sua colaboração!"
    },
    {
      greeting: "Prezado(a) ${name}! ✨",
      intro: "Seu feedback é fundamental para aprimorarmos nossos serviços.",
      action: "Dedique alguns minutos para avaliar seu atendimento:",
      features: ["⚡ Questionário de 2 minutos", "🛡️ Informações protegidas", "🌟 Ajude-nos a melhorar sempre"],
      closing: "Obrigado por nos ajudar a crescer!"
    },
    {
      greeting: "Olá ${name}! 🤗",
      intro: "Esperamos que tenha tido uma boa experiência em nosso hospital.",
      action: "Conte-nos como foi através desta pesquisa:",
      features: ["⌚ Só 2 minutinhos", "🤐 Respostas confidenciais", "💝 Cada opinião importa muito"],
      closing: "Gratidão por sua participação!"
    },
    {
      greeting: "Oi ${name}! 👩‍⚕️",
      intro: "Sua avaliação é essencial para continuarmos evoluindo.",
      action: "Responda nossa pesquisa de satisfação:",
      features: ["🚀 Rápido - 2 minutos", "🔐 Dados seguros e sigilosos", "💪 Juntos melhoramos o atendimento"],
      closing: "Muito obrigado pela confiança!"
    }
  ];

  const generateMessage = (name: string) => {
    const variation = messageVariations[messageVariationIndex];
    const greeting = variation.greeting.replace('${name}', name || 'cidadão');
    
    return `${greeting}

${variation.intro} ${variation.action}

${surveyUrl}

${variation.features.join('\n')}

${variation.closing}
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

  const logWhatsAppMessage = async (phone: string, message: string, name: string) => {
    try {
      await supabase
        .from('whatsapp_messages')
        .insert({
          phone,
          message,
          patient_name: name,
          status: 'sent',
          sent_by: user?.id
        });
    } catch (error) {
      console.error('Error logging WhatsApp message:', error);
    }
  };

  const sendViaWhatsAppWeb = async () => {
    if (!patientData.phone) {
      toast({
        title: "Erro",
        description: "Por favor, insira o telefone da pessoa",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    const finalMessage = getCurrentMessage();
    
    // Limitar o tamanho da mensagem para evitar bloqueios
    const maxLength = 1000;
    const truncatedMessage = finalMessage.length > maxLength 
      ? finalMessage.substring(0, maxLength) + '...' 
      : finalMessage;
    
    const encodedMessage = encodeURIComponent(truncatedMessage);
    const phone = patientData.phone.replace(/\D/g, '');
    
    // Adicionar código do país se não estiver presente
    const fullPhone = phone.startsWith('55') ? phone : `55${phone}`;
    
    const whatsappUrl = `https://wa.me/${fullPhone}?text=${encodedMessage}`;
    
    // Verificar se a URL não está muito longa
    if (whatsappUrl.length > 2000) {
      toast({
        title: "Mensagem muito longa",
        description: "Por favor, reduza o tamanho da mensagem.",
        variant: "destructive",
      });
      setIsSending(false);
      return;
    }
    
    // Registrar o envio no banco
    await logWhatsAppMessage(fullPhone, truncatedMessage, patientData.name);
    
    // Abrir WhatsApp integrado no modal
    setShowWhatsAppModal(true);
    
    // Aguardar um pouco e então abrir a URL do WhatsApp
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1000);
    
    toast({
      title: "WhatsApp Integrado Aberto!",
      description: "Use o WhatsApp Web integrado ou a nova aba que foi aberta.",
    });

    // Limpar formulário após envio
    setPatientData({ name: "", phone: "", additionalMessage: "" });
    setCustomMessage("");
    setIsEditingMessage(false);
    setIsSending(false);
    
    // Rotacionar para próxima variação de mensagem
    setMessageVariationIndex((prev) => (prev + 1) % messageVariations.length);
  };

  const openIntegratedWhatsApp = () => {
    setShowWhatsAppModal(true);
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

      {/* WhatsApp Web Sender */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-success" />
            Enviar via WhatsApp
          </CardTitle>
          <CardDescription>
            Abre o WhatsApp Web com a mensagem e link do formulário preparados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={sendViaWhatsAppWeb}
              className="w-full"
              size="lg"
              disabled={!patientData.phone || isSending}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {isSending ? 'Preparando...' : 'Enviar para WhatsApp'}
            </Button>
            <Button 
              onClick={openIntegratedWhatsApp}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp Integrado
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * Certifique-se de estar logado no WhatsApp Web
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
                <li>• Clique em "Enviar para WhatsApp"</li>
                <li>• O WhatsApp Web abrirá com a mensagem pronta</li>
                <li>• Clique em enviar no WhatsApp para finalizar</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Para evitar bloqueios:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Evite enviar muitas mensagens seguidas</li>
                <li>• Personalize as mensagens quando possível</li>
                <li>• Aguarde alguns segundos entre envios</li>
                <li>• Certifique-se de ter permissão da pessoa</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Web Integrado - Modal */}
      <Dialog open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal}>
        <DialogContent className="max-w-6xl h-[80vh] p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-success" />
                WhatsApp Web Integrado
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWhatsAppModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Use o WhatsApp Web diretamente no sistema. Escaneie o QR code se necessário.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-4 pt-0">
            <iframe
              src="https://web.whatsapp.com"
              className="w-full h-full border-0 rounded-lg"
              title="WhatsApp Web"
              allow="camera; microphone"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppSender;