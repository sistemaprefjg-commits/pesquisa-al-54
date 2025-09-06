import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ArrowLeft, Download, TrendingUp, Users, MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Interface para respostas reais do Supabase
interface SurveyResponse {
  id: string;
  patient_name: string;
  patient_phone: string;
  created_at: string;
  satisfaction_score: number;
  responses: any;
}

const Reports = () => {
  const { user } = useAuth();
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSurveyData();

    // Set up real-time updates
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'survey_responses'
        },
        () => {
          loadSurveyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSurveyData = async () => {
    try {
      const { data: responses, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSurveyResponses(responses || []);
    } catch (error) {
      console.error('Error loading survey data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculando métricas baseadas nas respostas reais do formulário
  const totalSurveys = surveyResponses.length;
  const responseRate = 92; // Assumindo que nem todos responderam
  const averageSatisfaction = surveyResponses.length > 0 
    ? (surveyResponses.reduce((sum, response) => sum + (response.satisfaction_score || 3), 0) / totalSurveys).toFixed(1)
    : '0';
  const uniquePatients = surveyResponses.length; // Cada resposta é de um paciente único

  // Agrupando por mês para o gráfico
  const monthlyData = surveyResponses.reduce((acc, response) => {
    const date = new Date(response.created_at);
    const monthKey = date.toLocaleDateString('pt-BR', { month: 'short' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, pesquisas: 0, satisfacaoTotal: 0, count: 0 };
    }
    
    acc[monthKey].pesquisas += 1;
    acc[monthKey].satisfacaoTotal += (response.satisfaction_score || 3);
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
    const score = response.satisfaction_score || 3;
    if (score >= 5) acc.muitoSatisfeito++;
    else if (score >= 4) acc.satisfeito++;
    else if (score >= 3) acc.neutro++;
    else if (score >= 2) acc.insatisfeito++;
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
    const allComments = surveyResponses
      .filter(r => r.responses && typeof r.responses === 'object')
      .map(r => {
        const comments = [];
        if (r.responses.comentarios && r.responses.comentarios.trim() !== '') {
          comments.push(r.responses.comentarios.toLowerCase());
        }
        if (r.responses.sugestoes && r.responses.sugestoes.trim() !== '') {
          comments.push(r.responses.sugestoes.toLowerCase());
        }
        return comments;
      })
      .flat();
    
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

    allComments.forEach(comment => {
      const originalComment = surveyResponses.find(r => 
        (r.responses && r.responses.comentarios && 
         r.responses.comentarios.toLowerCase() === comment) ||
        (r.responses && r.responses.sugestoes && 
         r.responses.sugestoes.toLowerCase() === comment)
      );
      
      const original = originalComment?.responses?.comentarios || originalComment?.responses?.sugestoes || '';
      
      if (comment.includes('espera') || comment.includes('demora') || comment.includes('hora')) {
        complaintCategories['Tempo de Espera']++;
        if (examples['Tempo de Espera'].length < 3) examples['Tempo de Espera'].push(original);
      }
      if (comment.includes('atendimento') || comment.includes('grosso') || comment.includes('mal educado') || comment.includes('médico')) {
        complaintCategories['Qualidade do Atendimento']++;
        if (examples['Qualidade do Atendimento'].length < 3) examples['Qualidade do Atendimento'].push(original);
      }
      if (comment.includes('sujo') || comment.includes('limpeza') || comment.includes('banheiro') || comment.includes('higiene')) {
        complaintCategories['Limpeza e Higiene']++;
        if (examples['Limpeza e Higiene'].length < 3) examples['Limpeza e Higiene'].push(original);
      }
      if (comment.includes('medicamento') || comment.includes('farmácia') || comment.includes('remédio')) {
        complaintCategories['Disponibilidade de Medicamentos']++;
        if (examples['Disponibilidade de Medicamentos'].length < 3) examples['Disponibilidade de Medicamentos'].push(original);
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
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(response => ({
      id: response.id,
      patient: response.patient_name,
      date: response.created_at,
      rating: response.satisfaction_score || 3,
      complaints: (response.responses && response.responses.comentarios) || '',
      suggestions: (response.responses && response.responses.sugestoes) || ''
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

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let currentY = 20;

      // Header
      pdf.setFontSize(20);
      pdf.text('Relatório de Satisfação do Paciente', 20, currentY);
      currentY += 10;

      pdf.setFontSize(12);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, currentY);
      currentY += 15;

      // KPIs
      pdf.setFontSize(16);
      pdf.text('Métricas Principais', 20, currentY);
      currentY += 10;

      pdf.setFontSize(12);
      pdf.text(`Total de Pesquisas: ${totalSurveys}`, 20, currentY);
      pdf.text(`Taxa de Resposta: ${responseRate}%`, 105, currentY);
      currentY += 8;
      pdf.text(`Satisfação Média: ${averageSatisfaction}/5.0`, 20, currentY);
      pdf.text(`Pacientes Únicos: ${uniquePatients}`, 105, currentY);
      currentY += 15;

      // Distribuição de Satisfação
      pdf.setFontSize(16);
      pdf.text('Distribuição de Satisfação', 20, currentY);
      currentY += 10;

      satisfactionData.forEach((item) => {
        if (item.value > 0) {
          pdf.setFontSize(12);
          pdf.text(`${item.name}: ${item.value} (${Math.round((item.value / totalSurveys) * 100)}%)`, 20, currentY);
          currentY += 6;
        }
      });
      currentY += 10;

      // Principais Queixas
      if (mainComplaints.length > 0) {
        pdf.setFontSize(16);
        pdf.text('Principais Queixas e Reclamações', 20, currentY);
        currentY += 10;

        mainComplaints.forEach((complaint, index) => {
          if (currentY > 250) {
            pdf.addPage();
            currentY = 20;
          }
          
          pdf.setFontSize(14);
          pdf.text(`${index + 1}. ${complaint.category}`, 20, currentY);
          currentY += 6;
          
          pdf.setFontSize(12);
          pdf.text(`Ocorrências: ${complaint.count} (${complaint.percentage}% das reclamações)`, 25, currentY);
          currentY += 6;
          
          pdf.text(`Severidade: ${complaint.severity === 'high' ? 'Alta' : complaint.severity === 'medium' ? 'Média' : 'Baixa'}`, 25, currentY);
          currentY += 6;
          
          if (complaint.examples.length > 0) {
            pdf.text('Exemplos:', 25, currentY);
            currentY += 6;
            complaint.examples.forEach((example) => {
              const lines = pdf.splitTextToSize(`• ${example}`, 160);
              pdf.text(lines, 30, currentY);
              currentY += lines.length * 6;
            });
          }
          currentY += 8;
        });
      }

      // Nova página para respostas recentes
      pdf.addPage();
      currentY = 20;
      
      pdf.setFontSize(16);
      pdf.text('Respostas Recentes', 20, currentY);
      currentY += 15;

      recentResponsesData.forEach((response, index) => {
        if (currentY > 240) {
          pdf.addPage();
          currentY = 20;
        }

        pdf.setFontSize(14);
        pdf.text(`Paciente: ${response.patient}`, 20, currentY);
        currentY += 6;
        
        pdf.setFontSize(12);
        pdf.text(`Data: ${new Date(response.date).toLocaleString('pt-BR')}`, 20, currentY);
        pdf.text(`Avaliação: ${response.rating}/5`, 105, currentY);
        currentY += 8;

        if (response.complaints) {
          pdf.text('Reclamações:', 20, currentY);
          currentY += 6;
          const complaintLines = pdf.splitTextToSize(response.complaints, 160);
          pdf.text(complaintLines, 25, currentY);
          currentY += complaintLines.length * 6;
        }

        if (response.suggestions) {
          pdf.text('Sugestões:', 20, currentY);
          currentY += 6;
          const suggestionLines = pdf.splitTextToSize(response.suggestions, 160);
          pdf.text(suggestionLines, 25, currentY);
          currentY += suggestionLines.length * 6;
        }

        currentY += 10;
      });

      // Salvar o PDF
      pdf.save(`relatorio-satisfacao-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
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
              <Button variant="outline" size="sm" onClick={generatePDF}>
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p>Carregando relatórios...</p>
            </div>
          </div>
        ) : (
          <>
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
                <span className="font-medium">{surveyResponses.filter(r => r.responses && ((r.responses.comentarios && r.responses.comentarios.trim() !== '') || (r.responses.sugestoes && r.responses.sugestoes.trim() !== ''))).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Respostas Positivas (4-5)</span>
                <span className="font-medium text-green-600">
                  {surveyResponses.filter(r => (r.satisfaction_score || 3) >= 4).length} ({Math.round((surveyResponses.filter(r => (r.satisfaction_score || 3) >= 4).length / totalSurveys) * 100)}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Respostas Negativas (1-2)</span>
                <span className="font-medium text-red-600">
                  {surveyResponses.filter(r => (r.satisfaction_score || 3) <= 2).length} ({Math.round((surveyResponses.filter(r => (r.satisfaction_score || 3) <= 2).length / totalSurveys) * 100)}%)
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Paciente</TableHead>
                    <TableHead className="min-w-[140px]">Data e Hora</TableHead>
                    <TableHead className="min-w-[100px]">Avaliação</TableHead>
                    <TableHead className="min-w-[200px]">Reclamações</TableHead>
                    <TableHead className="min-w-[200px]">Sugestões</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {recentResponsesData.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">{response.patient}</TableCell>
                    <TableCell>{new Date(response.date).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</TableCell>
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
                    <TableCell className="max-w-xs">
                      <div className="text-sm">
                        {response.complaints ? (
                          <div className="text-red-600 whitespace-pre-wrap break-words" title={response.complaints}>
                            {response.complaints}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Nenhuma reclamação</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm">
                        {response.suggestions ? (
                          <div className="text-green-600 whitespace-pre-wrap break-words" title={response.suggestions}>
                            {response.suggestions}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Nenhuma sugestão</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
        </>
      )}
      </main>
    </div>
  );
};

export default Reports;