# Arquitetura do Sistema

## Objetivo

Este documento descreve a arquitetura técnica **real** do sistema Escola de Música Bruna Mandz, conforme implementada no repositório.

> Revisão de 12/07/2026: reescrito após a refatoração de jul/2026 (módulos financeiros extraídos, `academic/index.html` removido, `students.active` eliminado). Reflete o código de fato existente.

---

## Visão Geral

O sistema é composto por **duas aplicações frontend independentes** que compartilham o mesmo backend (API + banco de dados):

```
Usuário (navegador)

├─ / ou /loja → Site principal (Vanilla JS) + Loja
│     Landing page, quiz interativo, loja com carrinho e checkout
│
├─ /app/*     → React SPA (ERP Administrativo)
│     Dashboard, Alunos, Professores, Matrículas, Agenda,
│     Financeiro, Administração
│
└─ /painel-x9k2f.html → Portal obsoleto (apenas login/redirecionamento)
                          Redireciona para /app/ ou /comercial/
```

Ambas se comunicam com o backend via `fetch()` para `/api/*`, que são **Vercel Serverless Functions** protegidas pelo header `x-admin-password`.

---

## Tecnologias

### Frontend — Site Principal (`index.html` + `store/`)

| Tecnologia | Uso |
|-----------|-----|
| HTML + CSS + JavaScript puro | Landing page, quiz interativo com piano virtual |
| Tailwind CSS (CDN) | Utilitários de estilo |
| Tone.js (CDN) | Sintetizador de áudio para o piano interativo |
| Mercado Pago (Brick SDK) | Checkout PIX e Cartão de Crédito |

Arquivos principais:

```
index.html             → Landing page + seção institucional
store/
  store.js             → Inicialização da loja
  products.js          → Catálogo e exibição de produtos
  cart.js              → Gerenciamento do carrinho (localStorage)
  checkout-modal.js    → Modal de checkout com Mercado Pago
  payment-config.js    → Configuração de meios de pagamento
  store-style.css      → Estilos específicos da loja
src/
  main.js              → Entry point do Vite
  global-bridge.js     → Ponte global para funções compartilhadas
public/
  audio.js             → Engine de áudio do piano
  game.js              → Lógica do quiz/jogo musical
  manifest.json        → PWA manifest
  service-worker.js    → Service Worker (cache de assets, nunca cacheia /api/*)
```

### Frontend — React SPA (`app/`)

| Tecnologia | Uso |
|-----------|-----|
| **React 19** | Framework de componentes |
| **TypeScript** | Tipagem estática |
| **react-router-dom 7** | Roteamento SPA (hash-free com `<BrowserRouter basename=\"/app\">`) |
| **Vite** | Bundler e dev server |
| **CSS puro** (9 arquivos) | Estilização por módulo (sem framework CSS) |

Estrutura do SPA:

```
app/
  index.html                    → HTML de entrada do SPA
  src/
    main.tsx                    → ReactDOM.createRoot + StrictMode
    App.tsx                     → Router + AuthGuard + Layouts
    types.ts                    → Tipos TypeScript compartilhados
    services/
      api.ts                    → Cliente HTTP para API (/api/admin-financial)
    pages/
      Login.tsx                 → Tela de login (senha admin)
      Dashboard.tsx             → KPIs financeiros, escola, loja
      Students.tsx              → CRUD de alunos
      Teachers.tsx              → CRUD de professores
      Enrollments.tsx           → Gerenciamento de matrículas/vínculos
      Agenda.tsx                → Calendário de aulas
      Financial.tsx             → Financeiro completo (resumo, receitas, custos, etc.)
      Admin.tsx                 → Configurações do sistema
    styles/
      global.css                → Estilos globais + variáveis CSS
      login.css, dashboard.css, students.css, teachers.css,
      enrollments.css, agenda.css, financial.css, admin.css  → Estilos por módulo
```

**Rotas do SPA** (protegidas por `AuthGuard`):

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/app/login` | `Login` | Autenticação |
| `/app/` | `Home` | Grid de módulos |
| `/app/dashboard` | `Dashboard` | Indicadores em tempo real |
| `/app/academico` | `Students` | Lista de alunos |
| `/app/academico/professores` | `Teachers` | Lista de professores |
| `/app/academico/turmas` | `Enrollments` | Matrículas |
| `/app/agenda` | `Agenda` | Calendário |
| `/app/financeiro` | `Financial` | Financeiro |
| `/app/admin` | `Admin` | Administração |

### Legado — Portal Clássico (`painel-x9k2f.html`)

Um único arquivo HTML que funciona como portal de redirecionamento. Rota ofuscada (`painel-x9k2f`), **não protegida por senha própria** — apenas redireciona para `/app/` (acadêmico) ou `/commercial/` (loja). Compartilha o `sessionStorage` com o React SPA para a chave `admin_password`.

### Legado Removido — `academic/index.html`

~4600 linhas de Vanilla JS que duplicavam funcionalidades do React SPA (Agenda, Alunos, Professores). **Removido na refatoração de jul/2026** — o arquivo foi arquivado em `backups/` e a rota `/academico` foi redirecionada para `/app/` no `vercel.json`.

---

## Backend (Vercel Serverless Functions)

Toda a lógica de servidor reside em arquivos individuais em `api/`. O Vercel Hobby Plan permite no máximo 12 Serverless Functions — por isso recursos administrativos são consolidados via `resource=` em vez de arquivos separados.

```
api/
  ├── admin-financial.js          → Router principal (~80 linhas)
  │     └── Delega para módulos em api/_lib/financial/
  │           ├── helpers.js      → Funções puras compartilhadas
  │           ├── students.js     → CRUD de alunos
  │           ├── teachers.js     → CRUD de professores
  │           ├── enrollments.js  → CRUD de matrículas
  │           ├── tuitions.js     → CRUD de mensalidades
  │           ├── payments.js     → Receitas avulsas
  │           ├── expenses.js     → Custos/despesas
  │           ├── investments.js  → Investimentos
  │           ├── teacherPayments.js → Pagamentos a professores
  │           ├── lessons.js      → Aulas
  │           ├── attendance.js   → Presença
  │           ├── summary.js      → Resumo financeiro mensal
  │           └── dashboard.js    → Dashboard consolidado
  │
  ├── config.js                   → Expõe chave pública do Mercado Pago
  ├── create-payment.js            → Cria pagamento (PIX/Cartão)
  ├── verify-mp-payment.js        → Verifica status de pagamento
  ├── webhook.js                  → Webhook do Mercado Pago
  ├── admin-orders.js             → Gestão de pedidos da loja
  ├── admin-products.js           → Gestão de produtos da loja
  ├── order-status.js             → Status de pedido
  ├── update-order-status.js      → Atualizar status
  ├── notify-new-order.js         → E-mail de novo pedido (via Resend)
  ├── upload-image.js              → Upload de imagem de produto
  │
  └── _lib/
        ├── supabase.js           → Singleton do cliente Supabase
        ├── normalize-product.js  → Helper de normalização de produto
        └── webhook-signature.js  → Validação de assinatura do webhook MP
```

### Arquitetura do Router (`admin-financial.js`)

```javascript
// Exemplo da estrutura:
const RESOURCES = {
    students: handleStudents,
    teachers: handleTeachers,
    // ... 12 handlers no total
};

export default async function handler(req, res) {
    if (!auth(req, res)) return;           // Middleware de senha
    const { resource } = req.query;
    return await RESOURCES[resource](req, res, supabase);
}
```

**Segurança:**
- Toda request ao `admin-financial.js` exige header `x-admin-password`
- `classifyError()` mapeia códigos de erro do Postgres para respostas HTTP sem vazar `err.message`
- Funções `safeFloat()` e `safeInt()` previnem NaN no banco

---

## Banco de Dados

**Tecnologia:** PostgreSQL via Supabase.

**Acesso:** Exclusivamente via `SUPABASE_SERVICE_ROLE_KEY` (backend) — o frontend nunca fala diretamente com o Supabase. RLS está habilitado em todas as tabelas, mas **não há policies ativas** (o backend ignora RLS pela service role key, e o projeto não usa Supabase Auth).

### Schema

Dois arquivos SQL, aplicados em ordem:

1. **`supabase/schema.sql`** — Base da loja: `products`, `orders`, `order_items`, função `set_updated_at()`
2. **`supabase/financial-schema.sql`** — Módulo acadêmico/financeiro:
   - `students` (campos: id, name, cpf, email, phone, address, instrument, status[lead→cancelled], guardian_name, guardian_cpf, guardian_phone, etc.)
   - `teachers` (id, name, phone, specialty, rate_per_class, days_of_week, active)
   - `enrollments` (aluno + professor + instrumento + horário + valor + billing_type)
   - `tuitions` (mensalidades: amount, discount, status, due_date, paid_at, enrollment_id)
   - `payments` (receitas avulsas)
   - `expenses` (custos: fixed/variable)
   - `investments`
   - `teacher_payments`
   - `lessons` (aulas: regular/make_up/extra/trial, status, start/end_time)
   - `attendance` (presença: present/absent/excused/late)

**Convenções:**
- IDs com prefixo textual (`ST-`, `TC-`, `EN-`, `TU-`, etc.) gerados por `genId()`
- Triggers `set_updated_at` em todas as tabelas
- CHECK constraints para valores controlados (`status`, `billing_type`, etc.)
- Constraints únicas: `attendance` (uma presença por aula por aluno)

### Mudanças na Refatoração (jul/2026)

| O que | Detalhe |
|-------|---------|
| `students.active` removido | Era redundante com `students.status` — `status = 'active'` é a única fonte de verdade |
| RLS policies removidas | Nunca tinham efeito (backend usa service_role_key) |
| Migrações antigas mantidas | `supabase/migrations/*.sql` mantidas como registro histórico — não precisam ser reaplicadas |

---

## Fluxo de Autenticação

```
1. Usuário acessa /app/login
2. Digita a senha → fetch POST /api/admin-financial?resource=students (apenas para validar)
3. Se 200, senha é salva em sessionStorage como "admin_password"
4. Toda request subsequente envia header: x-admin-password: <senha>
5. Backend compara com process.env.ADMIN_PASSWORD
6. Se 401, sessionStorage é limpo e usuário redirecionado ao login
```

Não há Supabase Auth, perfis de usuário, ou níveis de permissão — é tudo ou nada.

---

## Deploy

### Desenvolvimento Local

```bash
node server-dev.js       # Inicia API local na porta 3001 (lê .env manualmente)
npm run dev              # Inicia Vite na porta 5173 (proxy /api/* → localhost:3001)
```

### Produção (Vercel)

```
git push → GitHub → Vercel (build automático via vite build)
```

**`vercel.json`** — Rewrites:

| Origem | Destino |
|--------|---------|
| `/app/:path*` | `/app/index.html` |
| `/academico*` | `/app/index.html` |
| `/comercial*` | `/commercial/index.html` |
| `/commercial*` | `/commercial/index.html` |

**Build (Vite) — multi-entry:**

```javascript
rollupOptions: {
    input: {
        main:       'index.html',               // Site principal + loja
        app:        'app/index.html',            // React SPA
        painel:     'painel-x9k2f.html',         // Portal clássico (legado)
        commercial: 'commercial/index.html',      // Painel da loja
    }
}
```

---

## Testes

Framework: **Node built-in runner** (`node --test`).

```
tests/
  ├── financial-helpers.test.js    → 22 testes (funções puras: safeFloat, safeInt, classifyError, etc.)
  ├── financial-students.test.js   → 5 testes (handler de alunos com mock do Supabase)
  └── webhook-signature.test.js    → 2 testes (assinatura do webhook MP)
```

Total: **29 testes**. Execute com `npm test`.

---

## Princípios Arquiteturais

1. **Router + Módulos**: o backend administrativo é um router fino que delega para módulos especializados — facilita teste e manutenção sem multiplicar Serverless Functions
2. **Zero acesso direto do frontend ao banco**: toda query passa pela API protegida por senha
3. **Duas aplicações, mesmo backend**: site principal (Vanilla JS) e ERP (React SPA) compartilham a mesma API e banco
4. **Simplicidade no frontend do site principal**: Vanilla JS + CDNs evita build step desnecessário para páginas institucionais e loja
5. **TypeScript apenas no SPA**: o React SPA usa TS para segurança de tipos; o resto do projeto é JavaScript puro
6. **Migrações destrutivas são aceitáveis**: como o projeto pode recriar o banco do zero, mudanças de schema são aplicadas diretamente no SQL de schema, não via migrações incrementais

---

## Mudanças de Arquitetura (Histórico)

| Data | Mudança | Motivo |
|------|---------|--------|
| jul/2026 | Extração de 12 módulos de `admin-financial.js` | Facilitar manutenção e testes |
| jul/2026 | Remoção de `academic/index.html` | Eliminar frontend duplicado e desatualizado |
| jul/2026 | Remoção de `students.active` | Eliminar redundância com `students.status` |
| jul/2026 | Limpeza de RLS policies | Policies mortas sem efeito prático |
