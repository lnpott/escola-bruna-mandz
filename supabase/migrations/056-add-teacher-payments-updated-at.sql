-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 056 — Adiciona updated_at em teacher_payments
--
-- Contexto: todas as tabelas do schema acadêmico/financeiro têm
-- updated_at + trigger set_updated_at, EXCETO teacher_payments.
-- O endpoint PATCH /api/admin-financial?resource=teacher_payments existe
-- e pode modificar registros, mas sem updated_at não há rastro da
-- última alteração.
--
-- Idempotente: pode rodar múltiplas vezes.
-- ═══════════════════════════════════════════════════════════════════════════

-- Adiciona coluna updated_at (se não existir)
alter table public.teacher_payments
    add column if not exists updated_at timestamptz not null default now();

-- Seta updated_at = created_at para registros existentes (migração única)
update public.teacher_payments
    set updated_at = created_at
    where updated_at is null;

-- Cria o trigger (drop first para garantir idempotência)
drop trigger if exists teacher_payments_set_updated_at on public.teacher_payments;
create trigger teacher_payments_set_updated_at
    before update on public.teacher_payments
    for each row
    execute function public.set_updated_at();
