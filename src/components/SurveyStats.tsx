import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

const SurveyStats = () => {
  const satisfactionData = [
    { level: "Muito Satisfeito", count: 342, percentage: 38, color: "bg-success" },
    { level: "Satisfeito", count: 289, percentage: 32, color: "bg-primary" },
    { level: "Regular", count: 178, percentage: 20, color: "bg-warning" },
    { level: "Insatisfeito", count: 67, percentage: 8, color: "bg-orange-500" },
    { level: "Muito Insatisfeito", count: 16, percentage: 2, color: "bg-destructive" },
  ];

  const serviceMetrics = [
    { 
      title: "Qualidade do Atendimento Médico", 
      score: 4.3, 
      trend: +0.2, 
      responses: 892,
      distribution: { excelente: 45, bom: 35, regular: 15, ruim: 4, pessimo: 1 }
    },
    { 
      title: "Tempo de Espera", 
      score: 3.1, 
      trend: -0.1, 
      responses: 892,
      distribution: { excelente: 15, bom: 25, regular: 35, ruim: 20, pessimo: 5 }
    },
    { 
      title: "Limpeza e Organização", 
      score: 4.5, 
      trend: +0.3, 
      responses: 892,
      distribution: { excelente: 55, bom: 30, regular: 12, ruim: 2, pessimo: 1 }
    },
    { 
      title: "Recomendação", 
      score: 4.2, 
      trend: +0.1, 
      responses: 892,
      distribution: { excelente: 42, bom: 38, regular: 15, ruim: 4, pessimo: 1 }
    }
  ];

  const urgentIssues = [
    { issue: "Demora excessiva na emergência", count: 12, priority: "alta" },
    { issue: "Falta de medicamentos", count: 8, priority: "alta" },
    { issue: "Atendimento na recepção", count: 5, priority: "média" },
    { issue: "Limpeza dos banheiros", count: 3, priority: "baixa" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "bg-destructive text-destructive-foreground";
      case "média": return "bg-warning text-warning-foreground";
      case "baixa": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Satisfaction Distribution */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Distribuição da Satisfação Geral
          </CardTitle>
          <CardDescription>
            Baseado em {satisfactionData.reduce((sum, item) => sum + item.count, 0)} respostas coletadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {satisfactionData.map((item) => (
              <div key={item.level} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.level}</span>
                  <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Metrics */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Métricas de Serviço</CardTitle>
            <CardDescription>Avaliação detalhada por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {serviceMetrics.map((metric) => (
                <div key={metric.title} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{metric.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-primary">
                          {metric.score}
                        </span>
                        <span className="text-sm text-muted-foreground">/5.0</span>
                        <div className={`flex items-center gap-1 text-xs ${
                          metric.trend > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {metric.trend > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(metric.trend).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div 
                      className="bg-success rounded-sm" 
                      style={{ width: `${metric.distribution.excelente}%` }}
                    />
                    <div 
                      className="bg-primary rounded-sm" 
                      style={{ width: `${metric.distribution.bom}%` }}
                    />
                    <div 
                      className="bg-warning rounded-sm" 
                      style={{ width: `${metric.distribution.regular}%` }}
                    />
                    <div 
                      className="bg-orange-500 rounded-sm" 
                      style={{ width: `${metric.distribution.ruim}%` }}
                    />
                    <div 
                      className="bg-destructive rounded-sm" 
                      style={{ width: `${metric.distribution.pessimo}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.responses} respostas
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Urgent Issues */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Questões Prioritárias
            </CardTitle>
            <CardDescription>
              Problemas reportados que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentIssues.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.issue}</p>
                    <p className="text-xs text-muted-foreground">{item.count} relatos</p>
                  </div>
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span>15 questões foram resolvidas este mês</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SurveyStats;