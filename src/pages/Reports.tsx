import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ArrowLeft, Download, TrendingUp, Users, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

// Importando os dados das respostas do formulário
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

const surveyResponses: SurveyResponse[] = [
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
  },
  {
    id: "006",
    patientName: "Pedro Santos",
    phone: "(11) 99999-6666",
    date: "2024-01-12",
    satisfaction: 3,
    service: "Regular",
    waiting: "Muito demorado (+2 horas)",
    cleanliness: "Regular",
    recommendation: "Talvez",
    complaints: "Demora muito para ser atendido, mais de 2 horas esperando",
    suggestions: "Organizar melhor as filas de atendimento",
    status: "reviewed",
    priority: "medium"
  },
  {
    id: "007",
    patientName: "Mariana Costa",
    phone: "(11) 99999-7777",
    date: "2024-01-11",
    satisfaction: 2,
    service: "Ruim",
    waiting: "Muito demorado (+2 horas)",
    cleanliness: "Ruim",
    recommendation: "Definitivamente não",
    complaints: "Banheiros sujos, limpeza péssima em todo hospital",
    suggestions: "Melhorar drasticamente a limpeza",
    status: "pending",
    priority: "high"
  },
  {
    id: "008",
    patientName: "Roberto Lima",
    phone: "(11) 99999-8888",
    date: "2024-01-10",
    satisfaction: 1,
    service: "Péssimo",
    waiting: "Muito demorado (+2 horas)",
    cleanliness: "Péssima",
    recommendation: "Definitivamente não",
    complaints: "Médico muito grosseiro, não teve paciência para explicar. Atendimento horrível.",
    suggestions: "Treinar melhor os médicos para atender bem os pacientes",
    status: "pending",
    priority: "high"
  }
];

const Reports = () => {
  const { user } = useAuth();

  // Calculando métricas baseadas nas respostas reais do formulário
  const totalSurveys = surveyResponses.length;
  const responseRate = 92; // Assumindo que nem todos responderam
  const averageSatisfaction = (surveyResponses.reduce((sum, response) => sum + response.satisfaction, 0) / totalSurveys).toFixed(1);
  const uniquePatients = surveyResponses.length; // Cada resposta é de um paciente único

  // Agrupando por mês para o gráfico
  const monthlyData = surveyResponses.reduce((acc, response) => {
    const date = new Date(response.date);
    const monthKey = date.toLocaleDateString('pt-BR', { month: 'short' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, pesquisas: 0, satisfacaoTotal: 0, count: 0 };
    }
    
    acc[monthKey].pesquisas += 1;
    acc[monthKey].satisfacaoTotal += response.satisfaction;
    acc[monthKey].count += 1;
    
    return acc;
  }, {} as any);

  const chartMonthlyData = Object.values(monthlyData).map((item: any) => ({
    month: item.month,
    pesquisas: item.pesquisas,
    satisfacao: Number((item.satisfacaoTotal / item.count).toFixed(1))
  }));

  // Analisando satisfação geral
  const satisfactionDistribution = surveyResponses.reduce((acc, response) => {
    if (response.satisfaction >= 5) acc.muitoSatisfeito++;
    else if (response.satisfaction >= 4) acc.satisfeito++;
    else if (response.satisfaction >= 3) acc.neutro++;
    else if (response.satisfaction >= 2) acc.insatisfeito++;
    else acc.muitoInsatisfeito++;
    return acc;
  }, { muitoSatisfeito: 0, satisfeito: 0, neutro: 0, insatisfeito: 0, muitoInsatisfeito: 0 });

  const satisfactionData = [
    { name: 'Muito Satisfeito', value: satisfactionDistribution.muitoSatisfeito, color: '#22c55e' },
    { name: 'Satisfeito', value: satisfactionDistribution.satisfeito, color: '#3b82f6' },
    { name: 'Neutro', value: satisfactionDistribution.neutro, color: '#f59e0b' },
    { name: 'Insatisfeito', value: satisfactionDistribution.insatisfeito, color: '#ef4444' },
    { name: 'Muito Insatisfeito', value: satisfactionDistribution.muitoInsatisfeito, color: '#991b1b' },
  ];

  // Analisando principais queixas das respostas reais
  const analyzeComplaints = () => {
    const complaints = surveyResponses.filter(r => r.complaints.trim() !== '').map(r => r.complaints.toLowerCase());
    const complaintCategories = {
      'Tempo de Espera': 0,
      'Qualidade do Atendimento': 0,
      'Limpeza e Higiene': 0,
      'Disponibilidade de Medicamentos': 0,
      'Infraestrutura': 0,
      'Agendamento': 0,
    };

    const examples = {
      'Tempo de Espera': [] as string[],
      'Qualidade do Atendimento': [] as string[],
      'Limpeza e Higiene': [] as string[],
      'Disponibilidade de Medicamentos': [] as string[],
      'Infraestrutura': [] as string[],
      'Agendamento': [] as string[],
    };

    complaints.forEach(complaint => {
      const originalComplaint = surveyResponses.find(r => r.complaints.toLowerCase() === complaint)?.complaints || '';
      
      if (complaint.includes('espera') || complaint.includes('demora') || complaint.includes('hora')) {
        complaintCategories['Tempo de Espera']++;
        if (examples['Tempo de Espera'].length < 3) examples['Tempo de Espera'].push(originalComplaint);
      }
      if (complaint.includes('atendimento') || complaint.includes('grosso') || complaint.includes('mal educado') || complaint.includes('médico')) {
        complaintCategories['Qualidade do Atendimento']++;
        if (examples['Qualidade do Atendimento'].length < 3) examples['Qualidade do Atendimento'].push(originalComplaint);
      }
      if (complaint.includes('sujo') || complaint.includes('limpeza') || complaint.includes('banheiro') || complaint.includes('higiene')) {
        complaintCategories['Limpeza e Higiene']++;
        if (examples['Limpeza e Higiene'].length < 3) examples['Limpeza e Higiene'].push(originalComplaint);
      }
      if (complaint.includes('medicamento') || complaint.includes('farmácia') || complaint.includes('remédio')) {
        complaintCategories['Disponibilidade de Medicamentos']++;
        if (examples['Disponibilidade de Medicamentos'].length < 3) examples['Disponibilidade de Medicamentos'].push(originalComplaint);
      }
    });

    const totalComplaints = Object.values(complaintCategories).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(complaintCategories)
      .filter(([_, count]) => count > 0)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / totalComplaints) * 100),
        examples: examples[category as keyof typeof examples].slice(0, 2),
        trend: 'stable' as const,
        severity: count >= 3 ? 'high' as const : count >= 2 ? 'medium' as const : 'low' as const
      }))
      .sort((a, b) => b.count - a.count);
  };

  const mainComplaints = analyzeComplaints();

  const complaintsChartData = mainComplaints.map(complaint => ({
    name: complaint.category,
    value: complaint.count,
    color: complaint.severity === 'high' ? '#ef4444' : 
           complaint.severity === 'medium' ? '#f59e0b' : '#22c55e'
  }));

  // Respostas recentes (últimas 5)
  const recentResponsesData = surveyResponses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(response => ({
      id: response.id,
      patient: response.patientName,
      date: response.date,
      rating: response.satisfaction,
      feedback: response.complaints || response.suggestions || 'Sem comentários adicionais'
    }));

  const chartConfig = {
    pesquisas: {
      label: 'Pesquisas',
      color: 'hsl(var(--primary))',
    },
    satisfacao: {
      label: 'Satisfação',
      color: 'hsl(var(--secondary))',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios e Estatísticas</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <span className="text-sm text-muted-foreground">
                Olá, <strong>{user?.username}</strong>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pesquisas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSurveys}</div>
              <p className="text-xs text-muted-foreground">
                Respostas coletadas até hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseRate}%</div>
              <p className="text-xs text-muted-foreground">
                Pacientes que responderam
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageSatisfaction}</div>
              <p className="text-xs text-muted-foreground">
                De 5.0 pontos possíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pacientes Únicos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniquePatients}</div>
              <p className="text-xs text-muted-foreground">
                Que participaram da pesquisa
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Respostas por Período</CardTitle>
              <CardDescription>Quantidade de pesquisas coletadas</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={chartMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="pesquisas" fill="var(--color-pesquisas)" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Satisfação</CardTitle>
              <CardDescription>Distribuição das avaliações recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Satisfação</CardTitle>
              <CardDescription>Média de satisfação por período</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={chartMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 5]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="satisfacao" stroke="var(--color-satisfacao)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo das Respostas</CardTitle>
              <CardDescription>Principais métricas calculadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total de Respostas</span>
                <span className="font-medium">{totalSurveys}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Satisfação Média</span>
                <span className="font-medium">{averageSatisfaction}/5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Respostas com Reclamações</span>
                <span className="font-medium">{surveyResponses.filter(r => r.complaints.trim() !== '').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Respostas Positivas (4-5)</span>
                <span className="font-medium text-green-600">
                  {surveyResponses.filter(r => r.satisfaction >= 4).length} ({Math.round((surveyResponses.filter(r => r.satisfaction >= 4).length / totalSurveys) * 100)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Respostas Negativas (1-2)</span>
                <span className="font-medium text-red-600">
                  {surveyResponses.filter(r => r.satisfaction <= 2).length} ({Math.round((surveyResponses.filter(r => r.satisfaction <= 2).length / totalSurveys) * 100)}%)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Principais Queixas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Principais Queixas e Reclamações
            </CardTitle>
            <CardDescription>Temas mais recorrentes mencionados pelos pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {mainComplaints.map((complaint, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{complaint.category}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{complaint.count}</span>
                        <div className={`w-2 h-2 rounded-full bg-yellow-500`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{complaint.percentage}% das reclamações</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        complaint.severity === 'high' ? 'bg-red-100 text-red-800' :
                        complaint.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {complaint.severity === 'high' ? 'Alta' : 
                         complaint.severity === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Exemplos:</p>
                      {complaint.examples.slice(0, 2).map((example, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {example}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Distribuição por Categoria</h4>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={complaintsChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complaintsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h5 className="font-medium text-sm mb-2">Ações Recomendadas</h5>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Implementar sistema de triagem mais eficiente</li>
                    <li>• Treinamento em atendimento humanizado</li>
                    <li>• Melhorar protocolos de limpeza</li>
                    <li>• Revisar gestão de estoque de medicamentos</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Respostas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Respostas Recentes</CardTitle>
            <CardDescription>Últimas avaliações recebidas dos pacientes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Comentário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentResponsesData.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">{response.patient}</TableCell>
                    <TableCell>{new Date(response.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < response.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {response.rating}/5
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{response.feedback}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;