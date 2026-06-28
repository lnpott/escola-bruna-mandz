-- ═══════════════════════════════════════════════════════════════════════════
-- Schema Supabase — Loja Oficial Bruna Mandz
-- Cole este arquivo inteiro no SQL Editor do Supabase (Project > SQL Editor > New query)
-- e clique em "Run". Pode rodar de novo sem problema (usa IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.orders (
    id text primary key,                 -- mesmo ID gerado no front (ex: BM-123456)
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    status text not null default 'pending',
        -- valores possíveis: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded'
    method text not null,                -- 'pix' | 'card'
    customer_name text,
    customer_email text,
    customer_phone text,
    items jsonb not null,                -- snapshot do carrinho no momento da compra
    total numeric(10,2) not null,
    mp_payment_id text,                  -- ID do pagamento no Mercado Pago (preenchido após criar)
    mp_status text,                      -- status bruto retornado pelo Mercado Pago
    mp_status_detail text,
    earned_xp integer default 0
);

-- Índices úteis para o painel admin (listar por data, filtrar por status)
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_mp_payment_id_idx on public.orders (mp_payment_id);

-- Atualiza updated_at automaticamente a cada alteração
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
    before update on public.orders
    for each row
    execute function public.set_updated_at();

-- ─── Segurança (RLS) ──────────────────────────────────────────────────────────
-- Habilitamos RLS e NÃO criamos política pública de leitura/escrita.
-- Isso significa: só quem usar a Service Role Key (nosso backend na Vercel)
-- consegue ler/escrever. O navegador do cliente NUNCA acessa essa tabela direto.
alter table public.orders enable row level security;
