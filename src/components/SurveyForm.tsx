import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Heart, Send, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
      title: "Pesquisa de Satisfação",
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canProceed()) {
        e.preventDefault();
        if (currentStep < totalSteps - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          navigate('/survey-success');
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentStep, canProceed, navigate, totalSteps]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex flex-col">
      {/* Header com progresso */}
      <div className="w-full p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Pesquisa de Satisfação
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStep + 1} de {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex items-center justify-center px-6 pb-6">
        <div className="w-full max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Container da pergunta com animação */}
            <div className="animate-fade-in">
              {/* Pergunta de informações pessoais */}
              {currentQuestion.type === "info" && (
                <div className="text-center space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                      {currentQuestion.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Responda rapidamente para nos ajudar a melhorar nossos serviços
                    </p>
                  </div>
                  
                  <div className="max-w-md mx-auto space-y-6">
                    {currentQuestion.fields.map((field, index) => (
                      <div key={field.key} className="space-y-2">
                        <Label 
                          htmlFor={field.key} 
                          className="text-lg font-medium text-left block"
                        >
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.key}
                          placeholder={field.placeholder}
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          required={field.required}
                          className="text-lg p-4 h-14"
                          autoFocus={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pergunta de múltipla escolha */}
              {currentQuestion.type === "radio" && (
                <div className="text-center space-y-8">
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-primary uppercase tracking-wider">
                      {currentQuestion.title}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                      {currentQuestion.question}
                    </h1>
                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    <RadioGroup
                      value={formData[currentQuestion.id as keyof typeof formData]}
                      onValueChange={(value) => handleInputChange(currentQuestion.id, value)}
                      className="space-y-4"
                    >
                      {currentQuestion.options.map((option, index) => {
                        const optionValue = typeof option === 'object' ? option.value : option;
                        const optionLabel = typeof option === 'object' ? option.label : option;
                        const optionIcon = typeof option === 'object' ? option.icon : null;
                        
                        return (
                          <div 
                            key={optionValue} 
                            className="relative group"
                          >
                            <input
                              type="radio"
                              id={`${currentQuestion.id}-${index}`}
                              name={currentQuestion.id}
                              value={optionValue}
                              checked={formData[currentQuestion.id as keyof typeof formData] === optionValue}
                              onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                              className="peer sr-only"
                            />
                            <Label 
                              htmlFor={`${currentQuestion.id}-${index}`}
                              className="flex items-center justify-between w-full p-6 text-left border-2 border-border rounded-xl cursor-pointer transition-all hover:border-primary hover:bg-primary/5 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary group-hover:scale-[1.02]"
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-2xl font-bold text-muted-foreground peer-checked:text-primary transition-colors">
                                  {String.fromCharCode(65 + index)}
                                </div>
                                <div className="flex items-center gap-3">
                                  {optionIcon && <span className="text-2xl">{optionIcon}</span>}
                                  <span className="text-lg font-medium">{optionLabel}</span>
                                </div>
                              </div>
                              <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Pergunta de texto livre */}
              {currentQuestion.type === "textarea" && (
                <div className="text-center space-y-8">
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                      {currentQuestion.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Seus comentários são muito importantes para nós
                    </p>
                  </div>
                  
                  <div className="max-w-2xl mx-auto space-y-8">
                    {currentQuestion.fields.map((field) => (
                      <div key={field.key} className="space-y-4">
                        <Label 
                          htmlFor={field.key} 
                          className="text-xl font-medium block"
                        >
                          {field.label}
                        </Label>
                        <Textarea
                          id={field.key}
                          placeholder={field.placeholder}
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className="min-h-[120px] text-lg p-4 resize-none"
                          autoFocus
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navegação */}
            <div className="flex justify-center">
              <div className="flex gap-4 max-w-md w-full">
                {currentStep > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevious}
                    className="px-8 py-3 text-base"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  className="flex-1 px-8 py-3 text-base"
                  disabled={!canProceed()}
                >
                  {isLastStep ? (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar Avaliação
                    </>
                  ) : (
                    <>
                      {canProceed() ? 'Continuar' : 'Selecione uma opção'}
                      {canProceed() && <ChevronRight className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Dica de navegação */}
          {canProceed() && !isLastStep && (
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                💡 Pressione <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Enter</kbd> para continuar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;