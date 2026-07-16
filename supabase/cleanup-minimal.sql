-- ============================================================
-- CLEANUP: Dados Mínimos — Escola Bruna Mandz
-- ============================================================
-- Mantém: 1 aluno (Sofia Almeida), 1 professor (Bruna Mandz),
--         1 vínculo, store (products + orders) INTOCADO.
-- Remove: todos os outros alunos, professores, aulas,
--         mensalidades, pagamentos, despesas, investimentos.
-- ============================================================

-- Ordem respeita FKs (deleta filhos antes dos pais)

-- 1. Attendance (FK → lessons)
DELETE FROM attendance;

-- 2. Lessons (FK → enrollments — on delete set null, seguro deletar)
DELETE FROM lessons;

-- 3. Teacher payments (FK → teachers)
DELETE FROM teacher_payments;

-- 4. Tuitions (FK → students, enrollments)
DELETE FROM tuitions;

-- 5. Avulsas payments (FK → students, opcional)
DELETE FROM payments;

-- 6. Expenses (sem FK)
DELETE FROM expenses;

-- 7. Investments (sem FK)
DELETE FROM investments;

-- 8. Enrollments (FK → students, teachers)
DELETE FROM enrollments;

-- 9. Alunos — mantém só Sofia Almeida
DELETE FROM students WHERE id <> 'ST-ABCDEF';

-- 10. Professores — mantém só Bruna Mandz
DELETE FROM teachers WHERE id <> 'TE-A7B2C3';

-- 11. Recria 1 vínculo Sofia + Bruna (Piano, seg 14:00)
INSERT INTO enrollments (id, student_id, teacher_id, instrument, day_of_week, class_time, duration_minutes, classes_per_week, monthly_fee, billing_type, status)
VALUES ('EN-ABCDEF', 'ST-ABCDEF', 'TE-A7B2C3', 'Piano', 'seg', '14:00', 60, 1, 300.00, 'monthly', 'active');

-- 12. Recria 1 mensalidade paga para o mês corrente
INSERT INTO tuitions (id, student_id, enrollment_id, reference_month, amount, discount_amount, due_date, status, paid_at, payment_method)
VALUES ('TU-AAAAAA', 'ST-ABCDEF', 'EN-ABCDEF', date_trunc('month', CURRENT_DATE), 300.00, 0, CURRENT_DATE + interval '5 days', 'paid', NOW(), 'pix');

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
SELECT 'students' AS tabela, count(*) FROM students
UNION ALL SELECT 'teachers', count(*) FROM teachers
UNION ALL SELECT 'enrollments', count(*) FROM enrollments
UNION ALL SELECT 'tuitions', count(*) FROM tuitions
UNION ALL SELECT 'lessons', count(*) FROM lessons
UNION ALL SELECT 'attendance', count(*) FROM attendance
UNION ALL SELECT 'payments', count(*) FROM payments
UNION ALL SELECT 'expenses', count(*) FROM expenses
UNION ALL SELECT 'investments', count(*) FROM investments
UNION ALL SELECT 'teacher_payments', count(*) FROM teacher_payments
UNION ALL SELECT 'products', count(*) FROM products
UNION ALL SELECT 'orders', count(*) FROM orders
ORDER BY tabela;

-- ============================================================
-- FIM
-- ============================================================
