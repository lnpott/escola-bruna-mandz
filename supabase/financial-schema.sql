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

-- 2. Tabela de Mensalidades
create table if not exists public.tuitions (
    id text primary key,                 -- TU-XXXXXX
    student_id text not null references public.students(id) on delete cascade,
    amount numeric(10,2) not null default 0.00,
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

-- 4. Tabela de Custos Fixos / Despesas
create table if not exists public.expenses (
    id text primary key,                 -- EX-XXXXXX
    description text not null,
    amount numeric(10,2) not null default 0.00,
    category text not null default 'outro', -- 'aluguel' | 'agua' | 'luz' | 'material' | 'outro'
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
create index if not exists payments_student_id_idx on public.payments(student_id);
create index if not exists payments_category_idx on public.payments(category);
create index if not exists expenses_due_date_idx on public.expenses(due_date);
create index if not exists expenses_paid_idx on public.expenses(paid);
create index if not exists investments_purchased_at_idx on public.investments(purchased_at);

-- ─── Segurança (RLS) ──────────────────────────────────────────────────────────
alter table public.students enable row level security;
alter table public.tuitions enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.investments enable row level security;
