-- ═══════════════════════════════════════════════════════════════════════════
-- Schema Supabase — Módulo Financeiro + Pedagógico Escola Bruna Mandz
--
-- Depende de supabase/schema.sql (função set_updated_at).
-- Pode rodar múltiplas vezes (usa IF NOT EXISTS / CREATE OR REPLACE).
--
-- ═══════════════════════════════════════════════════════════════════════════
-- HISTÓRICO DE SINCRONIZAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════
-- Etapa 37 (07/07/2026): Separação pedagógico x financeiro.
--   - teachers ganhou rate_per_class
--   - tuitions perdeu teacher_id, instrument, duration_minutes, classes_per_week
--   - tuitions ganhou enrollment_id, reference_month
--   - Criadas tabelas: enrollments, teacher_payments
--   - RLS: mesmas regras — acesso só via Service Role Key
-- (09/07/2026): Adicionado campo instruments (text) à tabela students.
--   Armazena instrumento(s) que o aluno toca (ex: "Piano, Violão").
-- (09/07/2026): Migration lessons + attendance.
--   - lessons: aula real em data específica (referencia enrollment)
--   - attendance: presença do aluno na aula
--   - 8 lessons geradas automaticamente dos enrollments ativos
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. TABELA: students (Alunos)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.students (
    id text primary key,                    -- ST-XXXXXX
    name text not null,
    cpf text,                               -- CPF do aluno
    guardian_cpf text,                      -- CPF do responsável
    email text,
    phone text,
    address text,
    instruments text not null default '',   -- Instrumento(s) que o aluno toca (ex: "Piano, Violão")
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists students_active_idx on public.students (active)
    where active = true;

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
    before update on public.students
    for each row
    execute function public.set_updated_at();

alter table public.students enable row level security;

-- RLS policy: admin (authenticated) pode tudo; anon não tem acesso.
-- Usa TO authenticated em vez do deprecated auth.role().
create policy "admin manage students"
    on public.students for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. TABELA: teachers (Professores)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.teachers (
    id text primary key,                    -- PR-XXXXXX
    name text not null,
    cpf text,                               -- CPF do professor
    email text,
    phone text,
    specialty text,                         -- Ex: "Piano, Teclado"
    rate_per_class numeric(10,2) not null default 0.00,
    days_of_week text,                      -- json/string com dias disponíveis
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

drop trigger if exists teachers_set_updated_at on public.teachers;
create trigger teachers_set_updated_at
    before update on public.teachers
    for each row
    execute function public.set_updated_at();

alter table public.teachers enable row level security;

create policy "admin manage teachers"
    on public.teachers for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. TABELA: enrollments (Vínculos Pedagógicos)  — Etapa 37
-- ═══════════════════════════════════════════════════════════════════════════
-- Dona do domínio pedagógico: aluno + professor + instrumento + dia/horário.
-- Substitui os campos que antes estavam em tuitions.
-- Base tanto para cobrança (tuitions) quanto para a Agenda.

create table if not exists public.enrollments (
    id text primary key,                    -- EN-XXXXXX
    student_id text not null references public.students(id) on delete cascade,
    teacher_id text references public.teachers(id) on delete set null,
    instrument text,
    day_of_week text,                       -- 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'
    class_time text,                        -- formato 'HH:MM'
    duration_minutes integer not null default 60,
    classes_per_week integer not null default 1,
    monthly_fee numeric(10,2) not null default 0.00,
    billing_type text not null default 'monthly'
        constraint enrollments_billing_type_check
        check (billing_type in ('weekly', 'monthly', 'full')),
    total_amount numeric(10,2),           -- para 'full': valor total do curso
    installments integer not null default 1,  -- para 'full' parcelado
    status text not null default 'active'
        constraint enrollments_status_check
        check (status in ('active', 'inactive', 'cancelled')),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Índices para consultas comuns
create index if not exists enrollments_student_id_idx on public.enrollments (student_id);
create index if not exists enrollments_teacher_id_idx on public.enrollments (teacher_id);
create index if not exists enrollments_status_idx on public.enrollments (status);
create index if not exists enrollments_day_of_week_idx on public.enrollments (day_of_week)
    where status = 'active';  -- só vínculos ativos aparecem na agenda

drop trigger if exists enrollments_set_updated_at on public.enrollments;
create trigger enrollments_set_updated_at
    before update on public.enrollments
    for each row
    execute function public.set_updated_at();

alter table public.enrollments enable row level security;

create policy "admin manage enrollments"
    on public.enrollments for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. TABELA: tuitions (Mensalidades)
-- ═══════════════════════════════════════════════════════════════════════════
-- Etapa 37: agora é SÓ a cobrança mensal. Dado pedagógico migrou para enrollments.

create table if not exists public.tuitions (
    id text primary key,                    -- TU-XXXXXX
    student_id text not null references public.students(id) on delete cascade,
    enrollment_id text references public.enrollments(id) on delete set null,  -- Etapa 37
    reference_month text,                   -- Etapa 37: formato 'YYYY-MM'

    amount numeric(10,2) not null default 0.00,
    billing_type text
        constraint tuitions_billing_type_check
        check (billing_type in ('weekly', 'monthly', 'full')),
    installment_number integer,           -- para 'full' parcelado, nº da parcela
    discount_amount numeric(10,2) not null default 0.00,
    discount_reason text,
    due_date date not null,
    status text not null default 'pending'
        constraint tuitions_status_check
        check (status in ('pending', 'paid', 'overdue', 'cancelled')),
    payment_method text
        constraint tuitions_payment_method_check
        check (payment_method in ('pix', 'card', 'money', 'other')),
    paid_at timestamptz,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Índices para performance
create index if not exists tuitions_student_id_idx on public.tuitions (student_id);
create index if not exists tuitions_enrollment_id_idx on public.tuitions (enrollment_id);
create index if not exists tuitions_status_idx on public.tuitions (status);
create index if not exists tuitions_due_date_idx on public.tuitions (due_date);

-- Índices para o resumo financeiro mensal (handleSummary)
create index if not exists tuitions_paid_at_idx on public.tuitions (paid_at)
    where status = 'paid';  -- só mensalidades pagas entram no resumo

create index if not exists tuitions_reference_month_idx on public.tuitions (reference_month);

drop trigger if exists tuitions_set_updated_at on public.tuitions;
create trigger tuitions_set_updated_at
    before update on public.tuitions
    for each row
    execute function public.set_updated_at();

alter table public.tuitions enable row level security;

create policy "admin manage tuitions"
    on public.tuitions for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. TABELA: payments (Pagamentos Avulsos)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.payments (
    id text primary key,                    -- PA-XXXXXX
    student_id text references public.students(id) on delete set null,
    description text not null,
    amount numeric(10,2) not null default 0.00,
    payment_method text not null
        constraint payments_payment_method_check
        check (payment_method in ('pix', 'card', 'money', 'other')),
    paid_at timestamptz not null default now(),
    category text not null default 'outro'
        constraint payments_category_check
        check (category in ('matricula', 'material', 'aula_extra', 'outro')),
    created_at timestamptz not null default now()
);

-- Índices
create index if not exists payments_student_id_idx on public.payments (student_id);
create index if not exists payments_category_idx on public.payments (category);

-- Índice para resumo financeiro (agregação por mês via paid_at)
create index if not exists payments_paid_at_idx on public.payments (paid_at);

alter table public.payments enable row level security;

create policy "admin manage payments"
    on public.payments for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. TABELA: expenses (Custos Fixos e Eventuais)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.expenses (
    id text primary key,                    -- EX-XXXXXX
    description text not null,
    amount numeric(10,2) not null default 0.00,
    category text not null default 'outro'
        constraint expenses_category_check
        check (category in ('aluguel', 'agua', 'luz', 'material', 'outro')),
    expense_type text not null default 'fixed'
        constraint expenses_type_check
        check (expense_type in ('fixed', 'eventual')),
    due_date date not null,
    paid boolean not null default false,
    paid_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Índices
create index if not exists expenses_due_date_idx on public.expenses (due_date);
create index if not exists expenses_paid_idx on public.expenses (paid)
    where paid = false;                        -- só despesas não-pagas relevantes para filtro
create index if not exists expenses_paid_at_idx on public.expenses (paid_at)
    where paid = true;                         -- para agregação mensal no resumo
create index if not exists expenses_type_idx on public.expenses (expense_type);

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
    before update on public.expenses
    for each row
    execute function public.set_updated_at();

alter table public.expenses enable row level security;

create policy "admin manage expenses"
    on public.expenses for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. TABELA: investments (Investimentos)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.investments (
    id text primary key,                    -- IN-XXXXXX
    description text not null,
    amount numeric(10,2) not null default 0.00,
    category text not null default 'outro'
        constraint investments_category_check
        check (category in ('instrumento', 'movel', 'equipamento', 'outro')),
    purchased_at date not null,
    notes text,
    created_at timestamptz not null default now()
);

create index if not exists investments_purchased_at_idx on public.investments (purchased_at);

alter table public.investments enable row level security;

create policy "admin manage investments"
    on public.investments for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. TABELA: teacher_payments (Pagamentos a Professores) — Etapa 37
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.teacher_payments (
    id text primary key,                    -- TP-XXXXXX
    teacher_id text not null references public.teachers(id) on delete cascade,
    reference_month date not null,          -- primeiro dia do mês de referência (ex: 2026-07-01)
    amount numeric(10,2) not null default 0.00,
    paid boolean not null default false,
    paid_at timestamptz,
    notes text,
    created_at timestamptz not null default now()
);

-- Índices para performance e resumo financeiro
create index if not exists teacher_payments_teacher_id_idx on public.teacher_payments (teacher_id);
create index if not exists teacher_payments_reference_month_idx on public.teacher_payments (reference_month);
create index if not exists teacher_payments_paid_at_idx on public.teacher_payments (paid_at)
    where paid = true;                       -- para agregação mensal no resumo (outgoings)

alter table public.teacher_payments enable row level security;

create policy "admin manage teacher_payments"
    on public.teacher_payments for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. TABELA: lessons (Aulas)  — 09/07/2026
-- ═══════════════════════════════════════════════════════════════════════════
-- Aula real em data específica. Referencia o enrollment (contrato pedagógico)
-- mas copia student_id, teacher_id e instrument para manter histórico
-- mesmo se o enrollment mudar no futuro.
--
-- A partial unique index lessons_no_overlap_active impede que um professor
-- tenha duas aulas no mesmo horário, EXCETO se uma delas foi cancelada.

create table if not exists public.lessons (
    id text primary key,                        -- LS-XXXXXX
    enrollment_id text not null references public.enrollments(id) on delete cascade,
    student_id text not null references public.students(id) on delete cascade,
    teacher_id text references public.teachers(id) on delete set null,
    instrument text,
    date date not null,
    start_time text not null,                   -- HH:MM
    end_time text not null,                     -- HH:MM (deve ser > start_time)
    duration_minutes integer not null default 60,
    lesson_type text not null default 'regular'
        constraint lessons_type_check
        check (lesson_type in ('regular', 'make_up', 'extra', 'trial')),
    status text not null default 'scheduled'
        constraint lessons_status_check
        check (status in ('scheduled', 'completed', 'cancelled', 'make_up')),
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint lessons_end_after_start check (end_time > start_time)
);

-- Partial unique index: professor não pode ter duas aulas não-canceladas
-- no mesmo horário. Aulas canceladas liberam o slot.
create unique index if not exists lessons_no_overlap_active
    on public.lessons (teacher_id, date, start_time)
    where status != 'cancelled';

-- Dashboard "Aulas de Hoje" + ordenação por horário
create index if not exists lessons_date_status_idx on public.lessons (date, status, start_time);
create index if not exists lessons_enrollment_id_idx on public.lessons (enrollment_id);
create index if not exists lessons_student_id_idx on public.lessons (student_id);
create index if not exists lessons_teacher_id_idx on public.lessons (teacher_id);
create index if not exists lessons_type_idx on public.lessons (lesson_type);

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
    before update on public.lessons
    for each row
    execute function public.set_updated_at();

alter table public.lessons enable row level security;

create policy "admin manage lessons"
    on public.lessons for all
    to authenticated
    using (true)
    with check (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. TABELA: attendance (Frequência)  — 09/07/2026
-- ═══════════════════════════════════════════════════════════════════════════
-- Registro de presença do aluno em uma aula.

create table if not exists public.attendance (
    id text primary key,                        -- AT-XXXXXX
    lesson_id text not null references public.lessons(id) on delete cascade,
    student_id text not null references public.students(id) on delete cascade,
    status text not null default 'present'
        constraint attendance_status_check
        check (status in ('present', 'absent', 'excused', 'late')),
    late_minutes integer not null default 0,
    notes text,
    recorded_at timestamptz not null default now(),
    recorded_by text,

    constraint attendance_unique_student_lesson unique (lesson_id, student_id)
);

create index if not exists attendance_lesson_id_idx on public.attendance (lesson_id);
create index if not exists attendance_student_id_idx on public.attendance (student_id);
create index if not exists attendance_status_idx on public.attendance (status);

alter table public.attendance enable row level security;

create policy "admin manage attendance"
    on public.attendance for all
    to authenticated
    using (true)
    with check (true);
