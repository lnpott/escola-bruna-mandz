-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRAÇÃO: Otimizações Postgres
-- Escola Bruna Mandz
-- ═══════════════════════════════════════════════════════════════════════════
-- Seguro para executar múltiplas vezes (idempotente).
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 1: Funções compartilhadas
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.set_updated_at()
returns trigger
security definer
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 2: DROP de índices antigos (substituídos por versões melhores)
-- ═══════════════════════════════════════════════════════════════════════════

drop index if exists public.orders_status_idx;
drop index if exists public.products_active_idx;
drop index if exists public.products_category_idx;
drop index if exists public.tuitions_teacher_id_idx;

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 3: Novos índices
-- ═══════════════════════════════════════════════════════════════════════════

-- orders
create index if not exists orders_status_created_idx
    on public.orders (status, created_at desc);
create index if not exists orders_mp_payment_id_idx
    on public.orders (mp_payment_id) where mp_payment_id is not null;

-- products
create index if not exists products_active_created_idx
    on public.products (active, created_at) where active = true;
create index if not exists products_category_active_idx
    on public.products (category, active);

-- students
create index if not exists students_active_idx
    on public.students (active) where active = true;

-- enrollments
create index if not exists enrollments_day_of_week_idx
    on public.enrollments (day_of_week) where status = 'active';
create index if not exists enrollments_student_id_idx
    on public.enrollments (student_id);
create index if not exists enrollments_teacher_id_idx
    on public.enrollments (teacher_id);
create index if not exists enrollments_status_idx
    on public.enrollments (status);

-- tuitions
create index if not exists tuitions_paid_at_idx
    on public.tuitions (paid_at) where status = 'paid';
create index if not exists tuitions_reference_month_idx
    on public.tuitions (reference_month);
create index if not exists tuitions_enrollment_id_idx
    on public.tuitions (enrollment_id);
create index if not exists tuitions_student_id_idx
    on public.tuitions (student_id);
create index if not exists tuitions_status_idx
    on public.tuitions (status);
create index if not exists tuitions_due_date_idx
    on public.tuitions (due_date);

-- payments
create index if not exists payments_paid_at_idx
    on public.payments (paid_at);
create index if not exists payments_student_id_idx
    on public.payments (student_id);
create index if not exists payments_category_idx
    on public.payments (category);

-- expenses
create index if not exists expenses_paid_idx
    on public.expenses (paid) where paid = false;
create index if not exists expenses_paid_at_idx
    on public.expenses (paid_at) where paid = true;
create index if not exists expenses_due_date_idx
    on public.expenses (due_date);
create index if not exists expenses_type_idx
    on public.expenses (expense_type);

-- teacher_payments
create index if not exists teacher_payments_teacher_id_idx
    on public.teacher_payments (teacher_id);
create index if not exists teacher_payments_reference_month_idx
    on public.teacher_payments (reference_month);
create index if not exists teacher_payments_paid_at_idx
    on public.teacher_payments (paid_at) where paid = true;

-- investments
create index if not exists investments_purchased_at_idx
    on public.investments (purchased_at);
