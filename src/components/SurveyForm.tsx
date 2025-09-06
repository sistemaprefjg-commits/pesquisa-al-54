import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Heart, Send, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SurveyForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    loadActiveSurvey();
  }, []);

  const loadActiveSurvey = async () => {
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('Error loading survey:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar pesquisa. Usando formulário padrão.",
          variant: "destructive"
        });
      } else if (data && data.length > 0) {
        setSurveyData(data[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const calculateSatisfactionScore = () => {
    const ratings = [
      parseInt(formData.satisfaction) || 0,
      getNumericRating(formData.service),
      getNumericRating(formData.professionalCare),
      getNumericRating(formData.waiting),
      getNumericRating(formData.cleanliness),
      getNumericRating(formData.recommendation)
    ].filter(rating => rating > 0);

    return ratings.length > 0 ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) : 3;
  };

  const getNumericRating = (value: string) => {
    const ratingMap: { [key: string]: number } = {
      'Excelente': 5, 'Sim, com certeza': 5, 'Muito rápido (0-15 min)': 5,
      'Bom': 4, 'Sim, provavelmente': 4, 'Rápido (16-30 min)': 4,
      'Regular': 3, 'Talvez': 3, 'Moderado (31-60 min)': 3,
      'Ruim': 2, 'Provavelmente não': 2, 'Demorado (1-2 horas)': 2,
      'Péssimo': 1, 'Definitivamente não': 1, 'Muito demorado (+2 horas)': 1
    };
    return ratingMap[value] || 3;
  };

  const saveResponse = async () => {
    setIsSubmitting(true);
    try {
      // Debug logs
      console.log('Survey data:', surveyData);
      console.log('Form data:', formData);
      
      // Garantir que temos um survey_id válido
      let surveyId = surveyData?.id;
      
      // Se não tiver survey data, buscar uma pesquisa ativa
      if (!surveyId) {
        const { data: activeSurvey } = await supabase
          .from('surveys')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();
        
        if (activeSurvey) {
          setSurveyData(activeSurvey);
          surveyId = activeSurvey.id;
        }
      }

      if (!surveyId) {
        console.error('No survey ID available');
        throw new Error('Pesquisa não encontrada. Tente recarregar a página.');
      }

      const responses = {
        atendimento: formData.satisfaction,
        qualidade_servico: formData.service,
        atendimento_profissionais: formData.professionalCare,
        tempo_espera: formData.waiting,
        limpeza: formData.cleanliness,
        recomendaria: formData.recommendation,
        comentarios: formData.complaints,
        sugestoes: formData.suggestions,
        bairro: formData.neighborhood
      };

      console.log('Using survey ID:', surveyId);

      const { error } = await supabase
        .from('survey_responses')
        .insert({
          survey_id: surveyId,
          patient_name: formData.patientName || 'Anônimo',
          patient_phone: formData.phone,
          responses: responses,
          satisfaction_score: calculateSatisfactionScore()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Obrigado!",
        description: "Sua pesquisa foi enviada com sucesso.",
      });
      
      navigate('/survey-success');
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar resposta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await saveResponse();
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
          saveResponse();
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [currentStep, canProceed, totalSteps]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 mx-auto text-primary animate-pulse mb-4" />
          <p>Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex flex-col">
      {/* Header com progresso */}
      <div className="w-full p-3 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Heart className="h-4 w-4 md:h-6 md:w-6 text-primary" />
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                Pesquisa de Satisfação
              </span>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">
              {currentStep + 1} de {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex items-start justify-center px-3 md:px-6 pb-3 md:pb-6">
        <div className="w-full max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-12">
            {/* Container da pergunta com animação */}
            <div className="animate-fade-in">
              {/* Pergunta de informações pessoais */}
              {currentQuestion.type === "info" && (
                <div className="text-center space-y-4 md:space-y-8">
                  <div className="space-y-2 md:space-y-4">
                    <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-foreground">
                      {currentQuestion.title}
                    </h1>
                    <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                      Responda rapidamente para nos ajudar a melhorar nossos serviços
                    </p>
                  </div>
                  
                  <div className="max-w-md mx-auto space-y-3 md:space-y-6 px-4">
                    {currentQuestion.fields.map((field, index) => (
                      <div key={field.key} className="space-y-1 md:space-y-2">
                        <Label 
                          htmlFor={field.key} 
                          className="text-sm md:text-lg font-medium text-left block"
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
                          className="text-sm md:text-lg p-2.5 md:p-4 h-10 md:h-14"
                          autoFocus={index === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pergunta de múltipla escolha */}
              {currentQuestion.type === "radio" && (
                <div className="text-center space-y-3 md:space-y-8">
                  <div className="space-y-1 md:space-y-4 px-4">
                    <div className="text-xs md:text-sm font-medium text-primary uppercase tracking-wider">
                      {currentQuestion.title}
                    </div>
                    <h1 className="text-base md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight">
                      {currentQuestion.question}
                    </h1>
                  </div>
                  
                  <div className="max-w-2xl mx-auto px-4">
                    <RadioGroup
                      value={formData[currentQuestion.id as keyof typeof formData]}
                      onValueChange={(value) => handleInputChange(currentQuestion.id, value)}
                      className="space-y-1.5 md:space-y-4"
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
                              className="flex items-center justify-between w-full p-2.5 md:p-6 text-left border-2 border-border rounded-lg md:rounded-xl cursor-pointer transition-all hover:border-primary hover:bg-primary/5 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary group-hover:scale-[1.01] md:group-hover:scale-[1.02]"
                            >
                              <div className="flex items-center gap-2 md:gap-4">
                                <div className="text-sm md:text-2xl font-bold text-muted-foreground peer-checked:text-primary transition-colors min-w-[20px] md:min-w-[32px]">
                                  {String.fromCharCode(65 + index)}
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-3">
                                  {optionIcon && <span className="text-base md:text-2xl">{optionIcon}</span>}
                                  <span className="text-xs md:text-lg font-medium">{optionLabel}</span>
                                </div>
                              </div>
                              <ArrowRight className="h-3 w-3 md:h-5 md:w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <div className="text-center space-y-4 md:space-y-8">
                  <div className="space-y-2 md:space-y-4 px-4">
                    <h1 className="text-xl md:text-4xl lg:text-5xl font-bold text-foreground">
                      {currentQuestion.title}
                    </h1>
                    <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
                      Seus comentários são muito importantes para nós
                    </p>
                  </div>
                  
                  <div className="max-w-2xl mx-auto space-y-4 md:space-y-8 px-4">
                    {currentQuestion.fields.map((field) => (
                      <div key={field.key} className="space-y-2 md:space-y-4">
                        <Label 
                          htmlFor={field.key} 
                          className="text-base md:text-xl font-medium block"
                        >
                          {field.label}
                        </Label>
                        <Textarea
                          id={field.key}
                          placeholder={field.placeholder}
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className="min-h-[80px] md:min-h-[120px] text-sm md:text-lg p-2.5 md:p-4 resize-none"
                          autoFocus
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navegação */}
            <div className="flex justify-center px-4 mt-4 md:mt-0">
              <div className="flex gap-2 md:gap-4 max-w-md w-full">
                {currentStep > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePrevious}
                    className="px-3 md:px-8 py-2 md:py-3 text-xs md:text-base"
                  >
                    <ChevronLeft className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                    Anterior
                  </Button>
                )}
                
                <Button 
                  type="submit" 
                  className="flex-1 px-3 md:px-8 py-2 md:py-3 text-xs md:text-base"
                  disabled={!canProceed() || isSubmitting}
                >
                  {isLastStep ? (
                    <>
                      <Send className="mr-1 md:mr-2 h-3 w-3 md:h-5 md:w-5" />
                      {isSubmitting ? 'Enviando...' : 'Enviar'}
                    </>
                  ) : (
                    <>
                      {canProceed() ? 'Continuar' : 'Selecione uma opção'}
                      {canProceed() && <ChevronRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Dica de navegação */}
          {canProceed() && !isLastStep && (
            <div className="text-center mt-3 md:mt-8 px-4">
              <p className="text-xs md:text-sm text-muted-foreground">
                💡 Pressione <kbd className="px-1 md:px-2 py-0.5 md:py-1 bg-muted rounded text-xs font-mono">Enter</kbd> para continuar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;