import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SurveyStats = () => {
  const [stats, setStats] = useState({
    totalResponses: 0,
    averageSatisfaction: 0,
    satisfactionDistribution: [] as any[],
    recentComplaints: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: responses, error } = await supabase
        .from('survey_responses')
        .select('satisfaction_score, responses, created_at');

      if (error) throw error;

      const totalResponses = responses.length;
      const avgSatisfaction = totalResponses > 0 
        ? responses.reduce((sum, r) => sum + (r.satisfaction_score || 3), 0) / totalResponses
        : 0;

      // Calculate satisfaction distribution
      const distribution = [1, 2, 3, 4, 5].map(score => {
        const count = responses.filter(r => (r.satisfaction_score || 3) === score).length;
        return {
          level: score === 5 ? "Muito Satisfeito" : 
                 score === 4 ? "Satisfeito" :
                 score === 3 ? "Regular" :
                 score === 2 ? "Insatisfeito" : "Muito Insatisfeito",
          count,
          percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0,
          color: score >= 4 ? "bg-success" : score === 3 ? "bg-warning" : "bg-destructive"
        };
      });

      // Get recent complaints
      const complaints = responses
        .filter(r => r.responses && typeof r.responses === 'object' && r.responses !== null && 'comentarios' in r.responses)
        .slice(0, 5)
        .map(r => ({
          issue: (r.responses as any).comentarios,
          count: 1,
          priority: (r.satisfaction_score || 3) <= 2 ? "alta" : "média"
        }));

      setStats({
        totalResponses,
        averageSatisfaction: avgSatisfaction,
        satisfactionDistribution: distribution,
        recentComplaints: complaints
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "bg-destructive text-destructive-foreground";
      case "média": return "bg-warning text-warning-foreground";
      case "baixa": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p>Carregando estatísticas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Respostas</p>
                <p className="text-2xl font-bold text-primary">{stats.totalResponses}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfação Média</p>
                <p className="text-2xl font-bold text-success">{stats.averageSatisfaction.toFixed(1)}/5</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Questões Pendentes</p>
                <p className="text-2xl font-bold text-warning">{stats.recentComplaints.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Distribution */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Distribuição da Satisfação Geral
          </CardTitle>
          <CardDescription>
            Baseado em {stats.totalResponses} respostas coletadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.satisfactionDistribution.map((item) => (
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

      {/* Recent Issues */}
      {stats.recentComplaints.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Comentários Recentes
            </CardTitle>
            <CardDescription>
              Comentários que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentComplaints.map((item, index) => (
                <div key={index} className="flex items-start justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-2">{item.issue}</p>
                  </div>
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.totalResponses === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sem dados ainda</h3>
            <p className="text-muted-foreground">
              As estatísticas aparecerão quando houver respostas da pesquisa.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SurveyStats;