import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, Eye, Calendar, Star, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SurveyResponse {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  satisfaction: number;
  service: string;
  waiting: string;
  cleanliness: string;
  recommendation: string;
  complaints: string;
  suggestions: string;
  status: "pending" | "reviewed" | "resolved";
  priority: "low" | "medium" | "high";
}

const mockResponses: SurveyResponse[] = [
  {
    id: "001",
    patientName: "Maria Silva Santos",
    phone: "(11) 99999-1111",
    date: "2024-01-15",
    satisfaction: 5,
    service: "Excelente",
    waiting: "Rápido (16-30 min)",
    cleanliness: "Excelente", 
    recommendation: "Sim, com certeza",
    complaints: "",
    suggestions: "Parabéns pela qualidade do atendimento!",
    status: "reviewed",
    priority: "low"
  },
  {
    id: "002",
    patientName: "João Oliveira",
    phone: "(11) 99999-2222",
    date: "2024-01-15",
    satisfaction: 2,
    service: "Ruim",
    waiting: "Muito demorado (+2 horas)",
    cleanliness: "Regular",
    recommendation: "Definitivamente não",
    complaints: "Esperei mais de 3 horas para ser atendido na emergência. O atendimento foi grosseiro e não me senti acolhido.",
    suggestions: "Melhorar o tempo de espera e treinamento da equipe.",
    status: "pending",
    priority: "high"
  },
  {
    id: "003",
    patientName: "Ana Costa Lima",
    phone: "(11) 99999-3333",
    date: "2024-01-14",
    satisfaction: 4,
    service: "Bom",
    waiting: "Moderado (31-60 min)",
    cleanliness: "Bom",
    recommendation: "Sim, provavelmente",
    complaints: "Faltou alguns medicamentos na farmácia.",
    suggestions: "Manter sempre estoque completo de medicamentos básicos.",
    status: "reviewed",
    priority: "medium"
  },
  {
    id: "004",
    patientName: "Carlos Pereira",
    phone: "(11) 99999-4444",
    date: "2024-01-14",
    satisfaction: 1,
    service: "Péssimo",
    waiting: "Muito demorado (+2 horas)",
    cleanliness: "Ruim",
    recommendation: "Definitivamente não",
    complaints: "Hospital sujo, atendimento péssimo, médico mal educado. Nunca mais volto!",
    suggestions: "Reformar tudo, trocar toda equipe.",
    status: "pending",
    priority: "high"
  },
  {
    id: "005",
    patientName: "Lucia Fernandes",
    phone: "(11) 99999-5555",
    date: "2024-01-13",
    satisfaction: 4,
    service: "Bom",
    waiting: "Rápido (16-30 min)",
    cleanliness: "Excelente",
    recommendation: "Sim, com certeza",
    complaints: "",
    suggestions: "Continuem assim! Muito bom o novo sistema de agendamento.",
    status: "resolved",
    priority: "low"
  }
];

const ResponsesList = () => {
  const [responses] = useState<SurveyResponse[]>(mockResponses);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  const filteredResponses = responses.filter((response) => {
    const matchesSearch = response.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.phone.includes(searchTerm) ||
                         response.complaints.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || response.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || response.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pendente</Badge>;
      case "reviewed":
        return <Badge variant="secondary" className="bg-primary text-primary-foreground">Analisado</Badge>;
      case "resolved":
        return <Badge variant="secondary" className="bg-success text-success-foreground">Resolvido</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Média</Badge>;
      case "low":
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge variant="secondary">Baixa</Badge>;
    }
  };

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
                  placeholder="Buscar por nome, telefone ou reclamação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="reviewed">Analisado</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
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
                    <h3 className="font-semibold text-lg">{response.patientName}</h3>
                    {getStatusBadge(response.status)}
                    {getPriorityBadge(response.priority)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(response.date).toLocaleDateString("pt-BR")}
                    </span>
                    <span>{response.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium">Satisfação:</span>
                    <div className="flex gap-1">
                      {getSatisfactionStars(response.satisfaction)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({response.satisfaction}/5)
                    </span>
                  </div>

                  {response.complaints && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-destructive">Reclamação:</p>
                        <p className="text-sm text-muted-foreground">
                          {response.complaints.length > 100 
                            ? `${response.complaints.substring(0, 100)}...` 
                            : response.complaints
                          }
                        </p>
                      </div>
                    </div>
                  )}

                  {response.suggestions && !response.complaints && (
                    <div className="flex items-start gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-success">Sugestão:</p>
                        <p className="text-sm text-muted-foreground">
                          {response.suggestions.length > 100 
                            ? `${response.suggestions.substring(0, 100)}...` 
                            : response.suggestions
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
                        <DialogTitle>Detalhes da Pesquisa - {response.patientName}</DialogTitle>
                        <DialogDescription>
                          Resposta completa da pesquisa de satisfação
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>Data:</strong> {new Date(response.date).toLocaleDateString("pt-BR")}</div>
                          <div><strong>Telefone:</strong> {response.phone}</div>
                          <div><strong>Satisfação Geral:</strong> {response.satisfaction}/5</div>
                          <div><strong>Qualidade do Serviço:</strong> {response.service}</div>
                          <div><strong>Tempo de Espera:</strong> {response.waiting}</div>
                          <div><strong>Limpeza:</strong> {response.cleanliness}</div>
                        </div>
                        <div>
                          <strong>Recomendaria:</strong> {response.recommendation}
                        </div>
                        {response.complaints && (
                          <div>
                            <strong>Reclamações:</strong>
                            <Textarea value={response.complaints} readOnly className="mt-2" />
                          </div>
                        )}
                        {response.suggestions && (
                          <div>
                            <strong>Sugestões:</strong>
                            <Textarea value={response.suggestions} readOnly className="mt-2" />
                          </div>
                        )}
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
              Tente ajustar os filtros ou termos de busca.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResponsesList;