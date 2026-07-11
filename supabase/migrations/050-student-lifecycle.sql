-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 050 — Ciclo de Vida do Aluno
-- ═══════════════════════════════════════════════════════════════════════════
-- Substitui o campo `active` (boolean) por `status` (text) com valores
-- que representam o ciclo de vida completo do aluno:
--   lead          → Prospect/Lead (primeiro contato)
--   interested    → Interessado (já teve contato, ainda não matriculou)
--   enrolled      → Matriculado (matrícula feita, aguardando início)
--   active        → Ativo (aluno frequente)
--   suspended     → Trancado (suspenso temporariamente)
--   completed     → Concluído (completou o curso)
--   cancelled     → Cancelado (desistiu/excluído)
--
-- Também adiciona:
--   enrolled_at   → Data de matrícula/primeira aula
--   source        → Origem do lead (website, indicacao, social, presencial, outro)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Adiciona a coluna status (inicialmente nullable para backfill)
alter table if exists public.students
    add column if not exists status text;

-- 2. Adiciona coluna enrolled_at
alter table if exists public.students
    add column if not exists enrolled_at timestamptz;

-- 3. Adiciona coluna source
alter table if exists public.students
    add column if not exists source text
        constraint students_source_check
        check (source in ('website', 'indicacao', 'social', 'presencial', 'outro'));

-- 4. Backfill: converte active boolean para status text
--    active=true  → 'active'
--    active=false → 'cancelled'
do $$
begin
    if exists (select 1 from information_schema.columns
               where table_schema = 'public' and table_name = 'students'
               and column_name = 'active') then
        update public.students
            set status = case when active = true then 'active' else 'cancelled' end
            where status is null;
    end if;
end $$;

-- 5. Torna status NOT NULL após o backfill
do $$
begin
    -- Só altera se ainda for nullable
    if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'students'
        and column_name = 'status' and is_nullable = 'YES'
    ) then
        alter table public.students alter column status set not null;
    end if;
end $$;

-- 6. Adiciona check constraint para status
do $$
begin
    -- Só adiciona se não existir
    if not exists (
        select 1 from information_schema.constraint_column_usage
        where table_schema = 'public' and table_name = 'students'
        and constraint_name = 'students_status_check'
    ) then
        alter table public.students
            add constraint students_status_check
            check (status in ('lead', 'interested', 'enrolled', 'active', 'suspended', 'completed', 'cancelled'));
    end if;
end $$;

-- 7. Cria índice para status (substitui o índice parcial em active)
drop index if exists public.students_status_idx;
create index if not exists students_status_idx on public.students (status);

-- 8. Mantém o índice antigo em active para compatibilidade enquanto
--    a migração para status não estiver completa
--    (será removido em uma migration futura)
