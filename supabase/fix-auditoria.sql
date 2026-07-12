-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRAÇÃO: Correções pós-auditoria de banco — jul/2026
-- Aplicar no Supabase SQL Editor (dashboard.supabase.com → SQL Editor)
-- Ordem importa: rode tudo de uma vez ou na sequência abaixo.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- PROBLEMA #1: Remover students.active (coluna legada — status é a fonte de verdade)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.students drop column if exists active;

-- ─────────────────────────────────────────────────────────────────────────
-- PROBLEMA #3: Garantir que enrollments.class_time seja text (não time)
-- Se já for text, o cast não faz nada. Se for time, converte.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.enrollments
    alter column class_time type text
    using to_char(class_time::time, 'HH24:MI');

-- Corrigir dados existentes que tenham segundos (ex: '15:00:00' → '15:00')
update public.enrollments
set class_time = substring(class_time from 1 for 5)
where class_time ~ '^\d{2}:\d{2}:\d{2}$';

-- ─────────────────────────────────────────────────────────────────────────
-- PROBLEMA #4: Normalizar lessons.start_time e end_time para texto sem segundos
-- ─────────────────────────────────────────────────────────────────────────
alter table public.lessons
    alter column start_time type text
    using to_char(start_time::time, 'HH24:MI');

alter table public.lessons
    alter column end_time type text
    using to_char(end_time::time, 'HH24:MI');

-- Corrigir dados existentes com segundos
update public.lessons
set start_time = substring(start_time from 1 for 5)
where start_time ~ '^\d{2}:\d{2}:\d{2}$';

update public.lessons
set end_time = substring(end_time from 1 for 5)
where end_time ~ '^\d{2}:\d{2}:\d{2}$';

-- ─────────────────────────────────────────────────────────────────────────
-- PROBLEMA #5+7: Normalizar tuitions.reference_month
-- Verifica o tipo real da coluna no banco e age conforme:
-- - Se já for date: só normaliza para primeiro dia do mês (date_trunc)
-- - Se for text: converte 'YYYY-MM' ou 'YYYY-MM-DD' para date, depois altera o tipo
-- ─────────────────────────────────────────────────────────────────────────
do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'tuitions'
        and column_name = 'reference_month' and data_type = 'date'
    ) then
        -- Já é date — só normalizar para o primeiro dia do mês
        update public.tuitions
        set reference_month = date_trunc('month', reference_month)::date
        where reference_month is not null
          and reference_month != date_trunc('month', reference_month)::date;
    else
        -- É text — truncar 'YYYY-MM-DD' para 'YYYY-MM' e converter para date
        update public.tuitions
        set reference_month = left(reference_month::text, 7)
        where reference_month::text ~ '^\d{4}-\d{2}-\d{2}$';

        alter table public.tuitions
            alter column reference_month type date
            using (case
                when reference_month::text ~ '^\d{4}-\d{2}$'       then (reference_month || '-01')::date
                when reference_month::text ~ '^\d{4}-\d{2}-\d{2}$' then reference_month::date
                else null
            end);
    end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- PROBLEMA #8: expense_type CHECK — adicionar 'variable' ao check
-- (o frontend React usa 'variable', o banco só aceitava 'eventual')
-- Mantemos 'eventual' por compatibilidade com dados existentes.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.expenses drop constraint if exists expenses_type_check;
alter table public.expenses
    add constraint expenses_type_check
    check (expense_type in ('fixed', 'eventual', 'variable'));

-- ─────────────────────────────────────────────────────────────────────────
-- OBSERVAÇÃO #9: RLS — policy mínima de deny para anon (preventiva)
-- Protege caso o Data API exponha anon key no futuro.
-- Aplica nas tabelas do domínio acadêmico/financeiro.
-- Usa drop + create (if not exists não é suportado nesta versão do CLI).
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare
    t text;
begin
    foreach t in array array[
        'students','teachers','enrollments','tuitions','payments',
        'expenses','investments','lessons','attendance','teacher_payments'
    ] loop
        execute format('drop policy if exists "deny_anon_%s" on public.%I', t, t);
        execute format(
            'create policy "deny_anon_%s" on public.%I for all to anon using (false)',
            t, t
        );
    end loop;
end $$;
