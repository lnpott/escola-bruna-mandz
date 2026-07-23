-- ═══════════════════════════════════════════════════════════════════════════
-- Schema Supabase — Loja Oficial Bruna Mandz
-- 
-- Funcional: cole no SQL Editor do Supabase e execute.
-- Pode rodar múltiplas vezes (usa IF NOT EXISTS / CREATE OR REPLACE).
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNÇÕES COMPARTILHADAS (definidas uma única vez)
-- ═══════════════════════════════════════════════════════════════════════════

-- Função genérica para atualizar updated_at automaticamente.
-- search_path = '' (vazio) previne search-path hijacking (segurança).
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

-- Revoga EXECUTE de roles anônimas/autenticadas — função só deve ser chamada
-- internamente por triggers, não diretamente pela API.
-- A skill Supabase adverte: "SECURITY DEFINER functions in public are callable
-- by all roles" — mesmo com SECURITY INVOKER, é boa prática restringir.
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- TABELA: orders (pedidos da loja)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.orders (
    id text primary key,                    -- BM-XXXXXXXX-XXXX (gerado no front)
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    -- Valores restritos via CHECK para integridade dos dados
    status text not null default 'pending'
        constraint orders_status_check
        check (status in ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
    method text not null
        constraint orders_method_check
        check (method in ('pix', 'card', 'manual')),

    customer_name text,
    customer_email text,
    customer_phone text,
    items jsonb not null,                  -- snapshot do carrinho no momento da compra
    total numeric(10,2) not null,
    mp_payment_id text,                    -- ID do pagamento no Mercado Pago
    mp_status text,                        -- status bruto retornado pelo Mercado Pago
    mp_status_detail text,
    earned_xp integer not null default 0,
    customer_is_student boolean not null default false
);

-- ── Índices ────────────────────────────────────────────────────────────────────

-- Índice composto para o painel admin: filtrar por status + ordenar por data.
-- Cobre o caso de uso mais comum: "pedidos pendentes, mais recentes primeiro".
create index if not exists orders_status_created_idx
    on public.orders (status, created_at desc);

-- Índice simples em created_at para consultas que não filtram por status
-- (ex: KPI "receita do mês" que soma todos os pedidos aprovados).
create index if not exists orders_created_at_idx
    on public.orders (created_at desc);

-- Índice parcial: só cria entrada para pedidos que têm mp_payment_id.
-- Economiza espaço no índice (~20% dos pedidos têm mp_payment_id).
create index if not exists orders_mp_payment_id_idx
    on public.orders (mp_payment_id)
    where mp_payment_id is not null;

-- ── Trigger de updated_at ──────────────────────────────────────────────────────

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
    before update on public.orders
    for each row
    execute function public.set_updated_at();

-- ── Segurança (RLS) ────────────────────────────────────────────────────────────
-- RLS habilitado, mas SEM policies.
-- Intencional: todo acesso é via Service Role Key (backend Vercel),
-- que bypassa RLS. O navegador do cliente nunca acessa esta tabela.
alter table public.orders enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════
-- TABELA: products (catálogo de produtos da loja)
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.products (
    id text primary key,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    name text not null,
    description text,
    price numeric(10,2) not null default 0,
    stock integer not null default 0,
    active boolean not null default true,
    category text not null default 'acessorios'
        constraint products_category_check
        check (category in ('roupas', 'acessorios', 'kits')),
    badge text,
    badge_color text,
    image text,
    variants jsonb not null default '[]'::jsonb
);

-- ── Índices ────────────────────────────────────────────────────────────────────

-- Índice parcial para a query pública: "produtos ativos, ordenados por data".
-- WHERE active = true reduz o tamanho do índice (produtos inativos são raros).
create index if not exists products_active_created_idx
    on public.products (active, created_at)
    where active = true;

-- Índice para filtrar por categoria + ativo (uso no front-end tabs).
create index if not exists products_category_active_idx
    on public.products (category, active);

-- Índice parcial para a consulta de estoque baixo no dashboard:
-- "produtos ativos com stock <= 5". Apenas produtos ativos entram no índice.
create index if not exists products_low_stock_idx
    on public.products (stock)
    where active = true;

-- ── Trigger de updated_at ──────────────────────────────────────────────────────

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
    before update on public.products
    for each row
    execute function public.set_updated_at();

-- ── Segurança (RLS) ────────────────────────────────────────────────────────────
-- Mesmo padrão da tabela orders: acesso exclusivo via Service Role Key.
alter table public.products enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS: Deny policies para role anon (defense-in-depth)
-- ═══════════════════════════════════════════════════════════════════════════
-- Abrange orders e products.
-- Idempotente: pode rodar múltiplas vezes.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
    t text;
begin
    foreach t in array array['orders', 'products'] loop
        execute format('drop policy if exists "deny_anon_%s" on public.%I', t, t);
        execute format(
            'create policy "deny_anon_%s" on public.%I for all to anon using (false)',
            t, t
        );
    end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Storage: Bucket de Imagens de Produtos
-- ═══════════════════════════════════════════════════════════════════════════
-- Criação manual no painel do Supabase:
--   1. Storage > Create bucket > Nome: product-images, Make it public
--   2. Depois cole no SQL Editor:
--
-- insert into storage.buckets (id, name, public)
-- values ('product-images', 'product-images', true)
-- on conflict do nothing;
--
-- create policy "public read images"
-- on storage.objects for select
-- using (bucket_id = 'product-images');
--
-- create policy "admin upload images"
-- on storage.objects for insert
-- with check (bucket_id = 'product-images');
--
-- create policy "admin delete images"
-- on storage.objects for delete
-- using (bucket_id = 'product-images');
