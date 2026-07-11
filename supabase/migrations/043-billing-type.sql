-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 043 — Adiciona billing_type (tipo de cobrança)
--
-- Modelo de cobrança misto:
--   weekly  = por semana (ex: R$ 50/aula, 4 aulas por mês)
--   monthly = mensal (comportamento anterior)
--   full    = completo/à vista (ex: R$ 2.400 o curso)
--
-- ═══════════════════════════════════════════════════════════════════════════

-- ── enrollments ─────────────────────────────────────────────────────────────

alter table public.enrollments
    add column if not exists billing_type text not null default 'monthly'
    constraint enrollments_billing_type_check
    check (billing_type in ('weekly', 'monthly', 'full'));

alter table public.enrollments
    add column if not exists total_amount numeric(10,2);  -- para 'full', valor total do curso

alter table public.enrollments
    add column if not exists installments integer default 1;  -- para 'full' parcelado, nº de parcelas

-- ── tuitions ────────────────────────────────────────────────────────────────

alter table public.tuitions
    add column if not exists billing_type text
    constraint tuitions_billing_type_check
    check (billing_type in ('weekly', 'monthly', 'full'));

alter table public.tuitions
    add column if not exists installment_number integer;  -- para 'full' parcelado, número da parcela atual
