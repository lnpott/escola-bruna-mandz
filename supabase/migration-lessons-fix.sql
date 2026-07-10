-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration Fix: lessons — correções pós code-review
-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. Remove unique constraint table-level, cria partial unique index
--    (permite reutilizar horário de aula cancelada)
-- 2. Adiciona check constraint: end_time > start_time
-- ═══════════════════════════════════════════════════════════════════════════════

-- Remove a constraint table-level (que bloqueia horários de aulas canceladas)
alter table public.lessons drop constraint if exists lessons_no_overlap;

-- Cria partial unique index: só bloqueia conflito se a aula NÃO foi cancelada
create unique index if not exists lessons_no_overlap_active
    on public.lessons (teacher_id, date, start_time)
    where status != 'cancelled';

-- Garante que end_time seja sempre > start_time
alter table public.lessons
    add constraint lessons_end_after_start
    check (end_time > start_time);
