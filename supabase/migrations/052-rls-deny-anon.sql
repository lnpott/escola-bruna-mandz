-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 052 — RLS Deny Policies para role anon (defense-in-depth)
-- ═══════════════════════════════════════════════════════════════════════════
-- Contexto: todas as tabelas têm RLS habilitado mas NENHUMA policy ativa.
-- O backend acessa tudo via SUPABASE_SERVICE_ROLE_KEY (bypassa RLS).
-- O frontend nunca fala diretamente com o Supabase Data API.
--
-- Por que adicionar deny policies mesmo assim?
--   Defense-in-depth: se a anon key for exposta (ex: vazar no frontend,
--   config errada, auditoria de segurança), essas policies impedem que
--   qualquer role anon leia/grave dados das tabelas internas.
--
-- Escopo: 12 tabelas (store + acadêmico/financeiro)
--
-- Idempotente: drop + create. Pode rodar múltiplas vezes.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
    t text;
begin
    foreach t in array array[
        'students', 'teachers', 'enrollments', 'tuitions', 'payments',
        'expenses', 'investments', 'lessons', 'attendance', 'teacher_payments',
        'orders', 'products'
    ] loop
        -- Remove policy antiga se existir (migration anterior ou execução prévia)
        execute format('drop policy if exists "deny_anon_%s" on public.%I', t, t);

        -- Cria deny policy: role anon NÃO pode fazer nada nesta tabela
        execute format(
            'create policy "deny_anon_%s" on public.%I for all to anon using (false)',
            t, t
        );
    end loop;
end $$;
