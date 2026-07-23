-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 055 — Limpa máscaras de CPF/telefone legados
--
-- Remove todos os caracteres não-dígitos dos campos de CPF e telefone
-- que foram armazenados com formatação (ex: "123.456.789-00" → "12345678900",
-- "(21) 99999-0001" → "21999990001").
--
-- Pode rodar múltiplas vezes (idempotente — regexp_replace em texto puro
-- não altera valores que já são só dígitos).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── students: cpf, phone, guardian_cpf, guardian_phone ────────────────

update public.students
set
    cpf = regexp_replace(cpf, '\D', '', 'g'),
    phone = regexp_replace(phone, '\D', '', 'g'),
    guardian_cpf = regexp_replace(guardian_cpf, '\D', '', 'g'),
    guardian_phone = regexp_replace(guardian_phone, '\D', '', 'g')
where
    cpf ~ '\D' or phone ~ '\D' or guardian_cpf ~ '\D' or guardian_phone ~ '\D';

-- ── teachers: cpf, phone ──────────────────────────────────────────────

update public.teachers
set
    cpf = regexp_replace(cpf, '\D', '', 'g'),
    phone = regexp_replace(phone, '\D', '', 'g')
where
    cpf ~ '\D' or phone ~ '\D';

-- ── orders: customer_phone ────────────────────────────────────────────

update public.orders
set customer_phone = regexp_replace(customer_phone, '\D', '', 'g')
where customer_phone ~ '\D';

-- ═══════════════════════════════════════════════════════════════════════════
-- Relatório de linhas afetadas
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
    s_count bigint;
    t_count bigint;
    o_count bigint;
begin
    select count(*) into s_count from public.students
        where cpf ~ '^\d{11}$' or phone ~ '^\d{10,11}$' or guardian_cpf ~ '^\d{11}$' or guardian_phone ~ '^\d{10,11}$';

    select count(*) into t_count from public.teachers
        where cpf ~ '^\d{11}$' or phone ~ '^\d{10,11}$';

    select count(*) into o_count from public.orders
        where customer_phone ~ '^\d{10,11}$';

    raise notice 'Migration 055 — Limpeza de máscaras concluída. Estudantes com dados limpos: %; Professores: %; Pedidos: %',
        s_count, t_count, o_count;
end $$;
