-- ═══════════════════════════════════════════════════════════════════════════
-- SEED COMPLETO: Escola de Música Bruna Mandz
-- ═══════════════════════════════════════════════════════════════════════════
-- Dados realistas para desenvolvimento:
--   • 6 professores (especialidades variadas)
--   • 12 alunos (todos os 7 status do ciclo de vida)
--   • 8 matrículas ativas
--   • Mensalidades, aulas, receitas avulsas, despesas, investimentos
--   • Pagamentos a professores
--   • Store (products/orders) NÃO é afetada
--
-- Idempotente: usa ON CONFLICT DO NOTHING em todos os INSERTs.
-- Pode rodar múltiplas vezes sem duplicar dados.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. PROFESSORES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO teachers (id, name, cpf, email, phone, specialty, days_of_week, rate_per_class, active) VALUES
    ('TE-A7B2C3', 'Bruna Mandz',     '98765432100', 'bruna@escola.com',    '21999990001', 'Piano, Canto',   'seg, ter, qua, qui, sex', 80.00, true),
    ('TE-B3C4D5', 'Carlos Oliveira', '11122233344', 'carlos@escola.com',   '21988880001', 'Violão, Guitarra', 'seg, ter, qua, qui', 65.00, true),
    ('TE-C5D6E7', 'Marina Santos',   '22233344455', 'marina@escola.com',   '21977770001', 'Bateria, Percussão', 'ter, qua, qui, sex', 70.00, true),
    ('TE-D7E8F9', 'Ricardo Lima',    '33344455566', 'ricardo@escola.com',  '21966660001', 'Violino, Viola',    'seg, qua, sex', 75.00, true),
    ('TE-E9F0G1', 'Juliana Costa',   '44455566677', 'juliana@escola.com',  '21955550001', 'Canto, Teoria Musical', 'seg, ter, qua, qui, sex', 60.00, true),
    ('TE-F1G2H3', 'Thiago Souza',    '55566677788', 'thiago@escola.com',   '21944440001', 'Saxofone, Flauta',  'ter, qui, sex, sab', 65.00, true)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. ALUNOS
-- ═══════════════════════════════════════════════════════════════════════════
-- Distribuídos em todos os 7 status do ciclo de vida:
--   lead → interested → enrolled → active → suspended → completed → cancelled

INSERT INTO students (id, name, email, phone, address, instruments, status, source, enrolled_at, guardian_name, guardian_cpf, guardian_phone) VALUES

    -- ✅ Ativos (alunos frequentes)
    ('ST-ABCDEF', 'Sofia Almeida',     'sofia@email.com',      '21970010001',
     'Rua das Flores, 123, Centro',     'Piano, Bateria',       'active',
     'website',      NOW() - interval '6 months', NULL, NULL, NULL),

    ('ST-BCDEFG', 'Lucas Mendes',       'lucas@email.com',      '21970010002',
     'Av. Paulista, 456, Apto 701',     'Violão',               'active',
     'indicacao',    NOW() - interval '4 months', NULL, NULL, NULL),

    ('ST-CDEFGH', 'Ana Beatriz Costa', 'anabeatriz@email.com', '21970010003',
     'Rua Augusta, 789, Casa 2',        'Canto',                'active',
     'social',       NOW() - interval '3 months', 'Renata Costa', '12345678901', '21970010011'),

    ('ST-EFGHIJ', 'Maria Clara Santos','mariaclara@email.com', '21970010004',
     'Rua Harmonia, 321',               'Piano',                'active',
     'website',      NOW() - interval '8 months', NULL, NULL, NULL),

    ('ST-JKLMNO', 'Matheus Araújo',     'matheus@email.com',    '21970010005',
     'Rua da Música, 555',              'Canto',                'active',
     'presencial',   NOW() - interval '2 months', NULL, NULL, NULL),

    -- 📝 Matriculado (matrícula feita, aguardando início)
    ('ST-DEFGHI', 'Pedro Henrique',     'pedro@email.com',      '21970010006',
     'Rua Beethoven, 888',              'Bateria',              'enrolled',
     'website',      NOW() - interval '1 month', 'Henrique Alves', '23456789012', '21970010012'),

    -- 🔍 Interessado (já teve contato, ainda não matriculou)
    ('ST-FGHIJK', 'João Vitor Oliveira','joao@email.com',       '21970010007',
     'Rua do Rock, 147',                'Guitarra',             'interested',
     'social',       NULL, NULL, NULL, NULL),

    -- 📋 Lead (primeiro contato)
    ('ST-GHIJKL', 'Isabela Rocha',      'isabela@email.com',    '21970010008',
     'Rua dos Violinos, 222',           'Violino',              'lead',
     'website',      NULL, NULL, NULL, NULL),

    ('ST-LMNOPQ', 'Rafael Torres',      'rafael@email.com',     '21970010009',
     'Rua das Notas, 777',              'Teoria Musical',       'lead',
     'indicacao',    NULL, NULL, NULL, NULL),

    -- ⏸️ Trancado (suspenso temporariamente)
    ('ST-HIJKLM', 'Gabriel Santos',     'gabriel@email.com',    '21970010010',
     'Rua do Jazz, 444',                'Teclado',              'suspended',
     'presencial',   NOW() - interval '5 months', 'Mariana Santos', '34567890123', '21970010013'),

    -- 🎓 Concluído (completou o curso)
    ('ST-IJKLMN', 'Larissa Fernanda',   'larissa@email.com',    '21970010014',
     'Rua do Acorde, 666',              'Flauta',               'completed',
     'website',      NOW() - interval '12 months', NULL, NULL, NULL),

    -- ❌ Cancelado (desistiu)
    ('ST-KLMNOP', 'Camila Duarte',      'camila@email.com',     '21970010015',
     'Rua dos Acordes, 333',            'Ukulele',              'cancelled',
     'social',       NOW() - interval '2 months', 'Paulo Duarte', '45678901234', '21970010016')

ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. MATRÍCULAS (ENROLLMENTS)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO enrollments (id, student_id, teacher_id, instrument, day_of_week, class_time, duration_minutes, classes_per_week, monthly_fee, billing_type, status, notes) VALUES

    -- Alunos ativos com matrícula
    ('EN-ABCDEF', 'ST-ABCDEF', 'TE-A7B2C3', 'Piano',   'seg', '14:00', 60, 1, 300.00, 'monthly', 'active', NULL),
    ('EN-BCDEFG', 'ST-BCDEFG', 'TE-B3C4D5', 'Violão',  'ter', '15:00', 45, 1, 250.00, 'monthly', 'active', NULL),
    ('EN-CDEFGH', 'ST-CDEFGH', 'TE-E9F0G1', 'Canto',   'qua', '10:00', 60, 1, 280.00, 'monthly', 'active', NULL),
    ('EN-EFGHIJ', 'ST-EFGHIJ', 'TE-A7B2C3', 'Piano',   'qui', '16:00', 60, 1, 300.00, 'monthly', 'active', NULL),

    -- Aluno com 2 instrumentos (2 matrículas)
    ('EN-JKLMNO', 'ST-JKLMNO', 'TE-E9F0G1', 'Canto',   'seg', '11:00', 60, 1, 280.00, 'monthly', 'active', NULL),
    ('EN-NOPQRS', 'ST-JKLMNO', 'TE-C5D6E7', 'Bateria', 'sex', '09:00', 45, 1, 200.00, 'monthly', 'active', 'Aulas de bateria 1x por semana'),

    -- Aluno matriculado aguardando início
    ('EN-DEFGHI', 'ST-DEFGHI', 'TE-C5D6E7', 'Bateria', 'ter', '14:30', 60, 1, 320.00, 'monthly', 'active', 'Início previsto para próxima semana'),

    -- Aluno suspenso (matrícula inativa)
    ('EN-HIJKLM', 'ST-HIJKLM', 'TE-B3C4D5', 'Teclado', 'sex', '13:00', 60, 1, 250.00, 'monthly', 'inactive', 'Suspenso a pedido do responsável até outubro/2026'),

    -- Aluno concluído
    ('EN-IJKLMN', 'ST-IJKLMN', 'TE-F1G2H3', 'Flauta',  'qui', '08:00', 45, 1, 200.00, 'monthly', 'inactive', 'Curso completo — 12 meses')

ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. MENSALIDADES (TUTIONS)
-- ═══════════════════════════════════════════════════════════════════════════
-- Mês corrente + mês anterior para dados de relatório financeiro

INSERT INTO tuitions (id, student_id, enrollment_id, reference_month, amount, discount_amount, discount_reason, due_date, status, paid_at, payment_method, billing_type) VALUES

    -- Mês corrente
    ('TU-AAAAAA', 'ST-ABCDEF', 'EN-ABCDEF', date_trunc('month', CURRENT_DATE), 300.00, 0, NULL,
     CURRENT_DATE + interval '5 days', 'paid', NOW() - interval '2 days', 'pix', 'monthly'),

    ('TU-BBBBBB', 'ST-BCDEFG', 'EN-BCDEFG', date_trunc('month', CURRENT_DATE), 250.00, 0, NULL,
     CURRENT_DATE + interval '10 days', 'pending', NULL, NULL, 'monthly'),

    ('TU-CCCCCC', 'ST-CDEFGH', 'EN-CDEFGH', date_trunc('month', CURRENT_DATE), 280.00, 0, NULL,
     CURRENT_DATE - interval '2 days', 'paid', CURRENT_DATE - interval '1 day', 'money', 'monthly'),

    ('TU-DDDDDD', 'ST-EFGHIJ', 'EN-EFGHIJ', date_trunc('month', CURRENT_DATE), 300.00, 0, NULL,
     CURRENT_DATE - interval '5 days', 'paid', CURRENT_DATE - interval '6 days', 'pix', 'monthly'),

    ('TU-EEEEEE', 'ST-JKLMNO', 'EN-JKLMNO', date_trunc('month', CURRENT_DATE), 280.00, 0, NULL,
     CURRENT_DATE + interval '3 days', 'pending', NULL, NULL, 'monthly'),

    ('TU-FFFFFF', 'ST-JKLMNO', 'EN-NOPQRS', date_trunc('month', CURRENT_DATE), 200.00, 0, NULL,
     CURRENT_DATE + interval '3 days', 'pending', NULL, NULL, 'monthly'),

    ('TU-GGGGGG', 'ST-DEFGHI', 'EN-DEFGHI', date_trunc('month', CURRENT_DATE), 320.00, 0, NULL,
     CURRENT_DATE + interval '20 days', 'pending', NULL, NULL, 'monthly'),

    -- Mensalidades em atraso (overdue)
    ('TU-HHHHHH', 'ST-HIJKLM', 'EN-HIJKLM', date_trunc('month', CURRENT_DATE), 250.00, 0, NULL,
     CURRENT_DATE - interval '15 days', 'overdue', NULL, NULL, 'monthly'),

    ('TU-IIIIII', 'ST-HIJKLM', 'EN-HIJKLM', date_trunc('month', CURRENT_DATE - interval '1 month'), 250.00, 0, NULL,
     CURRENT_DATE - interval '45 days', 'overdue', NULL, NULL, 'monthly'),

    -- Mês anterior (para relatório)
    ('TU-JJJJJJ', 'ST-ABCDEF', 'EN-ABCDEF', date_trunc('month', CURRENT_DATE - interval '1 month'), 300.00, 0, NULL,
     CURRENT_DATE - interval '25 days', 'paid', CURRENT_DATE - interval '28 days', 'pix', 'monthly'),

    ('TU-KKKKKK', 'ST-EFGHIJ', 'EN-EFGHIJ', date_trunc('month', CURRENT_DATE - interval '1 month'), 300.00, 0, NULL,
     CURRENT_DATE - interval '35 days', 'paid', CURRENT_DATE - interval '37 days', 'card', 'monthly'),

    ('TU-LLLLLL', 'ST-BCDEFG', 'EN-BCDEFG', date_trunc('month', CURRENT_DATE - interval '1 month'), 250.00, 50.00, 'Desconto de indicação',
     CURRENT_DATE - interval '20 days', 'paid', CURRENT_DATE - interval '22 days', 'pix', 'monthly')

ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. AULAS (LESSONS)
-- ═══════════════════════════════════════════════════════════════════════════
-- Aulas para a semana corrente, para popular a Agenda

DO $$
DECLARE
    current_monday date := date_trunc('week', CURRENT_DATE)::date;
BEGIN
    INSERT INTO lessons (id, enrollment_id, student_id, teacher_id, instrument, date, start_time, end_time, duration_minutes, lesson_type, status, notes) VALUES

        -- Segunda-feira
        ('LS-AAAAAA', 'EN-ABCDEF', 'ST-ABCDEF', 'TE-A7B2C3', 'Piano',   current_monday,             '14:00', '15:00', 60, 'regular', 'completed', NULL),
        ('LS-BBBBBB', 'EN-JKLMNO', 'ST-JKLMNO', 'TE-E9F0G1', 'Canto',   current_monday,             '11:00', '12:00', 60, 'regular', 'completed', NULL),

        -- Terça-feira
        ('LS-CCCCCC', 'EN-BCDEFG', 'ST-BCDEFG', 'TE-B3C4D5', 'Violão',  current_monday + 1,         '15:00', '15:45', 45, 'regular', 'completed', NULL),
        ('LS-DDDDDD', 'EN-DEFGHI', 'ST-DEFGHI', 'TE-C5D6E7', 'Bateria', current_monday + 1,         '14:30', '15:30', 60, 'regular', 'scheduled', 'Aula experimental'),

        -- Quarta-feira
        ('LS-EEEEEE', 'EN-CDEFGH', 'ST-CDEFGH', 'TE-E9F0G1', 'Canto',   current_monday + 2,         '10:00', '11:00', 60, 'regular', 'scheduled', NULL),
        ('LS-FFFFFF', 'EN-ABCDEF', 'ST-ABCDEF', 'TE-A7B2C3', 'Piano',   current_monday + 2,         '14:00', '15:00', 60, 'make_up', 'scheduled', 'Reposição de 15/07'),

        -- Quinta-feira
        ('LS-GGGGGG', 'EN-EFGHIJ', 'ST-EFGHIJ', 'TE-A7B2C3', 'Piano',   current_monday + 3,         '16:00', '17:00', 60, 'regular', 'scheduled', NULL),
        ('LS-HHHHHH', 'EN-IJKLMN', 'ST-IJKLMN', 'TE-F1G2H3', 'Flauta',  current_monday + 3,         '08:00', '08:45', 45, 'regular', 'completed', 'Última aula do curso 🎓'),

        -- Sexta-feira
        ('LS-IIIIII', 'EN-NOPQRS', 'ST-JKLMNO', 'TE-C5D6E7', 'Bateria', current_monday + 4,         '09:00', '09:45', 45, 'regular', 'scheduled', NULL),
        ('LS-JJJJJJ', 'EN-HIJKLM', 'ST-HIJKLM', 'TE-B3C4D5', 'Teclado', current_monday + 4,         '13:00', '14:00', 60, 'regular', 'cancelled', 'Aluno suspenso')

    ON CONFLICT (id) DO NOTHING;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. PRESENÇAS (ATTENDANCE)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO attendance (id, lesson_id, student_id, status, late_minutes, notes, recorded_by) VALUES
    ('AT-AAAAAA', 'LS-AAAAAA', 'ST-ABCDEF', 'present',  0, NULL, 'Bruna Mandz'),
    ('AT-BBBBBB', 'LS-BBBBBB', 'ST-JKLMNO', 'present',  5, 'Chegou atrasado por causa do trânsito', 'Juliana Costa'),
    ('AT-CCCCCC', 'LS-CCCCCC', 'ST-BCDEFG', 'present',  0, NULL, 'Carlos Oliveira'),
    ('AT-HHHHHH', 'LS-HHHHHH', 'ST-IJKLMN', 'late',    10, 'Atrasada — trânsito', 'Thiago Souza'),
    ('AT-DDDDDD', 'LS-DDDDDD', 'ST-DEFGHI', 'absent',   0, 'Faltou na aula experimental — remarcado',                               'Marina Santos')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. RECEITAS AVULSAS (PAYMENTS)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO payments (id, student_id, description, amount, payment_method, paid_at, category) VALUES
    ('PA-AAAAAA', 'ST-ABCDEF', 'Material didático — 2º semestre', 89.90, 'pix',   NOW() - interval '10 days',  'material'),
    ('PA-BBBBBB', 'ST-CDEFGH', 'Taxa de matrícula',              150.00, 'card',  NOW() - interval '2 months', 'matricula'),
    ('PA-CCCCCC', 'ST-EFGHIJ', 'Aula extra — preparação para concurso', 120.00, 'pix', NOW() - interval '5 days', 'aula_extra'),
    ('PA-DDDDDD', 'ST-ABCDEF', 'Material: caderno de partituras',  45.00, 'money', NOW() - interval '20 days', 'material'),
    ('PA-EEEEEE', NULL,         'Venda de palheta avulsa',          15.00, 'pix',   NOW() - interval '3 days',  'outro')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. DESPESAS (EXPENSES)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO expenses (id, description, amount, category, expense_type, due_date, paid, paid_at) VALUES

    -- Despesas fixas do mês corrente
    ('EX-AAAAAA', 'Aluguel da Sala Comercial',         2500.00, 'aluguel', 'fixed',    CURRENT_DATE - interval '2 days',  true,  NOW() - interval '3 days'),
    ('EX-BBBBBB', 'Conta de Luz',                       320.00, 'luz',     'variable', CURRENT_DATE + interval '8 days',  false, NULL),
    ('EX-CCCCCC', 'Conta de Água',                      120.00, 'agua',    'variable', CURRENT_DATE + interval '10 days', false, NULL),

    -- Material
    ('EX-DDDDDD', 'Cordas para violão (lote)',          180.00, 'material', 'variable', CURRENT_DATE - interval '5 days', true,  NOW() - interval '6 days'),
    ('EX-EEEEEE', 'Palhetas (caixa com 50)',             35.00, 'material', 'variable', CURRENT_DATE - interval '3 days', true,  NOW() - interval '4 days'),

    -- Outras despesas
    ('EX-FFFFFF', 'Manutenção do piano — afinação',     350.00, 'outro',   'eventual', CURRENT_DATE + interval '15 days', false, NULL),
    ('EX-GGGGGG', 'Material de limpeza (mensal)',        80.00, 'outro',   'variable', CURRENT_DATE - interval '7 days', true,  NOW() - interval '8 days'),

    -- Mês anterior
    ('EX-HHHHHH', 'Aluguel da Sala Comercial',         2500.00, 'aluguel', 'fixed',    CURRENT_DATE - interval '35 days', true, CURRENT_DATE - interval '37 days'),
    ('EX-IIIIII', 'Conta de Luz (mês passado)',         280.00, 'luz',     'variable', CURRENT_DATE - interval '28 days', true, CURRENT_DATE - interval '30 days')

ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. INVESTIMENTOS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO investments (id, description, amount, category, purchased_at, notes) VALUES
    ('IN-AAAAAA', 'Piano Digital Yamaha Clavinova',    8500.00, 'equipamento',  CURRENT_DATE - interval '60 days', 'Sala 2 — novo piano para aulas'),
    ('IN-BBBBBB', 'Kit de Bateria Eletrônica Roland',  4200.00, 'instrumento',  CURRENT_DATE - interval '45 days', 'Bateria para sala 3'),
    ('IN-CCCCCC', 'Home Office — Mesa e cadeira',      1800.00, 'movel',        CURRENT_DATE - interval '30 days', 'Mobília para a secretaria'),
    ('IN-DDDDDD', 'Reforma da recepção — pintura',     2500.00, 'infraestrutura', CURRENT_DATE - interval '20 days', 'Pintura e novos quadros na recepção'),
    ('IN-EEEEEE', 'Anúncios Instagram/Facebook (Jul)',  800.00, 'marketing',    CURRENT_DATE - interval '15 days', 'Campanha de captação de leads')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. PAGAMENTOS A PROFESSORES
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO teacher_payments (id, teacher_id, reference_month, amount, paid, paid_at, notes) VALUES
    -- Mês corrente (ainda não pago)
    ('TP-AAAAAA', 'TE-A7B2C3', date_trunc('month', CURRENT_DATE), 1280.00, false, NULL, 'Estimativa: 16 aulas no mês'),
    ('TP-BBBBBB', 'TE-B3C4D5', date_trunc('month', CURRENT_DATE),  975.00, false, NULL, 'Estimativa: 15 aulas no mês'),
    ('TP-CCCCCC', 'TE-C5D6E7', date_trunc('month', CURRENT_DATE),  560.00, false, NULL, 'Estimativa: 8 aulas no mês'),
    ('TP-DDDDDD', 'TE-D7E8F9', date_trunc('month', CURRENT_DATE),  300.00, false, NULL, 'Estimativa: 4 aulas no mês'),

    -- Mês anterior (pago)
    ('TP-EEEEEE', 'TE-A7B2C3', date_trunc('month', CURRENT_DATE - interval '1 month'), 1200.00, true, CURRENT_DATE - interval '10 days', '16 aulas × R$ 80,00 = R$ 1.280,00 — desconto de R$ 80,00'),
    ('TP-FFFFFF', 'TE-B3C4D5', date_trunc('month', CURRENT_DATE - interval '1 month'),  910.00, true, CURRENT_DATE - interval '10 days', '14 aulas × R$ 65,00'),
    ('TP-GGGGGG', 'TE-C5D6E7', date_trunc('month', CURRENT_DATE - interval '1 month'),  490.00, true, CURRENT_DATE - interval '10 days', '7 aulas × R$ 70,00'),
    ('TP-HHHHHH', 'TE-E9F0G1', date_trunc('month', CURRENT_DATE - interval '1 month'),  720.00, true, CURRENT_DATE - interval '10 days', '12 aulas × R$ 60,00')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- RESUMO
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 'seed-completo' AS etapa,
       COUNT(*) FILTER (WHERE tabela = 'teachers')          AS professores,
       COUNT(*) FILTER (WHERE tabela = 'students')          AS alunos,
       COUNT(*) FILTER (WHERE tabela = 'enrollments')        AS matriculas,
       COUNT(*) FILTER (WHERE tabela = 'tuitions')           AS mensalidades,
       COUNT(*) FILTER (WHERE tabela = 'lessons')            AS aulas,
       COUNT(*) FILTER (WHERE tabela = 'attendance')         AS presencas,
       COUNT(*) FILTER (WHERE tabela = 'payments')           AS receitas_avulsas,
       COUNT(*) FILTER (WHERE tabela = 'expenses')           AS despesas,
       COUNT(*) FILTER (WHERE tabela = 'investments')        AS investimentos,
       COUNT(*) FILTER (WHERE tabela = 'teacher_payments')   AS pagto_professores
FROM (
    SELECT 'teachers' AS tabela FROM teachers
    UNION ALL SELECT 'students' FROM students
    UNION ALL SELECT 'enrollments' FROM enrollments
    UNION ALL SELECT 'tuitions' FROM tuitions
    UNION ALL SELECT 'lessons' FROM lessons
    UNION ALL SELECT 'attendance' FROM attendance
    UNION ALL SELECT 'payments' FROM payments
    UNION ALL SELECT 'expenses' FROM expenses
    UNION ALL SELECT 'investments' FROM investments
    UNION ALL SELECT 'teacher_payments' FROM teacher_payments
) t;

-- ═══════════════════════════════════════════════════════════════════════════
-- FIM DO SEED COMPLETO
-- ═══════════════════════════════════════════════════════════════════════════
