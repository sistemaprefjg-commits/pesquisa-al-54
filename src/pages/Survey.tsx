import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SurveyForm from "@/components/SurveyForm";
import heroImage from "@/assets/hero-hospital.jpg";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Survey = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center text-primary-foreground">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold">
                Hospital Municipal Ana Anita Gomes Fragoso
              </h1>
            </div>
            <p className="text-xl opacity-90">
              Pesquisa de Satisfação do Paciente
            </p>
            <p className="text-sm opacity-75 mt-2">
              Sua opinião é muito importante para melhorarmos nossos serviços
            </p>
          </div>
        </div>
      </section>

      {/* Survey Content */}
      <section className="container mx-auto px-4 py-8 -mt-8 relative z-10">
        <Card className="shadow-medical bg-card/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <SurveyForm />
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-card border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
            <Heart className="h-4 w-4" />
            <span className="text-sm">Hospital Municipal Ana Anita Gomes Fragoso - Cuidando de você com excelência</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Suas respostas são confidenciais e nos ajudam a melhorar nossos serviços
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Sistema
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Survey;