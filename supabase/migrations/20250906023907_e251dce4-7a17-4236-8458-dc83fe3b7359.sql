-- Inserir uma pesquisa padrão se não existir nenhuma
INSERT INTO public.surveys (title, description, is_active, questions)
SELECT 
  'Pesquisa de Satisfação - Hospital Municipal',
  'Pesquisa de satisfação do atendimento hospitalar',
  true,
  '[]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.surveys WHERE is_active = true
);