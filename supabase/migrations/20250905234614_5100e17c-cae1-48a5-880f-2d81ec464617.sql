-- Create surveys table
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create patients table  
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  birth_date DATE,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create survey responses table
CREATE TABLE public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT,
  responses JSONB NOT NULL DEFAULT '{}',
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create whatsapp_messages table for tracking sent messages
CREATE TABLE public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  patient_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for surveys
CREATE POLICY "Users can view all surveys" ON public.surveys FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create surveys" ON public.surveys FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own surveys" ON public.surveys FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Admins can delete surveys" ON public.surveys FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for patients
CREATE POLICY "Users can view all patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create patients" ON public.patients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update patients" ON public.patients FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for survey responses
CREATE POLICY "Users can view all survey responses" ON public.survey_responses FOR SELECT USING (true);
CREATE POLICY "Anyone can create survey responses" ON public.survey_responses FOR INSERT WITH CHECK (true);

-- Create RLS policies for whatsapp messages
CREATE POLICY "Users can view all whatsapp messages" ON public.whatsapp_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create whatsapp messages" ON public.whatsapp_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_surveys_active ON public.surveys(is_active);
CREATE INDEX idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX idx_survey_responses_created_at ON public.survey_responses(created_at);
CREATE INDEX idx_patients_cpf ON public.patients(cpf);
CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_sent_at ON public.whatsapp_messages(sent_at);

-- Insert a default survey for testing
INSERT INTO public.surveys (title, description, questions, created_by) 
VALUES (
  'Pesquisa de Satisfação Hospitalar',
  'Avalie sua experiência no nosso hospital',
  '[
    {
      "id": "atendimento",
      "type": "rating",
      "question": "Como você avalia o atendimento recebido?",
      "required": true
    },
    {
      "id": "limpeza",
      "type": "rating", 
      "question": "Como você avalia a limpeza das instalações?",
      "required": true
    },
    {
      "id": "tempo_espera",
      "type": "rating",
      "question": "Como você avalia o tempo de espera?",
      "required": true
    },
    {
      "id": "qualidade_servico",
      "type": "rating",
      "question": "Como você avalia a qualidade do serviço médico?",
      "required": true
    },
    {
      "id": "recomendaria",
      "type": "rating",
      "question": "Você recomendaria nosso hospital?",
      "required": true
    },
    {
      "id": "comentarios",
      "type": "textarea",
      "question": "Comentários ou sugestões (opcional)",
      "required": false
    }
  ]'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
);