-- ============================================================
-- SEED: Escola Bruna Mandz — Dados Realistas
-- ============================================================
-- Remove o aluno de teste
DELETE FROM students WHERE name = 'TESTE';

-- ── PROFESSORES ──────────────────────────────────────────────

INSERT INTO teachers (id, name, phone, specialty, days_of_week, rate_per_class) VALUES
    ('TE-A7B2C3', 'Bruna Mandz',     '(21) 99999-0001', 'Piano, Canto',   '{seg,ter,qua,qui,sex}', 0),
    ('TE-D4E5F6', 'Carlos Oliveira', '(21) 99999-0002', 'Violão, Guitarra', '{seg,ter,qua,qui}', 50.00),
    ('TE-G7H8I9', 'Marina Santos',   '(21) 99999-0003', 'Bateria, Percussão', '{ter,qua,qui,sex,sab}', 60.00);

-- ── ALUNOS ───────────────────────────────────────────────────

INSERT INTO students (id, name, email, phone, address, instruments, active) VALUES
    ('ST-ABCDEF', 'Sofia Almeida',     'sofia.almeida@email.com',     '(21) 97001-0001', 'Rua das Flores, 123', 'Piano, Bateria',     true),
    ('ST-GHIJKL', 'Lucas Mendes',      'lucas.mendes@email.com',      '(21) 97001-0002', 'Av. Atlântica, 456',  'Violão',            true),
    ('ST-MNOPQR', 'Isabella Costa',    'isabella.costa@email.com',    '(21) 97001-0003', 'Rua do Sol, 789',     'Canto',             true),
    ('ST-STUVWX', 'Gabriel Ferreira',  'gabriel.ferreira@email.com',  '(21) 97001-0004', 'Rua Aurora, 321',     'Bateria',           true),
    ('ST-YZ1234', 'Valentina Oliveira','valentina.oliveira@email.com','(21) 97001-0005', 'Travessa Azul, 654',  'Canto, Violão',     true),
    ('ST-567890', 'Enzo Pereira',      'enzo.pereira@email.com',      '(21) 97001-0006', 'Rua Nova, 987',      'Piano',             true);

-- ── VÍNCULOS (ENROLLMENTS) — AGENDA ─────────────────────────

INSERT INTO enrollments (id, student_id, teacher_id, instrument, day_of_week, class_time, duration_minutes, classes_per_week, monthly_fee, status) VALUES
    ('EN-ABCDEF', 'ST-ABCDEF', 'TE-A7B2C3', 'Piano',   'seg', '14:00', 60, 1, 300.00, 'active'),
    ('EN-GHIJKL', 'ST-GHIJKL', 'TE-D4E5F6', 'Violão',  'ter', '15:00', 60, 1, 250.00, 'active'),
    ('EN-MNOPQR', 'ST-MNOPQR', 'TE-A7B2C3', 'Canto',   'qua', '10:00', 45, 1, 350.00, 'active'),
    ('EN-STUVWX', 'ST-STUVWX', 'TE-G7H8I9', 'Bateria', 'qui', '16:00', 60, 1, 280.00, 'active'),
    ('EN-111111', 'ST-ABCDEF', 'TE-G7H8I9', 'Bateria', 'ter', '16:00', 60, 1, 280.00, 'active'),
    ('EN-222222', 'ST-YZ1234', 'TE-A7B2C3', 'Canto',   'qui', '10:00', 45, 1, 350.00, 'active'),
    ('EN-333333', 'ST-567890', 'TE-A7B2C3', 'Piano',   'sab', '08:00', 60, 1, 300.00, 'active'),
    ('EN-444444', 'ST-YZ1234', 'TE-D4E5F6', 'Violão',  'sex', '09:00', 60, 1, 250.00, 'active');

-- ── MENSALIDADES (JULHO/2026) ───────────────────────────────

INSERT INTO tuitions (id, student_id, enrollment_id, reference_month, amount, discount_amount, discount_reason, due_date, status, paid_at, payment_method) VALUES
    -- Pagas
    ('TU-AAAAAA', 'ST-ABCDEF', 'EN-ABCDEF', '2026-07-01', 300.00, 0, NULL,           '2026-07-05', 'paid',   '2026-07-05T10:00:00Z', 'pix'),
    ('TU-BBBBBB', 'ST-GHIJKL', 'EN-GHIJKL', '2026-07-01', 250.00, 0, NULL,           '2026-07-10', 'paid',   '2026-07-08T14:30:00Z', 'card'),
    ('TU-CCCCCC', 'ST-MNOPQR', 'EN-MNOPQR', '2026-07-01', 350.00, 50, 'Bolsa Família','2026-07-05', 'paid',   '2026-07-03T09:00:00Z', 'pix'),
    ('TU-DDDDDD', 'ST-STUVWX', 'EN-STUVWX', '2026-07-01', 280.00, 0, NULL,           '2026-07-15', 'paid',   '2026-07-15T11:00:00Z', 'money'),
    ('TU-EEEEEE', 'ST-ABCDEF', 'EN-111111', '2026-07-01', 280.00, 0, NULL,           '2026-07-05', 'paid',   '2026-07-05T10:05:00Z', 'pix'),
    -- Pendentes
    ('TU-FFFFFF', 'ST-YZ1234', 'EN-222222', '2026-07-01', 350.00, 0, NULL,           '2026-07-10', 'pending', NULL, NULL),
    ('TU-GGGGGG', 'ST-567890', 'EN-333333', '2026-07-01', 300.00, 0, NULL,           '2026-07-20', 'pending', NULL, NULL),
    ('TU-HHHHHH', 'ST-YZ1234', 'EN-444444', '2026-07-01', 250.00, 0, NULL,           '2026-07-10', 'pending', NULL, NULL),
    -- Uma atrasada
    ('TU-IIIIII', 'ST-STUVWX', 'EN-STUVWX', '2026-06-01', 280.00, 0, NULL,           '2026-06-15', 'overdue', NULL, NULL);

-- ============================================================
-- FIM DO SEED
-- ============================================================
