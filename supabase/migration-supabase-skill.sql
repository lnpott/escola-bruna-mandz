-- ══════════════════════════════════════════════════════════════════════════
-- Migration: Supabase Skill — Security fixes
-- ══════════════════════════════════════════════════════════════════════════
-- 1. set_updated_at(): SECURITY DEFINER → SECURITY INVOKER
-- 2. REVOKE EXECUTE da função para anon/authenticated
-- 3. RLS policies explícitas (TO authenticated) nas tabelas financeiras
-- ══════════════════════════════════════════════════════════════════════════

-- 1. Função set_updated_at — SECURITY INVOKER + revogar EXECUTE
create or replace function public.set_updated_at()
returns trigger
security invoker
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- 2. RLS policies — TO authenticated (skill: auth.role() is deprecated)
-- Usa DROP + CREATE em vez de IF NOT EXISTS (compatível com PG < 15).

drop policy if exists "admin manage students" on public.students;
create policy "admin manage students"
    on public.students for all
    to authenticated
    using (true)
    with check (true);

drop policy if exists "admin manage teachers" on public.teachers;
create policy "admin manage teachers"
    on public.teachers for all
    to authenticated
    using (true)
    with check (true);

drop policy if exists "admin manage enrollments" on public.enrollments;
create policy "admin manage enrollments"
    on public.enrollments for all
    to authenticated
    using (true)
    with check (true);

drop policy if exists "admin manage tuitions" on public.tuitions;
create policy "admin manage tuitions"
    on public.tuitions for all
    to authenticated
    using (true)
    with check (true);

drop policy if exists "admin manage payments" on public.payments;
create policy "admin manage payments"
    on public.payments for all
    to authenticated
    using (true)
    with check (true);

drop policy if exists "admin manage expenses" on public.expenses;
create policy "admin manage expenses"
    on public.expenses for all
    to authenticated
    using (true)
    with check (true);

drop policy if exists "admin manage investments" on public.investments;
create policy "admin manage investments"
    on public.investments for all
    to authenticated
    using (true)
    with check (true);

drop policy if exists "admin manage teacher_payments" on public.teacher_payments;
create policy "admin manage teacher_payments"
    on public.teacher_payments for all
    to authenticated
    using (true)
    with check (true);

-- 3. RLS policies para orders e products (consistência)
drop policy if exists "admin manage orders" on public.orders;
create policy "admin manage orders"
    on public.orders for all
    to authenticated
    using (true)
    with check (true);

drop policy if exists "admin manage products" on public.products;
create policy "admin manage products"
    on public.products for all
    to authenticated
    using (true)
    with check (true);
