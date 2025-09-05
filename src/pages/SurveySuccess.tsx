import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SurveySuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto shadow-medical bg-card/95 backdrop-blur-sm text-center">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Feedback Enviado com Sucesso!
              </h1>
              <p className="text-muted-foreground">
                Obrigado por dedicar seu tempo para avaliar nossos serviços.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Sua opinião é muito importante para nós!
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Vamos usar seu feedback para continuar melhorando nossos serviços.
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SurveySuccess;