-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 058 — Extensão pg_trgm para busca textual aproximada
-- ═══════════════════════════════════════════════════════════════════════════
-- A extensão pg_trgm permite o uso de gin_trgm_ops em índices GIN,
-- otimizando consultas ILIKE em students.name (busca textual aproximada).
-- Idempotente: pode rodar múltiplas vezes.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pg_trgm with schema extensions;
