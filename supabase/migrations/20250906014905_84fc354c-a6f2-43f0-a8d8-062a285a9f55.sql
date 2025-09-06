-- Inserir pesquisas de exemplo
INSERT INTO surveys (id, title, description, questions, is_active, created_by) VALUES 
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Pesquisa de Satisfação - Consulta Médica',
  'Avaliação da qualidade do atendimento médico',
  '[
    {
      "id": "q1",
      "type": "rating",
      "question": "Como você avalia o atendimento da recepção?",
      "required": true,
      "options": ["1", "2", "3", "4", "5"]
    },
    {
      "id": "q2", 
      "type": "rating",
      "question": "Como você avalia o tempo de espera?",
      "required": true,
      "options": ["1", "2", "3", "4", "5"]
    },
    {
      "id": "q3",
      "type": "rating", 
      "question": "Como você avalia a qualidade do atendimento médico?",
      "required": true,
      "options": ["1", "2", "3", "4", "5"]
    },
    {
      "id": "q4",
      "type": "text",
      "question": "Deixe seus comentários e sugestões:",
      "required": false
    }
  ]'::jsonb,
  true,
  NULL
),
(
  'b2c3d4e5-f6g7-8901-bcde-f23456789012'::uuid,
  'Pesquisa de Satisfação - Exames',
  'Avaliação dos serviços de exames e diagnósticos',
  '[
    {
      "id": "q1",
      "type": "rating",
      "question": "Como você avalia a organização para realização do exame?",
      "required": true,
      "options": ["1", "2", "3", "4", "5"]
    },
    {
      "id": "q2",
      "type": "rating",
      "question": "Como você avalia a explicação sobre o procedimento?",
      "required": true,
      "options": ["1", "2", "3", "4", "5"]
    },
    {
      "id": "q3",
      "type": "rating",
      "question": "Como você avalia o conforto durante o exame?", 
      "required": true,
      "options": ["1", "2", "3", "4", "5"]
    }
  ]'::jsonb,
  true,
  NULL
);

-- Inserir pacientes de exemplo
INSERT INTO patients (id, name, cpf, phone, email, birth_date, address) VALUES
('c3d4e5f6-g7h8-9012-cdef-345678901234'::uuid, 'Maria Silva Santos', '123.456.789-00', '(82) 99876-5432', 'maria.silva@email.com', '1985-03-15', 'Rua das Flores, 123 - Centro - Joaquim Gomes/AL'),
('d4e5f6g7-h8i9-0123-def0-456789012345'::uuid, 'João Pedro Oliveira', '234.567.890-11', '(82) 98765-4321', 'joao.pedro@email.com', '1978-07-22', 'Av. Principal, 456 - Jardim Esperança - Joaquim Gomes/AL'),
('e5f6g7h8-i9j0-1234-ef01-567890123456'::uuid, 'Ana Carolina Ferreira', '345.678.901-22', '(82) 97654-3210', 'ana.carolina@email.com', '1992-11-08', 'Rua do Comércio, 789 - Centro - Joaquim Gomes/AL'),
('f6g7h8i9-j0k1-2345-f012-678901234567'::uuid, 'Carlos Alberto Lima', '456.789.012-33', '(82) 96543-2109', 'carlos.alberto@email.com', '1965-01-30', 'Travessa São José, 321 - Bela Vista - Joaquim Gomes/AL'),
('g7h8i9j0-k1l2-3456-0123-789012345678'::uuid, 'Francisca Costa', '567.890.123-44', '(82) 95432-1098', 'francisca.costa@email.com', '1958-09-12', 'Rua da Igreja, 654 - Centro - Joaquim Gomes/AL'),
('h8i9j0k1-l2m3-4567-1234-890123456789'::uuid, 'Roberto Santos', '678.901.234-55', '(82) 94321-0987', 'roberto.santos@email.com', '1980-05-25', 'Av. Brasil, 987 - Novo Horizonte - Joaquim Gomes/AL'),
('i9j0k1l2-m3n4-5678-2345-901234567890'::uuid, 'Luiza Pereira', '789.012.345-66', '(82) 93210-9876', 'luiza.pereira@email.com', '1995-12-03', 'Rua Antônio Carlos, 147 - Centro - Joaquim Gomes/AL'),
('j0k1l2m3-n4o5-6789-3456-012345678901'::uuid, 'Antônio Barbosa', '890.123.456-77', '(82) 92109-8765', 'antonio.barbosa@email.com', '1972-04-18', 'Rua Major Cícero, 258 - Vila Nova - Joaquim Gomes/AL');

-- Inserir respostas de pesquisa de exemplo
INSERT INTO survey_responses (id, survey_id, patient_id, patient_name, patient_phone, satisfaction_score, responses) VALUES
('10203040-5060-7080-9010-111213141516'::uuid, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'c3d4e5f6-g7h8-9012-cdef-345678901234'::uuid, 'Maria Silva Santos', '(82) 99876-5432', 5, '{"q1": "5", "q2": "4", "q3": "5", "q4": "Atendimento excelente! Parabéns a toda equipe."}'),
('20304050-6070-8090-0101-121314151617'::uuid, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'd4e5f6g7-h8i9-0123-def0-456789012345'::uuid, 'João Pedro Oliveira', '(82) 98765-4321', 4, '{"q1": "4", "q2": "3", "q3": "5", "q4": "Médico muito atencioso, mas a espera foi um pouco longa."}'),
('30405060-7080-9010-1011-121314151618'::uuid, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'e5f6g7h8-i9j0-1234-ef01-567890123456'::uuid, 'Ana Carolina Ferreira', '(82) 97654-3210', 5, '{"q1": "5", "q2": "5", "q3": "5", "q4": "Tudo perfeito! Recomendo a todos."}'),
('40506070-8090-0101-1121-131415161719'::uuid, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'f6g7h8i9-j0k1-2345-f012-678901234567'::uuid, 'Carlos Alberto Lima', '(82) 96543-2109', 3, '{"q1": "3", "q2": "2", "q3": "4", "q4": "Atendimento bom, mas precisa melhorar a organização da recepção."}'),
('50607080-9010-1011-1213-141516171820'::uuid, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'g7h8i9j0-k1l2-3456-0123-789012345678'::uuid, 'Francisca Costa', '(82) 95432-1098', 5, '{"q1": "5", "q2": "4", "q3": "5", "q4": "Muito obrigada pelo carinho e atenção!"}'),
('60708090-0101-1121-1314-151617182021'::uuid, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'h8i9j0k1-l2m3-4567-1234-890123456789'::uuid, 'Roberto Santos', '(82) 94321-0987', 4, '{"q1": "4", "q2": "4", "q3": "4", "q4": "Bom atendimento geral."}'),
('70809010-1011-1213-1415-161718192022'::uuid, 'b2c3d4e5-f6g7-8901-bcde-f23456789012'::uuid, 'i9j0k1l2-m3n4-5678-2345-901234567890'::uuid, 'Luiza Pereira', '(82) 93210-9876', 5, '{"q1": "5", "q2": "5", "q3": "5"}'),
('80901011-1213-1415-1617-181920212223'::uuid, 'b2c3d4e5-f6g7-8901-bcde-f23456789012'::uuid, 'j0k1l2m3-n4o5-6789-3456-012345678901'::uuid, 'Antônio Barbosa', '(82) 92109-8765', 4, '{"q1": "4", "q2": "4", "q3": "4"}'),
('90101112-1314-1516-1718-192021222324'::uuid, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'c3d4e5f6-g7h8-9012-cdef-345678901234'::uuid, 'Maria Silva Santos', '(82) 99876-5432', 5, '{"q1": "5", "q2": "5", "q3": "5", "q4": "Segunda consulta, sempre excelente!"}'),
('01111213-1415-1617-1819-202122232425'::uuid, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'd4e5f6g7-h8i9-0123-def0-456789012345'::uuid, 'João Pedro Oliveira', '(82) 98765-4321', 4, '{"q1": "4", "q2": "4", "q3": "4", "q4": "Melhorou bastante desde a última visita!"}');

-- Inserir mensagens WhatsApp de exemplo
INSERT INTO whatsapp_messages (id, phone, message, patient_name, status, sent_by) VALUES
('aa111213-1415-1617-1819-202122232426'::uuid, '(82) 99876-5432', 'Olá Maria! Sua consulta está agendada para amanhã às 14h. Por favor, chegue 15 minutos antes. Obrigado!', 'Maria Silva Santos', 'sent', NULL),
('bb121314-1516-1718-1920-212223242527'::uuid, '(82) 98765-4321', 'João, seu exame de sangue ficará pronto na sexta-feira. Você pode retirar a partir das 8h. Qualquer dúvida, nos procure!', 'João Pedro Oliveira', 'sent', NULL),
('cc131415-1617-1819-2021-222324252628'::uuid, '(82) 97654-3210', 'Ana, obrigado por participar da nossa pesquisa de satisfação! Seu feedback é muito importante para nós.', 'Ana Carolina Ferreira', 'sent', NULL),
('dd141516-1718-1920-2122-232425262729'::uuid, '(82) 96543-2109', 'Carlos, lembramos que sua consulta de retorno é na próxima terça-feira às 9h. Não esqueça de trazer os exames!', 'Carlos Alberto Lima', 'sent', NULL),
('ee151617-1819-2021-2223-24252627282a'::uuid, '(82) 95432-1098', 'Dona Francisca, sua receita está pronta para retirada. Funcionamos de segunda a sexta, das 7h às 17h.', 'Francisca Costa', 'sent', NULL);