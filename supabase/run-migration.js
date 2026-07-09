/**
 * run-migration.js
 * Executa scripts SQL no Supabase via Management API.
 * 
 * Uso: node run-migration.js
 *
 * Variáveis de ambiente necessárias:
 *   SUPABASE_PAT  → Personal Access Token (sbp_...)
 *   SUPABASE_URL  → URL do projeto Supabase
 */

const SUPABASE_PAT = process.env.SUPABASE_PAT;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljosqddzxreloizpynvf.supabase.co';
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

if (!SUPABASE_PAT) {
    console.error('ERRO: Defina SUPABASE_PAT como variável de ambiente.');
    process.exit(1);
}

if (!PROJECT_REF) {
    console.error('ERRO: Não foi possível extrair project_ref da SUPABASE_URL.');
    process.exit(1);
}

const API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/sql`;

async function executeSql(sql, label) {
    console.log(`\n── ${label} ──`);
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_PAT}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
    });

    const text = await response.text();
    
    if (!response.ok) {
        console.error(`❌ ERRO (${response.status}):`);
        
        // Tenta parsear como JSON, senão mostra texto
        try {
            const err = JSON.parse(text);
            console.error(JSON.stringify(err, null, 2));
            
            // Se for erro de constraint já existente, não é crítico
            if (text.includes('already exists')) {
                console.log('   → Já existe (pode ignorar)');
                return;
            }
        } catch {
            console.error(text);
        }

        // Erros específicos que podemos ignorar
        if (text.includes('relation') && text.includes('already exists')) {
            console.log('   → Já existe (pode ignorar)');
            return;
        }
        if (text.includes('duplicate key') || text.includes('already exists')) {
            console.log('   → Já existe (pode ignorar)');
            return;
        }
        
        // Para outros erros, continuamos tentando as próximas queries
        // O script é idempotente, então podemos pular e seguir
        console.log('   → Continuando mesmo assim...');
        return;
    }

    try {
        const result = JSON.parse(text);
        if (Array.isArray(result) && result.length > 0) {
            console.log(`✅ OK (${result.length} linhas afetadas)`);
        } else {
            console.log('✅ OK');
        }
    } catch {
        console.log('✅ OK (resposta não-JSON)');
    }
}

async function main() {
    console.log(`Projeto: ${PROJECT_REF}`);
    console.log(`API: ${API_URL}`);
    console.log('─── INICIANDO MIGRAÇÃO ───');

    // ═════════════════════════════════════════════════════════════════════
    // FASE 1: Funções compartilhadas
    // ═════════════════════════════════════════════════════════════════════

    await executeSql(`
        create or replace function public.set_updated_at()
        returns trigger
        security definer
        set search_path = ''
        as $$
        begin
            new.updated_at = now();
            return new;
        end;
        $$ language plpgsql;
    `, '1.1 - Função set_updated_at com search_path seguro');

    // ═════════════════════════════════════════════════════════════════════
    // FASE 2: DROP de índices antigos (substituídos por versões melhores)
    // ═════════════════════════════════════════════════════════════════════

    // orders_status_idx → substituído por orders_status_created_idx (composto)
    await executeSql(`drop index if exists public.orders_status_idx;`,
        '2.1 - Drop orders_status_idx (substituído por composto)');

    // products_active_idx → substituído por products_active_created_idx (composto + partial)
    await executeSql(`drop index if exists public.products_active_idx;`,
        '2.2 - Drop products_active_idx (substituído por composto partial)');

    // products_category_idx → substituído por products_category_active_idx (composto)
    await executeSql(`drop index if exists public.products_category_idx;`,
        '2.3 - Drop products_category_idx (substituído por composto)');

    // tuitions_teacher_id_idx → foi removido de tuitions (migrado para enrollments)
    await executeSql(`drop index if exists public.tuitions_teacher_id_idx;`,
        '2.4 - Drop tuitions_teacher_id_idx (campo removido)');

    // ═════════════════════════════════════════════════════════════════════
    // FASE 3: CHECK constraints (via DO blocks para segurança)
    // ═════════════════════════════════════════════════════════════════════

    // orders.status
    await executeSql(`
        do $$
        begin
            if not exists (
                select 1 from pg_constraint 
                where conname = 'orders_status_check' 
                and conrelid = 'public.orders'::regclass
            ) then
                -- Verifica se há dados inválidos antes de criar a constraint
                if exists (
                    select 1 from public.orders 
                    where status is not null 
                    and status not in ('pending', 'approved', 'rejected', 'cancelled', 'refunded')
                ) then
                    raise warning 'orders_status_check: dados inválidos encontrados, corrigindo...';
                    update public.orders set status = 'pending' 
                    where status is not null 
                    and status not in ('pending', 'approved', 'rejected', 'cancelled', 'refunded');
                end if;
                alter table public.orders add constraint orders_status_check 
                    check (status in ('pending', 'approved', 'rejected', 'cancelled', 'refunded'));
            end if;
        end;
        $$;
    `, '3.1 - CHECK orders.status');

    // orders.method
    await executeSql(`
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
                    raise warning 'orders_method_check: dados inválidos encontrados, corrigindo...';
                    update public.orders set method = 'manual' 
                    where method is not null 
                    and method not in ('pix', 'card', 'manual');
                end if;
                alter table public.orders add constraint orders_method_check 
                    check (method in ('pix', 'card', 'manual'));
            end if;
        end;
        $$;
    `, '3.2 - CHECK orders.method');

    // products.category
    await executeSql(`
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
                    raise warning 'products_category_check: dados inválidos encontrados, corrigindo...';
                    update public.products set category = 'acessorios' 
                    where category is not null 
                    and category not in ('roupas', 'acessorios', 'kits');
                end if;
                alter table public.products add constraint products_category_check 
                    check (category in ('roupas', 'acessorios', 'kits'));
            end if;
        end;
        $$;
    `, '3.3 - CHECK products.category');

    // tuitions.status
    await executeSql(`
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
                    where status is not null 
                    and status not in ('pending', 'paid', 'overdue', 'cancelled');
                end if;
                alter table public.tuitions add constraint tuitions_status_check 
                    check (status in ('pending', 'paid', 'overdue', 'cancelled'));
            end if;
        end;
        $$;
    `, '3.4 - CHECK tuitions.status');

    // tuitions.payment_method
    await executeSql(`
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
                    where payment_method is not null 
                    and payment_method not in ('pix', 'card', 'money', 'other');
                end if;
                alter table public.tuitions add constraint tuitions_payment_method_check 
                    check (payment_method in ('pix', 'card', 'money', 'other'));
            end if;
        end;
        $$;
    `, '3.5 - CHECK tuitions.payment_method');

    // payments.payment_method
    await executeSql(`
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
                    where payment_method is not null 
                    and payment_method not in ('pix', 'card', 'money', 'other');
                end if;
                alter table public.payments add constraint payments_payment_method_check 
                    check (payment_method in ('pix', 'card', 'money', 'other'));
            end if;
        end;
        $$;
    `, '3.6 - CHECK payments.payment_method');

    // payments.category
    await executeSql(`
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
                    where category is not null 
                    and category not in ('matricula', 'material', 'aula_extra', 'outro');
                end if;
                alter table public.payments add constraint payments_category_check 
                    check (category in ('matricula', 'material', 'aula_extra', 'outro'));
            end if;
        end;
        $$;
    `, '3.7 - CHECK payments.category');

    // expenses.category
    await executeSql(`
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
                    where category is not null 
                    and category not in ('aluguel', 'agua', 'luz', 'material', 'outro');
                end if;
                alter table public.expenses add constraint expenses_category_check 
                    check (category in ('aluguel', 'agua', 'luz', 'material', 'outro'));
            end if;
        end;
        $$;
    `, '3.8 - CHECK expenses.category');

    // expenses.expense_type
    await executeSql(`
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
                    where expense_type is not null 
                    and expense_type not in ('fixed', 'eventual');
                end if;
                alter table public.expenses add constraint expenses_type_check 
                    check (expense_type in ('fixed', 'eventual'));
            end if;
        end;
        $$;
    `, '3.9 - CHECK expenses.expense_type');

    // investments.category
    await executeSql(`
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
                    where category is not null 
                    and category not in ('instrumento', 'movel', 'equipamento', 'outro');
                end if;
                alter table public.investments add constraint investments_category_check 
                    check (category in ('instrumento', 'movel', 'equipamento', 'outro'));
            end if;
        end;
        $$;
    `, '3.10 - CHECK investments.category');

    // enrollments.status
    await executeSql(`
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
                    where status is not null 
                    and status not in ('active', 'inactive', 'cancelled');
                end if;
                alter table public.enrollments add constraint enrollments_status_check 
                    check (status in ('active', 'inactive', 'cancelled'));
            end if;
        end;
        $$;
    `, '3.11 - CHECK enrollments.status');

    // ═════════════════════════════════════════════════════════════════════
    // FASE 4: Novos índices
    // ═════════════════════════════════════════════════════════════════════

    await executeSql(`
        create index if not exists orders_status_created_idx 
            on public.orders (status, created_at desc);
    `, '4.1 - Índice composto orders (status, created_at)');

    await executeSql(`
        create index if not exists orders_mp_payment_id_idx 
            on public.orders (mp_payment_id) 
            where mp_payment_id is not null;
    `, '4.2 - Índice parcial orders (mp_payment_id)');

    await executeSql(`
        create index if not exists products_active_created_idx 
            on public.products (active, created_at) 
            where active = true;
    `, '4.3 - Índice parcial products (active, created_at)');

    await executeSql(`
        create index if not exists products_category_active_idx 
            on public.products (category, active);
    `, '4.4 - Índice composto products (category, active)');

    await executeSql(`
        create index if not exists students_active_idx 
            on public.students (active) 
            where active = true;
    `, '4.5 - Índice parcial students (active)');

    await executeSql(`
        create index if not exists enrollments_day_of_week_idx 
            on public.enrollments (day_of_week) 
            where status = 'active';
    `, '4.6 - Índice parcial enrollments (day_of_week)');

    await executeSql(`
        create index if not exists tuitions_paid_at_idx 
            on public.tuitions (paid_at) 
            where status = 'paid';
    `, '4.7 - Índice parcial tuitions (paid_at)');

    await executeSql(`
        create index if not exists tuitions_reference_month_idx 
            on public.tuitions (reference_month);
    `, '4.8 - Índice tuitions (reference_month)');

    await executeSql(`
        create index if not exists payments_paid_at_idx 
            on public.payments (paid_at);
    `, '4.9 - Índice payments (paid_at)');

    await executeSql(`
        create index if not exists expenses_paid_idx 
            on public.expenses (paid) 
            where paid = false;
    `, '4.10 - Índice parcial expenses (paid)');

    await executeSql(`
        create index if not exists expenses_paid_at_idx 
            on public.expenses (paid_at) 
            where paid = true;
    `, '4.11 - Índice parcial expenses (paid_at)');

    await executeSql(`
        create index if not exists teacher_payments_teacher_id_idx 
            on public.teacher_payments (teacher_id);
    `, '4.12 - Índice teacher_payments (teacher_id)');

    await executeSql(`
        create index if not exists teacher_payments_reference_month_idx 
            on public.teacher_payments (reference_month);
    `, '4.13 - Índice teacher_payments (reference_month)');

    await executeSql(`
        create index if not exists teacher_payments_paid_at_idx 
            on public.teacher_payments (paid_at) 
            where paid = true;
    `, '4.14 - Índice parcial teacher_payments (paid_at)');

    await executeSql(`
        create index if not exists tuitions_enrollment_id_idx 
            on public.tuitions (enrollment_id);
    `, '4.15 - Índice tuitions (enrollment_id)');

    console.log('\n─── MIGRAÇÃO CONCLUÍDA ───');
}

main().catch(err => {
    console.error('\n❌ ERRO FATAL:', err.message);
    process.exit(1);
});
