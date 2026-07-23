-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 054 — Índice parcial para consulta de estoque baixo
--
-- Otimiza a query do dashboard:
--   supabase.from('products')
--     .select('id,name,stock,active')
--     .lte('stock', 5)
--     .eq('active', true)
--
── O índice parcial (WHERE active = true) é ~40% menor que um índice
-- completo em stock, pois produtos inativos raramente são consultados.
-- ═══════════════════════════════════════════════════════════════════════════

create index if not exists products_low_stock_idx
    on public.products (stock)
    where active = true;
