import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, MessageSquare, TrendingUp, Send, ClipboardList } from "lucide-react";
import SurveyForm from "@/components/SurveyForm";
import SurveyStats from "@/components/SurveyStats";
import ResponsesList from "@/components/ResponsesList";
import WhatsAppSender from "@/components/WhatsAppSender";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card border-b shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Sistema de Pesquisa Hospitalar
                </h1>
                <p className="text-sm text-muted-foreground">
                  Hospital Municipal - Controle de Satisfação
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              Versão 1.0
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="survey" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Pesquisa
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Respostas
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Envio WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Pacientes
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">1,234</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% em relação ao mês passado
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pesquisas Respondidas
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">892</div>
                  <p className="text-xs text-muted-foreground">
                    Taxa de resposta: 72%
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Satisfação Média
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">4.2/5</div>
                  <p className="text-xs text-muted-foreground">
                    +0.3 pontos este mês
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Queixas Abertas
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">23</div>
                  <p className="text-xs text-muted-foreground">
                    Requer ação imediata
                  </p>
                </CardContent>
              </Card>
            </div>

            <SurveyStats />
          </TabsContent>

          <TabsContent value="survey">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Formulário de Pesquisa de Satisfação</CardTitle>
                <CardDescription>
                  Visualização do formulário que será enviado aos pacientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SurveyForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses">
            <ResponsesList />
          </TabsContent>

          <TabsContent value="whatsapp">
            <WhatsAppSender />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;