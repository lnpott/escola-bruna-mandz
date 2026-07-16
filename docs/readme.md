# Escola Bruna Mandz

Sistema de gestão para a escola de música Bruna Mandz: painel administrativo (alunos, professores, vínculos, agenda, aulas/presença, financeiro) + loja pública com checkout via Mercado Pago.

> Revisão de 10/07/2026: esta versão do documento foi reescrita para refletir a stack e a estrutura **realmente implementadas**. A versão anterior descrevia um monorepo com React/TypeScript/Tailwind que nunca existiu neste repositório.

---

# Objetivo

Substituir controle manual/planilhas da escola por um painel único, simples de manter, sem exigir infraestrutura de build complexa.

---

# Stack real

## Frontend

- Vite (bundler/dev server)
- JavaScript puro (Vanilla JS) — sem framework, sem TypeScript
- HTML + CSS inline

## Backend

- Vercel Serverless Functions (`api/*.js`)
- `@supabase/supabase-js` (usado só no backend, com Service Role Key)
- `mercadopago` (SDK oficial, para PIX e Cartão)
- `formidable` (upload de imagem de produto)

## Banco de Dados

- PostgreSQL via Supabase

## Autenticação

- Senha única de administrador (`ADMIN_PASSWORD`), validada via header `x-admin-password`. **Não** usa Supabase Auth.

## Deploy

- Vercel (frontend + serverless functions)
- Supabase (banco de produção)

---

# Estrutura real do repositório

```
api/                  → Serverless functions (Vercel)
  _lib/                  → helpers compartilhados (cliente Supabase)
  admin-financial.js     → API consolidada do painel (13 recursos)
  admin-orders.js        → gestão de pedidos da loja
  admin-products.js      → gestão de produtos da loja
  create-payment.js, verify-mp-payment.js, webhook.js, config.js, ...

docs/                 → documentação (este diretório)

src/                  → scripts de entrada usados pelo Vite
  main.js
  global-bridge.js

store/                → loja pública (carrinho, checkout, estilos)

public/               → assets estáticos, PWA manifest, service worker

supabase/             → schema.sql, financial-schema.sql, migrations/, seeds

painel-x9k2f.html     → arquivado em backup/ (painel clássico, ~4400 linhas). React SPA em /app/ é o frontend ativo.
index.html            → página da loja pública

novo_registro.md       → histórico condensado de desenvolvimento do painel (Etapas 44-63)
loja_registro.md       → histórico de desenvolvimento da loja
```

Não existem as pastas `apps/web`, `packages/`, `docker/` mencionadas em versões anteriores deste documento — eram planejamento, não implementação.

---

# Módulos reais do Painel Administrativo

- **Dashboard** — KPIs financeiros, aulas do dia, alertas, pedidos recentes, estoque baixo
- **Agenda** — calendário mensal (estilo Google Calendar) das aulas
- **Pedidos** — gestão de pedidos da loja
- **Produtos** — CRUD de produtos da loja
- **Financeiro** (com sub-abas):
  - Alunos
  - Professores
  - Vínculos (enrollments — aluno + professor + instrumento + dia/horário + mensalidade)
  - Aulas (lessons) + Presença (attendance)
  - Mensalidades (tuitions) — geradas automaticamente ao criar um vínculo ativo
  - Pagamentos a Professores (teacher_payments) — lançamento manual
  - Receitas Avulsas (payments)
  - Custos & Investimentos (expenses, investments)

Ver `modules.md` para detalhes de cada um.

---

# Fluxo Geral

```
Usuário

↓

Acessa /app/ (React SPA). Painel clássico em backup/painel-x9k2f.html

↓

Informa a senha de admin (ADMIN_PASSWORD)

↓

Navega pelas abas/sub-abas

↓

Cada ação chama fetch() para /api/admin-financial?resource=X

↓

Backend valida a senha, usa a Service Role Key para falar com o Supabase

↓

Resposta atualiza a interface (sem recarregar a página)
```

---

# Princípios do Projeto

- Simplicidade antes de complexidade — um HTML único é uma escolha deliberada, não um problema a resolver.
- Respeitar o limite de 12 Serverless Functions do plano Hobby da Vercel: novos recursos entram como `resource=` dentro de `admin-financial.js`.
- Nenhuma regra de negócio ou acesso a dado financeiro acontece no frontend — tudo passa pela API.
- Migrations idempotentes (`IF NOT EXISTS`, `DO` blocks), porque às vezes são aplicadas manualmente no SQL Editor do Supabase antes de serem commitadas.
- Documentação deve refletir o que existe, não o que se planeja construir — planejamento vive em `ROADMAP.MD` e em specs de etapa (ex: `proxima-etapa-spec.md`).

---

# Documentação

| Arquivo | Descrição |
|----------|-----------|
| `docs/readme.md` | Este documento — visão geral real do projeto |
| `docs/ARCHITECTURE.MD` | Arquitetura técnica real |
| `docs/database.md` | Schema e relacionamentos reais do banco |
| `docs/modules.md` | Descrição dos módulos reais |
| `docs/BUSINESS_RULES.md` | Regras de negócio já implementadas e pendentes |
| `docs/ROADMAP.MD` | Planejamento futuro (não confundir com o que já existe) |
| `docs/CONFIGURACAO_ENV.md` | Setup de ambiente local/produção |
| `docs/PUBLICACAO.md` | Checklist de publicação da loja |
| `docs/proxima-etapa-spec.md` | Spec da próxima etapa, com auditoria do estado atual |
| `novo_registro.md` | Histórico condensado de desenvolvimento do painel (Etapas 44-63) — substitui painel_registro.md |

Sempre que houver mudança estrutural real, o documento correspondente deve ser atualizado **junto** com a implementação — não antes, como planejamento especulativo.
