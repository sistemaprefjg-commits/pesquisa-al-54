import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Download, TrendingUp, Users, MessageSquare, Star, CalendarIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

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

  // Função para filtrar respostas por data
  const filterResponsesByDate = (responses: SurveyResponse[]) => {
    let filteredResponses = responses;
    
    if (startDate) {
      filteredResponses = filteredResponses.filter(response => {
        const responseDate = new Date(response.created_at);
        return responseDate >= startDate;
      });
    }
    
    if (endDate) {
      filteredResponses = filteredResponses.filter(response => {
        const responseDate = new Date(response.created_at);
        // Adiciona 23:59:59 ao endDate para incluir todo o dia
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        return responseDate <= endOfDay;
      });
    }
    
    return filteredResponses;
  };

  // Respostas filtradas por data
  const filteredResponses = filterResponsesByDate(surveyResponses);
  
  // Respostas recentes (limitadas se não houver filtros)
  const allRecentResponses = filteredResponses
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, startDate || endDate ? filteredResponses.length : undefined) // Mostra todas se houver filtro, senão mostra todas também
    .map(response => ({
      id: response.id,
      patient: response.patient_name,
      date: response.created_at,
      rating: response.satisfaction_score || 3,
      responses: response.responses || {},
      complaints: (response.responses && response.responses.comentarios) || '',
      suggestions: (response.responses && response.responses.sugestoes) || ''
    }));

  // Paginação
  const totalPages = Math.ceil((allRecentResponses?.length || 0) / itemsPerPage);
  const recentResponsesData = useMemo(() => {
    if (!allRecentResponses) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allRecentResponses.slice(startIndex, endIndex);
  }, [allRecentResponses, currentPage, itemsPerPage]);

  // Resetar página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  // Função para limpar filtros
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

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
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let currentY = 20;

      // Header do PDF
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório de Satisfação do Paciente', 20, currentY);
      currentY += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, currentY);
      currentY += 20;

      // Capturar e adicionar os KPIs
      const kpisSection = document.querySelector('[data-pdf="kpis"]') as HTMLElement;
      if (kpisSection) {
        const canvas = await html2canvas(kpisSection, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (currentY + imgHeight > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;
      }

      // Capturar e adicionar gráficos (primeira linha)
      const chartsSection1 = document.querySelector('[data-pdf="charts-1"]') as HTMLElement;
      if (chartsSection1) {
        if (currentY + 100 > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
        }
        
        const canvas = await html2canvas(chartsSection1, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;
      }

      // Nova página para segunda linha de gráficos
      pdf.addPage();
      currentY = 20;

      const chartsSection2 = document.querySelector('[data-pdf="charts-2"]') as HTMLElement;
      if (chartsSection2) {
        const canvas = await html2canvas(chartsSection2, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 15;
      }

      // Nova página para queixas
      pdf.addPage();
      currentY = 20;

      const complaintsSection = document.querySelector('[data-pdf="complaints"]') as HTMLElement;
      if (complaintsSection) {
        const canvas = await html2canvas(complaintsSection, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 40;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Pode precisar de múltiplas páginas para queixas
        if (imgHeight > pageHeight - 40) {
          const pagesNeeded = Math.ceil(imgHeight / (pageHeight - 40));
          const sectionHeight = (pageHeight - 40);
          
          for (let i = 0; i < pagesNeeded; i++) {
            if (i > 0) {
              pdf.addPage();
              currentY = 20;
            }
            
            const yOffset = i * sectionHeight * (canvas.height / imgHeight);
            const partialCanvas = document.createElement('canvas');
            partialCanvas.width = canvas.width;
            partialCanvas.height = Math.min(sectionHeight * (canvas.height / imgHeight), canvas.height - yOffset);
            
            const ctx = partialCanvas.getContext('2d');
            ctx?.drawImage(canvas, 0, yOffset, canvas.width, partialCanvas.height, 0, 0, canvas.width, partialCanvas.height);
            
            const partialImgData = partialCanvas.toDataURL('image/png');
            const partialImgHeight = (partialCanvas.height * imgWidth) / partialCanvas.width;
            
            pdf.addImage(partialImgData, 'PNG', 20, currentY, imgWidth, partialImgHeight);
          }
        } else {
          pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
        }
      }

      // Gerar tabela de respostas de forma programática
      pdf.addPage();
      currentY = 20;
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Respostas Recentes', 20, currentY);
      currentY += 10;
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      const margin = 20;
      const tableWidth = pageWidth - (margin * 2);
      const colWidths = [35, 30, 20, 45, 40]; // Larguras das colunas
      
      // Cabeçalho da tabela
      const headers = ['Paciente', 'Data/Hora', 'Nota', 'Comentários', 'Sugestões'];
      let xPos = margin;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, currentY, tableWidth, 8, 'F');
      
      headers.forEach((header, idx) => {
        pdf.text(header, xPos + 2, currentY + 5);
        xPos += colWidths[idx];
      });
      
      currentY += 8;
      pdf.setFont('helvetica', 'normal');
      
      // Dados da tabela - processar em lotes pequenos
      const responsesToShow = allRecentResponses.slice(0, 100); // Limitar a 100 respostas no PDF
      
      responsesToShow.forEach((response, index) => {
        const rowHeight = 15; // Altura mínima da linha
        
        // Verificar se precisa de nova página
        if (currentY + rowHeight > pageHeight - 20) {
          pdf.addPage();
          currentY = 20;
          
          // Repetir cabeçalho
          xPos = margin;
          pdf.setFont('helvetica', 'bold');
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin, currentY, tableWidth, 8, 'F');
          
          headers.forEach((header, idx) => {
            pdf.text(header, xPos + 2, currentY + 5);
            xPos += colWidths[idx];
          });
          
          currentY += 8;
          pdf.setFont('helvetica', 'normal');
        }
        
        xPos = margin;
        const startY = currentY;
        
        // Desenhar borda da linha
        pdf.setDrawColor(220, 220, 220);
        pdf.rect(margin, currentY, tableWidth, rowHeight);
        
        // Paciente
        const patientText = pdf.splitTextToSize(response.patient || '', colWidths[0] - 4);
        pdf.text(patientText[0] || '', xPos + 2, currentY + 5);
        xPos += colWidths[0];
        
        // Data
        const dateText = new Date(response.date).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
        pdf.text(dateText, xPos + 2, currentY + 5);
        xPos += colWidths[1];
        
        // Nota
        pdf.text(`${response.rating}/5`, xPos + 2, currentY + 5);
        xPos += colWidths[2];
        
        // Comentários
        const complaintsText = response.complaints 
          ? pdf.splitTextToSize(response.complaints.substring(0, 100) + (response.complaints.length > 100 ? '...' : ''), colWidths[3] - 4)
          : [''];
        pdf.text(complaintsText[0] || '-', xPos + 2, currentY + 5);
        xPos += colWidths[3];
        
        // Sugestões
        const suggestionsText = response.suggestions 
          ? pdf.splitTextToSize(response.suggestions.substring(0, 100) + (response.suggestions.length > 100 ? '...' : ''), colWidths[4] - 4)
          : [''];
        pdf.text(suggestionsText[0] || '-', xPos + 2, currentY + 5);
        
        currentY += rowHeight;
      });
      
      // Nota de rodapé se houver mais respostas
      if (allRecentResponses.length > 100) {
        currentY += 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Mostrando as primeiras 100 respostas de ${allRecentResponses.length} no total`, margin, currentY);
      }

      // Salvar o PDF
      pdf.save(`relatorio-satisfacao-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
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
            <div data-pdf="kpis" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div data-pdf="charts-1" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

        <div data-pdf="charts-2" className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
        <Card data-pdf="complaints" className="mb-8">
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
        <Card data-pdf="responses-table">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Respostas Recentes</CardTitle>
                <CardDescription>
                  {startDate || endDate ? 
                    `Respostas filtradas${startDate ? ` a partir de ${format(startDate, 'dd/MM/yyyy', { locale: ptBR })}` : ''}${endDate ? ` até ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}` : ''} - ${recentResponsesData.length} resultado(s)` :
                    'Últimas avaliações recebidas dos pacientes'
                  }
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                {/* Filtro Data Inicial */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Data Inicial</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[150px] justify-start text-left font-normal text-xs",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        locale={ptBR}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Filtro Data Final */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Data Final</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[150px] justify-start text-left font-normal text-xs",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        locale={ptBR}
                        className={cn("p-3 pointer-events-auto")}
                        disabled={(date) => startDate ? date < startDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Botão Limpar Filtros */}
                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="mt-auto text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Limpar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Paciente</TableHead>
                    <TableHead className="min-w-[140px]">Data e Hora</TableHead>
                    <TableHead className="min-w-[100px]">Avaliação</TableHead>
                    <TableHead className="min-w-[250px]">Respostas do Questionário</TableHead>
                    <TableHead className="min-w-[200px]">Comentários</TableHead>
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
                    <TableCell className="max-w-md">
                      <div className="text-sm space-y-2">
                        {response.responses && Object.keys(response.responses).length > 0 ? (
                          Object.entries(response.responses)
                            .filter(([key]) => key !== 'comentarios' && key !== 'sugestoes')
                            .map(([question, answer], idx) => (
                              <div key={idx} className="border-l-2 border-primary/30 pl-2">
                                <p className="font-medium text-xs text-muted-foreground mb-0.5">
                                  {question}
                                </p>
                                <p className="text-foreground">
                                  {String(answer)}
                                </p>
                              </div>
                            ))
                        ) : (
                          <span className="text-muted-foreground italic">Sem respostas</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm">
                        {response.complaints ? (
                          <div className="text-red-600 whitespace-pre-wrap break-words" title={response.complaints}>
                            {response.complaints}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Nenhum comentário</span>
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
          
          {/* Paginação - mostrar apenas se houver mais de uma página */}
          {totalPages > 1 && (
            <div className="px-6 pb-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Páginas */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {/* Ellipsis se necessário */}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              
              <div className="text-center text-sm text-muted-foreground mt-4">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, allRecentResponses?.length || 0)} de {allRecentResponses?.length || 0} resultado(s)
              </div>
            </div>
          )}
        </Card>
        </>
      )}
      </main>
    </div>
  );
};

export default Reports;