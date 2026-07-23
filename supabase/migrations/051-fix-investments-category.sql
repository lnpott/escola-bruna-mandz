-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 051 — Fix investments.category CHECK constraint
-- ═══════════════════════════════════════════════════════════════════════════
-- Problema: O CHECK constraint investments_category_check só permitia
-- ('instrumento', 'movel', 'equipamento', 'outro'), mas o frontend
-- (app/src/pages/Financial.tsx) envia 'infraestrutura' e 'marketing'.
-- Isso causava erro 400 ao tentar criar investimentos nessas categorias.
--
-- Solução: Adicionar 'infraestrutura' e 'marketing' à lista de categorias
-- válidas, alinhando o schema com o frontend.
-- ═══════════════════════════════════════════════════════════════════════════

-- Remove constraint antiga e recria com categorias atualizadas
alter table public.investments drop constraint if exists investments_category_check;
alter table public.investments
    add constraint investments_category_check
    check (category in ('instrumento', 'movel', 'equipamento', 'infraestrutura', 'marketing', 'outro'));
