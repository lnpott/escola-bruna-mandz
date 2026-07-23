-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 057 — Índices em teachers + CHECK constraint em enrollments
--
-- Correções da auditoria de boas práticas Postgres (Supabase Postgres Best
-- Practices Skill):
--
-- 1. teachers — 2 índices adicionados:
--    - `teachers_name_idx`: suporta .order('name') no GET /teachers
--    - `teachers_active_idx`: partial, filtra professores ativos
--
-- 2. enrollments — CHECK constraint adicionada em day_of_week:
--    - Garante que apenas valores válidos ('seg'..'dom') sejam aceitos
--    - Usa NOT VALID para não falhar se houver dados legados inválidos
--      (pode-se validar depois com ALTER TABLE ... VALIDATE CONSTRAINT)
--
-- Idempotente: CREATE INDEX usa IF NOT EXISTS, alter table usa validação
-- via DO block (CHECK constraint não tem IF NOT EXISTS diretamente).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Índices em teachers ──────────────────────────────────────────────

create index if not exists teachers_name_idx on public.teachers (name);
create index if not exists teachers_active_idx on public.teachers (active)
    where active = true;

-- ── 2. CHECK constraint em enrollments.day_of_week ──────────────────────

do $$
begin
    -- Só adiciona a constraint se ainda não existir
    if not exists (
        select 1 from pg_constraint
        where conname = 'enrollments_day_of_week_check'
          and conrelid = 'public.enrollments'::regclass
    ) then
        -- NOT VALID: não verifica linhas existentes, só novas inserts/updates
        alter table public.enrollments
            add constraint enrollments_day_of_week_check
            check (day_of_week in ('seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'))
            not valid;
    end if;
end $$;
