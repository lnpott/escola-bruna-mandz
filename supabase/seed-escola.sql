-- ============================================================
-- SEED: Escola Bruna Mandz — Dados Mínimos
-- ============================================================
-- Mantém 1 aluno (Sofia), 1 professor (Bruna), 1 vínculo,
-- 1 mensalidade. Store (products/orders) não é afetada.
-- Para limpar dados existentes, use cleanup-minimal.sql.

-- ── PROFESSORES ──────────────────────────────────────────────

INSERT INTO teachers (id, name, phone, specialty, days_of_week, rate_per_class) VALUES
    ('TE-A7B2C3', 'Bruna Mandz',     '(21) 99999-0001', 'Piano, Canto',   'seg, ter, qua, qui, sex', 0)
ON CONFLICT (id) DO NOTHING;

-- ── ALUNOS ───────────────────────────────────────────────────

INSERT INTO students (id, name, email, phone, address, instruments, status, source, enrolled_at, guardian_name, guardian_cpf, guardian_phone) VALUES
    ('ST-ABCDEF', 'Sofia Almeida', 'sofia.almeida@email.com', '(21) 97001-0001',
     'Rua das Flores, 123', 'Piano, Bateria', 'active',
     'website', NOW(), 'Carlos Almeida', '123.456.789-00', '(21) 97001-0002')
ON CONFLICT (id) DO NOTHING;

-- ── VÍNCULOS (ENROLLMENTS) ──────────────────────────────────

INSERT INTO enrollments (id, student_id, teacher_id, instrument, day_of_week, class_time, duration_minutes, classes_per_week, monthly_fee, billing_type, status) VALUES
    ('EN-ABCDEF', 'ST-ABCDEF', 'TE-A7B2C3', 'Piano', 'seg', '14:00', 60, 1, 300.00, 'monthly', 'active')
ON CONFLICT (id) DO NOTHING;

-- ── MENSALIDADES ─────────────────────────────────────────────

INSERT INTO tuitions (id, student_id, enrollment_id, reference_month, amount, discount_amount, due_date, status, paid_at, payment_method) VALUES
    ('TU-AAAAAA', 'ST-ABCDEF', 'EN-ABCDEF', date_trunc('month', CURRENT_DATE), 300.00, 0, CURRENT_DATE + interval '5 days', 'paid', NOW(), 'pix')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- FIM DO SEED
-- ============================================================
