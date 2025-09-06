-- Verificar e corrigir RLS policies
-- Garantir que temos políticas corretas para survey_responses

-- Criar policy para permitir que qualquer pessoa insira respostas na pesquisa
DROP POLICY IF EXISTS "Anyone can create survey responses" ON public.survey_responses;
CREATE POLICY "Anyone can create survey responses" 
ON public.survey_responses 
FOR INSERT 
WITH CHECK (true);

-- Criar policy para permitir que usuários autenticados vejam todas as respostas
DROP POLICY IF EXISTS "Users can view all survey responses" ON public.survey_responses;
CREATE POLICY "Authenticated users can view survey responses" 
ON public.survey_responses 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Garantir que a pesquisa pode ser vista por todos (incluindo usuários não autenticados)
DROP POLICY IF EXISTS "Users can view all surveys" ON public.surveys;
CREATE POLICY "Anyone can view active surveys" 
ON public.surveys 
FOR SELECT 
USING (is_active = true);

-- Policy adicional para usuários autenticados verem todas as pesquisas
CREATE POLICY "Authenticated users can view all surveys" 
ON public.surveys 
FOR SELECT 
USING (auth.uid() IS NOT NULL);