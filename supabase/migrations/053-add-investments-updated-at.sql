-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 053 — Adiciona updated_at + trigger em investments
-- ═══════════════════════════════════════════════════════════════════════════
-- Contexto: investments ganhou suporte a PATCH na correção de jul/2026
-- (antes era apenas insert-only, sem updated_at). Agora que pode ser
-- atualizado via API, precisa de updated_at automático como as demais
-- tabelas com trigger set_updated_at.
-- ═══════════════════════════════════════════════════════════════════════════

-- Adiciona coluna updated_at (nullable inicialmente para backfill)
alter table public.investments
    add column if not exists updated_at timestamptz;

-- Backfill: registros existentes ganham updated_at = created_at
update public.investments
    set updated_at = created_at
    where updated_at is null;

-- Torna NOT NULL após o backfill
alter table public.investments
    alter column updated_at set not null,
    alter column updated_at set default now();

-- Cria o trigger de updated_at automático
drop trigger if exists investments_set_updated_at on public.investments;
create trigger investments_set_updated_at
    before update on public.investments
    for each row
    execute function public.set_updated_at();
