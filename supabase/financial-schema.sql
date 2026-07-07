-- ═══════════════════════════════════════════════════════════════════════════
-- Schema Supabase — Módulo Financeiro Escola Bruna Mandz
-- Cole este arquivo inteiro no SQL Editor do Supabase (Project > SQL Editor > New query)
-- e clique em "Run". Pode rodar de novo sem problemas (usa IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Tabela de Alunos
create table if not exists public.students (
    id text primary key,                 -- ST-XXXXXX
    name text not null,
    email text,
    phone text,
    address text,
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Triggers de updated_at para students
drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
    before update on public.students
    for each row
    execute function public.set_updated_at();

-- 2. Tabela de Professores
create table if not exists public.teachers (
    id text primary key,                 -- TE-XXXXXX
    name text not null,
    phone text,
    specialty text,
    -- Dias que o professor dá aula para futura agenda.
    -- Exemplo: ["seg","ter","qua"]
    days_of_week text[] not null default '{}'::text[],
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Triggers de updated_at para teachers
drop trigger if exists teachers_set_updated_at on public.teachers;
create trigger teachers_set_updated_at
    before update on public.teachers
    for each row
    execute function public.set_updated_at();

-- 3. Tabela de Mensalidades (valor por semana)
create table if not exists public.tuitions (
    id text primary key,                 -- TU-XXXXXX
    student_id text not null references public.students(id) on delete cascade,

    -- Novo: dados pedagógicos da mensalidade
    teacher_id text references public.teachers(id) on delete set null,
    instrument text,                    -- ex: Canto, Teclado, Violão...
    duration_minutes integer not null default 60,

    -- Regra: mensalidade é por semana
    amount numeric(10,2) not null default 0.00,

    -- Frequência/aulas por semana
    -- default: 1 (padrão “1 aula por semana”), mas permite sair do padrão.
    classes_per_week integer not null default 1,

    discount_amount numeric(10,2) not null default 0.00,
    discount_reason text,
    due_date date not null,
    status text not null default 'pending', -- 'pending' | 'paid' | 'overdue' | 'cancelled'
    payment_method text,                 -- 'pix' | 'card' | 'money' | 'other'
    paid_at timestamptz,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- Triggers de updated_at para tuitions
drop trigger if exists tuitions_set_updated_at on public.tuitions;
create trigger tuitions_set_updated_at
    before update on public.tuitions
    for each row
    execute function public.set_updated_at();

-- 3. Tabela de Pagamentos Avulsos (Matrícula, Material, etc.)
create table if not exists public.payments (
    id text primary key,                 -- PA-XXXXXX
    student_id text references public.students(id) on delete set null,
    description text not null,
    amount numeric(10,2) not null default 0.00,
    payment_method text not null,        -- 'pix' | 'card' | 'money' | 'other'
    paid_at timestamptz not null default now(),
    category text not null default 'outro', -- 'matricula' | 'material' | 'aula_extra' | 'outro'
    created_at timestamptz not null default now()
);

-- 4. Tabela de Custos (fixos e eventuais)
create table if not exists public.expenses (
    id text primary key,                 -- EX-XXXXXX
    description text not null,
    amount numeric(10,2) not null default 0.00,
    category text not null default 'outro', -- 'aluguel' | 'agua' | 'luz' | 'material' | 'outro'

    -- Novo: fixa ou eventual (evento único).
    -- Eventual: permite ser pago em outro mês (paid_at).
    expense_type text not null default 'fixed', -- 'fixed' | 'eventual'

    due_date date not null,
    paid boolean not null default false,
    paid_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- Triggers de updated_at para expenses
drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
    before update on public.expenses
    for each row
    execute function public.set_updated_at();

-- 5. Tabela de Investimentos
create table if not exists public.investments (
    id text primary key,                 -- IN-XXXXXX
    description text not null,
    amount numeric(10,2) not null default 0.00,
    category text not null default 'outro', -- 'instrumento' | 'movel' | 'equipamento' | 'outro'
    purchased_at date not null,
    notes text,
    created_at timestamptz not null default now()
);

-- ─── Índices para performance ──────────────────────────────────────────────
create index if not exists students_active_idx on public.students(active);
create index if not exists tuitions_student_id_idx on public.tuitions(student_id);
create index if not exists tuitions_status_idx on public.tuitions(status);
create index if not exists tuitions_due_date_idx on public.tuitions(due_date);
create index if not exists tuitions_teacher_id_idx on public.tuitions(teacher_id);

create index if not exists payments_student_id_idx on public.payments(student_id);
create index if not exists payments_category_idx on public.payments(category);
create index if not exists expenses_due_date_idx on public.expenses(due_date);
create index if not exists expenses_paid_idx on public.expenses(paid);
create index if not exists expenses_type_idx on public.expenses(expense_type);

create index if not exists investments_purchased_at_idx on public.investments(purchased_at);

-- ─── Segurança (RLS) ──────────────────────────────────────────────────────────
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.tuitions enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.investments enable row level security;

