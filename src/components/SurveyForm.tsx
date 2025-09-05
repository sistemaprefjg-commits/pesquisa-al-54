import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Star, Heart, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const SurveyForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    satisfaction: "",
    service: "",
    waiting: "",
    cleanliness: "",
    staff: "",
    professionalCare: "",
    recommendation: "",
    complaints: "",
    suggestions: "",
    patientName: "",
    phone: "",
    neighborhood: ""
  });

  const questions = [
    {
      id: "patientInfo",
      title: "Dados do Paciente",
      type: "info",
      fields: [
        { 
          key: "patientName", 
          label: "Nome (opcional)", 
          type: "input", 
          placeholder: "Seu nome",
          required: false
        },
        { 
          key: "phone", 
          label: "Telefone (opcional)", 
          type: "input", 
          placeholder: "(11) 99999-9999",
          required: false
        },
        { 
          key: "neighborhood", 
          label: "Bairro", 
          type: "input", 
          placeholder: "Seu bairro",
          required: true
        }
      ]
    },
    {
      id: "satisfaction",
      title: "Satisfação Geral",
      question: "Como você avalia sua satisfação geral com o atendimento?",
      type: "radio",
      options: [
        { value: "5", label: "Muito Satisfeito", icon: "😊" },
        { value: "4", label: "Satisfeito", icon: "🙂" },
        { value: "3", label: "Regular", icon: "😐" },
        { value: "2", label: "Insatisfeito", icon: "😕" },
        { value: "1", label: "Muito Insatisfeito", icon: "😞" },
      ]
    },
    {
      id: "service",
      title: "Qualidade do Serviço",
      question: "Como você avalia a qualidade do serviço médico?",
      type: "radio",
      options: ["Excelente", "Bom", "Regular", "Ruim", "Péssimo"]
    },
    {
      id: "professionalCare",
      title: "Atendimento dos Profissionais",
      question: "Como você avalia o atendimento dos técnicos e enfermeiros?",
      type: "radio",
      options: ["Excelente", "Bom", "Regular", "Ruim", "Péssimo"]
    },
    {
      id: "waiting",
      title: "Tempo de Espera",
      question: "Como você avalia o tempo de espera?",
      type: "radio",
      options: [
        "Muito rápido (0-15 min)",
        "Rápido (16-30 min)", 
        "Moderado (31-60 min)",
        "Demorado (1-2 horas)",
        "Muito demorado (+2 horas)"
      ]
    },
    {
      id: "cleanliness",
      title: "Limpeza e Organização",
      question: "Como você avalia a limpeza e organização do hospital?",
      type: "radio",
      options: ["Excelente", "Bom", "Regular", "Ruim", "Péssimo"]
    },
    {
      id: "recommendation",
      title: "Recomendação",
      question: "Você recomendaria nosso hospital para familiares e amigos?",
      type: "radio",
      options: ["Sim, com certeza", "Sim, provavelmente", "Talvez", "Provavelmente não", "Definitivamente não"]
    },
    {
      id: "feedback",
      title: "Comentários e Sugestões",
      type: "textarea",
      fields: [
        {
          key: "complaints",
          label: "Você tem alguma reclamação ou problema a relatar?",
          placeholder: "Descreva sua reclamação ou problema...",
          required: false
        },
        {
          key: "suggestions",
          label: "Sugestões para melhorarmos nossos serviços:",
          placeholder: "Suas sugestões são muito importantes para nós...",
          required: false
        }
      ]
    }
  ];

  const totalSteps = questions.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submeter pesquisa
      navigate('/survey-success');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const canProceed = () => {
    const current = questions[currentStep];
    
    if (current.type === "info") {
      return current.fields.some(field => 
        field.required ? formData[field.key as keyof typeof formData] : true
      );
    }
    
    if (current.type === "radio") {
      return formData[current.id as keyof typeof formData];
    }
    
    if (current.type === "textarea") {
      return true; // Comentários são opcionais
    }
    
    return true;
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
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pergunta {currentStep + 1} de {totalSteps}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentQuestion.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pergunta de informações pessoais */}
            {currentQuestion.type === "info" && (
              <div className="space-y-4">
                {currentQuestion.fields.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.key}
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Pergunta de múltipla escolha */}
            {currentQuestion.type === "radio" && (
              <div>
                <Label className="text-base font-medium">
                  {currentQuestion.question}
                </Label>
                <RadioGroup
                  value={formData[currentQuestion.id as keyof typeof formData]}
                  onValueChange={(value) => handleInputChange(currentQuestion.id, value)}
                  className="mt-3"
                >
                  {currentQuestion.options.map((option, index) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const optionIcon = typeof option === 'object' ? option.icon : null;
                    
                    return (
                      <div key={optionValue} className="flex items-center space-x-2">
                        <RadioGroupItem value={optionValue} id={`${currentQuestion.id}-${index}`} />
                        <Label htmlFor={`${currentQuestion.id}-${index}`} className="flex items-center gap-2">
                          {optionIcon && <span>{optionIcon}</span>}
                          {optionLabel}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            )}

            {/* Pergunta de texto livre */}
            {currentQuestion.type === "textarea" && (
              <div className="space-y-4">
                {currentQuestion.fields.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={field.key} className="text-base font-medium">
                      {field.label}
                    </Label>
                    <Textarea
                      id={field.key}
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          
          <Button 
            type="submit" 
            className="flex-1"
            disabled={!canProceed()}
          >
            {isLastStep ? (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Avaliação
              </>
            ) : (
              <>
                Próxima
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SurveyForm;