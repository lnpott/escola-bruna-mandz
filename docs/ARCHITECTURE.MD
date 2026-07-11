# Arquitetura do Sistema

## Objetivo

Este documento descreve a arquitetura técnica **real** do sistema Escola Bruna Mandz, conforme implementada no repositório.

> Revisão de 10/07/2026: a versão anterior deste documento descrevia uma arquitetura planejada (monorepo, React/TypeScript, Supabase Auth) que nunca foi implementada. Este documento foi reescrito para refletir o código de fato existente no repositório.

---

# Visão Geral

O sistema é uma aplicação web simples, sem build step no frontend além do empacotamento do Vite, acessada por um painel administrativo protegido por senha.

Arquitetura real:

```
Usuário (navegador)

↓

painel-x9k2f.html  (HTML + CSS + JS puro, um único arquivo, ~4400 linhas)
+ index.html / store (Loja pública)

↓  fetch() para /api/*

Vercel Serverless Functions  (api/*.js)

↓  Service Role Key (bypassa RLS)

Supabase (PostgreSQL)
```

---

# Tecnologias

## Frontend

Tecnologias realmente utilizadas:

- Vite (apenas como bundler/dev server, sem framework)
- JavaScript puro (Vanilla JS) — **não há React, TypeScript, Tailwind ou shadcn/ui**
- HTML + CSS inline nos próprios arquivos

Estrutura real do frontend:

- `painel-x9k2f.html` — painel administrativo completo (Dashboard, Agenda, Pedidos, Produtos, Financeiro), em um único arquivo autocontido, sem dependências externas de build
- `index.html` + `store/` — loja pública (carrinho, checkout Mercado Pago)
- `src/main.js`, `src/global-bridge.js` — scripts de entrada/ponte usados pelo Vite
- `public/` — assets estáticos (mídia, manifest PWA, service worker)

Não há divisão em `features/`, `components/`, `services/`, `hooks/` como um app React teria. Cada tela é uma seção dentro do HTML único, com suas próprias funções JS e event listeners.

---

## Backend

O backend é composto por **Vercel Serverless Functions** (arquivos em `api/`), não por um servidor próprio.

Responsabilidades:

- Autenticação simples do painel via header `x-admin-password`, validado contra a variável de ambiente `ADMIN_PASSWORD`.
- Toda comunicação com o Supabase usa a **Service Role Key** (nunca a chave anônima), o que faz o backend ignorar o RLS — daí a importância de nenhuma rota admin ficar exposta sem checar a senha primeiro.
- Integração com Mercado Pago (criação de pagamento, verificação, webhook).

Arquivos principais:

```
api/
├── admin-financial.js   → API consolidada do painel (13 recursos, ver database.md)
├── admin-orders.js      → gestão de pedidos da loja
├── admin-products.js    → gestão de produtos da loja
├── config.js            → expõe a Public Key do Mercado Pago ao frontend
├── create-payment.js    → cria pagamento (PIX/Cartão) no Mercado Pago
├── verify-mp-payment.js → verifica status de um pagamento
├── webhook.js           → recebe notificações do Mercado Pago
├── order-status.js      → consulta status de pedido
├── update-order-status.js
├── notify-new-order.js  → envia e-mail via Resend
├── upload-image.js      → upload de imagem de produto
└── _lib/                → helpers compartilhados (cliente Supabase, etc.)
```

**Limitação real importante:** o plano Hobby da Vercel permite no máximo 12 Serverless Functions. Por isso, novos recursos administrativos (vínculos, mensalidades, aulas, pagamentos a professores etc.) são adicionados como um novo `resource=` dentro de `api/admin-financial.js`, e não como arquivos novos em `api/`.

---

## Banco de Dados

Tecnologia: PostgreSQL via Supabase.

Ver `database.md` para a lista completa de tabelas, convenções e decisão de segurança (RLS).

---

# Comunicação com o Banco

Fluxo real (sem camada de "Service" no frontend, sem SDK do Supabase no cliente):

```
Frontend (fetch)

↓

/api/admin-financial?resource=X   (protegido por x-admin-password)

↓  @supabase/supabase-js com Service Role Key

PostgreSQL (Supabase)
```

O frontend **nunca** importa `@supabase/supabase-js` nem fala diretamente com o Supabase. Toda leitura/escrita passa pela API.

---

# Autenticação

Não há Supabase Auth, login de usuário, nem perfis de permissão.

O que existe: uma única senha de administrador (`ADMIN_PASSWORD`), enviada em todo request ao painel via header `x-admin-password` e validada no backend. Não há diferenciação de papéis (admin / secretaria / professor) hoje — é tudo ou nada.

---

# Ambiente

## Desenvolvimento

- `npm run dev` — Vite dev server, com um proxy local (`server-dev.js`) para simular as functions da Vercel.
- Dados de exemplo via `supabase/seed-escola.sql` e `supabase/seed-products.sql`.

## Produção

- Hospedado na Vercel, com Supabase como banco de produção.

---

# Deploy

```
Código (git push)

↓

GitHub

↓

Vercel (build automático via vite build)

↓

Aplicação publicada
```

Checklist real de publicação em `docs/PUBLICACAO.md`.

---

# Princípios Arquiteturais Reais

- **Simplicidade radical**: um arquivo HTML único para o painel é intencional, não um débito técnico — evita build step e complexidade de bundling para uma aplicação de uso interno.
- **Um recurso, uma rota**: novos domínios de dado viram `resource=` dentro de `admin-financial.js`, respeitando o limite de functions da Vercel.
- **Nenhum acesso direto do frontend ao Supabase**: toda regra de negócio e toda query passam pelo backend.
- **Migrations idempotentes**: alterações de schema usam `IF NOT EXISTS` / `DO` blocks defensivos, pois às vezes são rodadas manualmente no SQL Editor antes de serem commitadas.

---

# Alterações de Arquitetura

Qualquer mudança significativa na arquitetura (ex: migrar para um framework, dividir a API em mais arquivos, adotar Supabase Auth) deve ser registrada neste documento **depois** de implementada e confirmada no código — não como planejamento aspiracional.
