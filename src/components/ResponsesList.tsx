import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Eye, Calendar, Star, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SurveyResponse {
  id: string;
  patient_name: string;
  patient_phone: string;
  created_at: string;
  satisfaction_score: number;
  responses: any;
}

const ResponsesList = () => {
  const { toast } = useToast();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  useEffect(() => {
    loadResponses();

    // Set up real-time updates
    const channel = supabase
      .channel('responses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'survey_responses'
        },
        () => {
          loadResponses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .select(`
          id,
          patient_name,
          patient_phone,
          created_at,
          satisfaction_score,
          responses
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setResponses(data || []);
    } catch (error) {
      console.error('Error loading responses:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar respostas da pesquisa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResponses = responses.filter((response) => {
    const matchesSearch = response.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (response.patient_phone || '').includes(searchTerm) ||
                         JSON.stringify(response.responses).toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getSatisfactionStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-warning text-warning" : "text-muted-foreground"
        }`}
      />
    ));
  };

  const formatResponseValue = (key: string, value: any) => {
    if (!value) return 'Não respondido';
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-card">
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <p>Carregando respostas...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Respostas das Pesquisas
          </CardTitle>
          <CardDescription>
            {filteredResponses.length} de {responses.length} respostas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone ou resposta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses List */}
      <div className="space-y-4">
        {filteredResponses.map((response) => (
          <Card key={response.id} className="shadow-card hover:shadow-medical transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{response.patient_name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(response.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    {response.patient_phone && <span>{response.patient_phone}</span>}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium">Satisfação:</span>
                    <div className="flex gap-1">
                      {getSatisfactionStars(response.satisfaction_score || 3)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({response.satisfaction_score || 3}/5)
                    </span>
                  </div>

                  {response.responses?.comentarios && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Comentário:</p>
                        <p className="text-sm text-muted-foreground">
                          {response.responses.comentarios.length > 100 
                            ? `${response.responses.comentarios.substring(0, 100)}...` 
                            : response.responses.comentarios
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {response.responses?.sugestoes && !response.responses?.comentarios && (
                    <div className="flex items-start gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-success">Sugestão:</p>
                        <p className="text-sm text-muted-foreground">
                          {response.responses.sugestoes.length > 100 
                            ? `${response.responses.sugestoes.substring(0, 100)}...` 
                            : response.responses.sugestoes
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedResponse(response)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Detalhes da Pesquisa - {response.patient_name}</DialogTitle>
                        <DialogDescription>
                          Resposta completa da pesquisa de satisfação
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Data:</strong> {new Date(response.created_at).toLocaleDateString("pt-BR")}</div>
                          <div><strong>Telefone:</strong> {response.patient_phone || 'Não informado'}</div>
                          <div><strong>Satisfação Geral:</strong> {response.satisfaction_score || 3}/5</div>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(response.responses || {}).map(([key, value]) => (
                            <div key={key}>
                              <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong>
                              <div className="mt-1 p-2 bg-muted rounded text-sm">
                                {formatResponseValue(key, value)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResponses.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma resposta encontrada</h3>
            <p className="text-muted-foreground">
              {responses.length === 0 
                ? 'Ainda não há respostas para esta pesquisa.' 
                : 'Tente ajustar os termos de busca.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResponsesList;