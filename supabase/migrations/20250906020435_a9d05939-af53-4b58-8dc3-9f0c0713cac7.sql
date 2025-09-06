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
  'b2c3d4e5-f6a7-8901-bcde-f23456789abc'::uuid,
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
('c3d4e5f6-a7b8-9012-cdef-345678901234'::uuid, 'Maria Silva Santos', '123.456.789-00', '(82) 99876-5432', 'maria.silva@email.com', '1985-03-15', 'Rua das Flores, 123 - Centro - Joaquim Gomes/AL'),
('d4e5f6a7-b8c9-0123-def0-456789012345'::uuid, 'João Pedro Oliveira', '234.567.890-11', '(82) 98765-4321', 'joao.pedro@email.com', '1978-07-22', 'Av. Principal, 456 - Jardim Esperança - Joaquim Gomes/AL'),
('e5f6a7b8-c9d0-1234-ef01-567890123456'::uuid, 'Ana Carolina Ferreira', '345.678.901-22', '(82) 97654-3210', 'ana.carolina@email.com', '1992-11-08', 'Rua do Comércio, 789 - Centro - Joaquim Gomes/AL'),
('f6a7b8c9-d0e1-2345-f012-678901234567'::uuid, 'Carlos Alberto Lima', '456.789.012-33', '(82) 96543-2109', 'carlos.alberto@email.com', '1965-01-30', 'Travessa São José, 321 - Bela Vista - Joaquim Gomes/AL'),
('a7b8c9d0-e1f2-3456-0123-789012345678'::uuid, 'Francisca Costa', '567.890.123-44', '(82) 95432-1098', 'francisca.costa@email.com', '1958-09-12', 'Rua da Igreja, 654 - Centro - Joaquim Gomes/AL'),
('b8c9d0e1-f2a3-4567-1234-890123456789'::uuid, 'Roberto Santos', '678.901.234-55', '(82) 94321-0987', 'roberto.santos@email.com', '1980-05-25', 'Av. Brasil, 987 - Novo Horizonte - Joaquim Gomes/AL'),
('c9d0e1f2-a3b4-5678-2345-901234567890'::uuid, 'Luiza Pereira', '789.012.345-66', '(82) 93210-9876', 'luiza.pereira@email.com', '1995-12-03', 'Rua Antônio Carlos, 147 - Centro - Joaquim Gomes/AL'),
('d0e1f2a3-b4c5-6789-3456-012345678901'::uuid, 'Antônio Barbosa', '890.123.456-77', '(82) 92109-8765', 'antonio.barbosa@email.com', '1972-04-18', 'Rua Major Cícero, 258 - Vila Nova - Joaquim Gomes/AL');