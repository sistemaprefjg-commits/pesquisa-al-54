-- Limpar pesquisas duplicadas e manter apenas uma ativa
UPDATE public.surveys SET is_active = false WHERE id != '27c3ae7e-a90d-4bfb-b00c-7395a11bdba8';

-- Garantir que sempre temos uma pesquisa ativa
UPDATE public.surveys 
SET is_active = true 
WHERE id = '27c3ae7e-a90d-4bfb-b00c-7395a11bdba8';

-- Atualizar respostas órfãs para usar a pesquisa ativa
UPDATE public.survey_responses 
SET survey_id = '27c3ae7e-a90d-4bfb-b00c-7395a11bdba8' 
WHERE survey_id IS NULL;