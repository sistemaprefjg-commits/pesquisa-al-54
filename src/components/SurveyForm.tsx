import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Star, Heart, Send } from "lucide-react";

const SurveyForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    satisfaction: "",
    service: "",
    waiting: "",
    cleanliness: "",
    staff: "",
    recommendation: "",
    complaints: "",
    suggestions: "",
    patientName: "",
    phone: "",
    neighborhood: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular envio da pesquisa e redirecionar para página de sucesso
    navigate('/survey-success');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Heart className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Pesquisa de Satisfação</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Sua opinião nos ajuda a melhorar nossos serviços
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados do Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="patientName">Nome (opcional)</Label>
              <Input
                id="patientName"
                placeholder="Seu nome"
                value={formData.patientName}
                onChange={(e) => handleInputChange("patientName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                placeholder="Seu bairro"
                value={formData.neighborhood}
                onChange={(e) => handleInputChange("neighborhood", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Avaliação Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avaliação do Atendimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">
                Como você avalia sua satisfação geral com o atendimento?
              </Label>
              <RadioGroup
                value={formData.satisfaction}
                onValueChange={(value) => handleInputChange("satisfaction", value)}
                className="mt-3"
              >
                {[
                  { value: "5", label: "Muito Satisfeito", icon: "😊" },
                  { value: "4", label: "Satisfeito", icon: "🙂" },
                  { value: "3", label: "Regular", icon: "😐" },
                  { value: "2", label: "Insatisfeito", icon: "😕" },
                  { value: "1", label: "Muito Insatisfeito", icon: "😞" },
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`satisfaction-${option.value}`} />
                    <Label htmlFor={`satisfaction-${option.value}`} className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">
                Como você avalia a qualidade do serviço médico?
              </Label>
              <RadioGroup
                value={formData.service}
                onValueChange={(value) => handleInputChange("service", value)}
                className="mt-3"
              >
                {["Excelente", "Bom", "Regular", "Ruim", "Péssimo"].map((option, index) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`service-${option}`} />
                    <Label htmlFor={`service-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">
                Como você avalia o tempo de espera?
              </Label>
              <RadioGroup
                value={formData.waiting}
                onValueChange={(value) => handleInputChange("waiting", value)}
                className="mt-3"
              >
                {[
                  "Muito rápido (0-15 min)",
                  "Rápido (16-30 min)", 
                  "Moderado (31-60 min)",
                  "Demorado (1-2 horas)",
                  "Muito demorado (+2 horas)"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`waiting-${option}`} />
                    <Label htmlFor={`waiting-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">
                Como você avalia a limpeza e organização do hospital?
              </Label>
              <RadioGroup
                value={formData.cleanliness}
                onValueChange={(value) => handleInputChange("cleanliness", value)}
                className="mt-3"
              >
                {["Excelente", "Bom", "Regular", "Ruim", "Péssimo"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`cleanliness-${option}`} />
                    <Label htmlFor={`cleanliness-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">
                Você recomendaria nosso hospital para familiares e amigos?
              </Label>
              <RadioGroup
                value={formData.recommendation}
                onValueChange={(value) => handleInputChange("recommendation", value)}
                className="mt-3"
              >
                {["Sim, com certeza", "Sim, provavelmente", "Talvez", "Provavelmente não", "Definitivamente não"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`rec-${option}`} />
                    <Label htmlFor={`rec-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Comentários e Sugestões */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comentários e Sugestões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="complaints" className="text-base font-medium">
                Você tem alguma reclamação ou problema a relatar?
              </Label>
              <Textarea
                id="complaints"
                placeholder="Descreva sua reclamação ou problema..."
                value={formData.complaints}
                onChange={(e) => handleInputChange("complaints", e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="suggestions" className="text-base font-medium">
                Sugestões para melhorarmos nossos serviços:
              </Label>
              <Textarea
                id="suggestions"
                placeholder="Suas sugestões são muito importantes para nós..."
                value={formData.suggestions}
                onChange={(e) => handleInputChange("suggestions", e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg">
          <Send className="mr-2 h-4 w-4" />
          Enviar Avaliação
        </Button>
      </form>
    </div>
  );
};

export default SurveyForm;