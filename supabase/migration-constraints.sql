-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRAÇÃO: CHECK Constraints
-- Escola Bruna Mandz
-- ═══════════════════════════════════════════════════════════════════════════
-- Adiciona CHECK constraints com DO blocks para:
-- 1. Validar dados existentes antes de aplicar
-- 2. Corrigir dados inválidos automaticamente
-- 3. Só criar a constraint se não existir
-- ═══════════════════════════════════════════════════════════════════════════

-- orders.status
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'orders_status_check' 
        and conrelid = 'public.orders'::regclass
    ) then
        if exists (
            select 1 from public.orders 
            where status is not null 
            and status not in ('pending', 'approved', 'rejected', 'cancelled', 'refunded')
        ) then
            raise warning 'orders_status_check: corrigindo dados inválidos...';
            update public.orders set status = 'pending' 
            where status not in ('pending', 'approved', 'rejected', 'cancelled', 'refunded');
        end if;
        alter table public.orders add constraint orders_status_check 
            check (status in ('pending', 'approved', 'rejected', 'cancelled', 'refunded'));
    end if;
end;
$$;

-- orders.method
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'orders_method_check' 
        and conrelid = 'public.orders'::regclass
    ) then
        if exists (
            select 1 from public.orders 
            where method is not null 
            and method not in ('pix', 'card', 'manual')
        ) then
            update public.orders set method = 'manual' 
            where method not in ('pix', 'card', 'manual');
        end if;
        alter table public.orders add constraint orders_method_check 
            check (method in ('pix', 'card', 'manual'));
    end if;
end;
$$;

-- products.category
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'products_category_check' 
        and conrelid = 'public.products'::regclass
    ) then
        if exists (
            select 1 from public.products 
            where category is not null 
            and category not in ('roupas', 'acessorios', 'kits')
        ) then
            update public.products set category = 'acessorios' 
            where category not in ('roupas', 'acessorios', 'kits');
        end if;
        alter table public.products add constraint products_category_check 
            check (category in ('roupas', 'acessorios', 'kits'));
    end if;
end;
$$;

-- tuitions.status
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'tuitions_status_check' 
        and conrelid = 'public.tuitions'::regclass
    ) then
        if exists (
            select 1 from public.tuitions 
            where status is not null 
            and status not in ('pending', 'paid', 'overdue', 'cancelled')
        ) then
            update public.tuitions set status = 'pending' 
            where status not in ('pending', 'paid', 'overdue', 'cancelled');
        end if;
        alter table public.tuitions add constraint tuitions_status_check 
            check (status in ('pending', 'paid', 'overdue', 'cancelled'));
    end if;
end;
$$;

-- tuitions.payment_method
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'tuitions_payment_method_check' 
        and conrelid = 'public.tuitions'::regclass
    ) then
        if exists (
            select 1 from public.tuitions 
            where payment_method is not null 
            and payment_method not in ('pix', 'card', 'money', 'other')
        ) then
            update public.tuitions set payment_method = 'other' 
            where payment_method not in ('pix', 'card', 'money', 'other');
        end if;
        alter table public.tuitions add constraint tuitions_payment_method_check 
            check (payment_method in ('pix', 'card', 'money', 'other'));
    end if;
end;
$$;

-- payments.payment_method
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'payments_payment_method_check' 
        and conrelid = 'public.payments'::regclass
    ) then
        if exists (
            select 1 from public.payments 
            where payment_method is not null 
            and payment_method not in ('pix', 'card', 'money', 'other')
        ) then
            update public.payments set payment_method = 'other' 
            where payment_method not in ('pix', 'card', 'money', 'other');
        end if;
        alter table public.payments add constraint payments_payment_method_check 
            check (payment_method in ('pix', 'card', 'money', 'other'));
    end if;
end;
$$;

-- payments.category
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'payments_category_check' 
        and conrelid = 'public.payments'::regclass
    ) then
        if exists (
            select 1 from public.payments 
            where category is not null 
            and category not in ('matricula', 'material', 'aula_extra', 'outro')
        ) then
            update public.payments set category = 'outro' 
            where category not in ('matricula', 'material', 'aula_extra', 'outro');
        end if;
        alter table public.payments add constraint payments_category_check 
            check (category in ('matricula', 'material', 'aula_extra', 'outro'));
    end if;
end;
$$;

-- expenses.category
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'expenses_category_check' 
        and conrelid = 'public.expenses'::regclass
    ) then
        if exists (
            select 1 from public.expenses 
            where category is not null 
            and category not in ('aluguel', 'agua', 'luz', 'material', 'outro')
        ) then
            update public.expenses set category = 'outro' 
            where category not in ('aluguel', 'agua', 'luz', 'material', 'outro');
        end if;
        alter table public.expenses add constraint expenses_category_check 
            check (category in ('aluguel', 'agua', 'luz', 'material', 'outro'));
    end if;
end;
$$;

-- expenses.expense_type
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'expenses_type_check' 
        and conrelid = 'public.expenses'::regclass
    ) then
        if exists (
            select 1 from public.expenses 
            where expense_type is not null 
            and expense_type not in ('fixed', 'eventual')
        ) then
            update public.expenses set expense_type = 'fixed' 
            where expense_type not in ('fixed', 'eventual');
        end if;
        alter table public.expenses add constraint expenses_type_check 
            check (expense_type in ('fixed', 'eventual'));
    end if;
end;
$$;

-- investments.category
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'investments_category_check' 
        and conrelid = 'public.investments'::regclass
    ) then
        if exists (
            select 1 from public.investments 
            where category is not null 
            and category not in ('instrumento', 'movel', 'equipamento', 'outro')
        ) then
            update public.investments set category = 'outro' 
            where category not in ('instrumento', 'movel', 'equipamento', 'outro');
        end if;
        alter table public.investments add constraint investments_category_check 
            check (category in ('instrumento', 'movel', 'equipamento', 'outro'));
    end if;
end;
$$;

-- enrollments.status
do $$
begin
    if not exists (
        select 1 from pg_constraint 
        where conname = 'enrollments_status_check' 
        and conrelid = 'public.enrollments'::regclass
    ) then
        if exists (
            select 1 from public.enrollments 
            where status is not null 
            and status not in ('active', 'inactive', 'cancelled')
        ) then
            update public.enrollments set status = 'active' 
            where status not in ('active', 'inactive', 'cancelled');
        end if;
        alter table public.enrollments add constraint enrollments_status_check 
            check (status in ('active', 'inactive', 'cancelled'));
    end if;
end;
$$;
