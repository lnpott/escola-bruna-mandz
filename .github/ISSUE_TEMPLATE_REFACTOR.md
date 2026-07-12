---

## Problem Statement

O sistema atual tem dois frontends (painel clássico HTML + React SPA) que competem entre si. Ao logar, o usuário é redirecionado ao React SPA, que apresenta erros 500 ao tentar modificar alunos, professores ou aulas. A navegação entre módulos é confusa (o usuário precisa "trocar de página toda hora"). O banco de dados tem redundâncias (ex: `students.active` e `students.status` duplicados). A cobertura de testes é praticamente zero.

## Solution

Unificar o sistema em um único frontend React SPA, redesenhar o banco de dados para um schema mais limpo, reescrever a API consolidada com tratamento de erros robusto, e adicionar cobertura de testes. O painel clássico será descontinuado.

## Commits

### Fase 1 — Diagnosticar e estabilizar o sistema atual (3 commits)

**Commit 1.1: Adicionar log detalhado nos erros 500 da API**
- Diferenciar erros de validação (400), banco (503) e internos (500)
- Log estruturado com stack trace no servidor

**Commit 1.2: Corrigir causas dos 500 em POST/PATCH**
- Testar cada handler (students, teachers, lessons) isoladamente
- Garantir parsing correto de `req.body` no Vercel runtime
- Validar todos os campos obrigatórios antes da query
- Tratar constraint violations do Supabase (FKs, unique)

**Commit 1.3: Adicionar testes de API**
- Testes com `node --test` para cada resource da admin-financial.js
- Validar status codes e estrutura de resposta

### Fase 2 — Redesenhar o banco de dados (3 commits)

**Commit 2.1: Mapear schema atual**
- Listar colunas, constraints, FKs, índices
- Identificar redundâncias e inconsistências

**Commit 2.2: Criar novo schema SQL**
- Normalizar `days_of_week`, eliminar `active`/`status` duplicação
- Constraints CHECK rigorosas, índices otimizados
- Manter IDs com prefixo legível (ST-XXXX, TE-XXXX)

**Commit 2.3: Migration do schema antigo → novo**
- Script idempotente que cria tabelas novas, migra dados, remove antigas

### Fase 3 — Reescrever a API (6 commits)

**Commit 3.1: Handler principal refatorado**
- Mapper resource→handler explícito
- Tratamento de erro centralizado com validação prévia

**Commit 3.2–3.6: Handlers por recurso**
- Students, Teachers, Enrollments, Lessons+Attendance, Financeiro (tuitions, payments, expenses, investments, teacher_payments, summary, dashboard)

### Fase 4 — Estabilizar o React SPA (7 commits)

**Commit 4.1: Autenticação** — Login, AuthGuard, tratamento de 401
**Commit 4.2: Dashboard** — KPIs, loading/error states, auto-refresh
**Commit 4.3: Students** — Listagem, busca, filtro, modal CRUD
**Commit 4.4: Teachers** — CRUD com dias de atendimento
**Commit 4.5: Enrollments** — CRUD com billing_type
**Commit 4.6: Agenda + Lessons** — Calendário, CRUD, presença
**Commit 4.7: Financial** — KPIs, sub-abas, CRUDs

### Fase 5 — Navegação e UX (3 commits)

**Commit 5.1: Navegação simplificada** — Menos trocas de página, breadcrumbs
**Commit 5.2: Feedback visual** — Toasts, spinners, empty states
**Commit 5.3: Responsividade** — Mobile

### Fase 6 — Limpeza (2 commits)

**Commit 6.1: Remover redirect automático ao React** — Manter clássico acessível, sem redirect forçado
**Commit 6.2: Arquivar código morto** — Mover painel clássico para backup

## Decision Document

1. **Frontend único**: React SPA será o único frontend. O painel clássico será arquivado.
2. **API consolidada**: `admin-financial.js` mantém todos os recursos com `?resource=` para respeitar o limite de 12 Serverless Functions da Vercel Hobby.
3. **Banco redesenhado**: Schema mais limpo, sem redundâncias (`active`/`status`), normalizado (`days_of_week`), com constraints CHECK mais rigorosas.
4. **Autenticação mantida**: `sessionStorage('admin_password')` + header `x-admin-password`. Sem Supabase Auth por enquanto.
5. **Loja separada**: `store/` e `api/` da loja (products, orders, payments) não entram no escopo.
6. **Testes**: Serão adicionados progressivamente, começando pela API (node --test), seguido por testes dos componentes React críticos.

## Testing Decisions

- **O que é um bom teste**: Testar comportamento externo (status codes, estrutura da resposta, erros esperados), não implementação interna.
- **Módulos testados**:
  - API (`api/admin-financial.js`): GET/POST/PATCH/DELETE para cada resource
  - React components (futuro): renderização, interações do usuário, estados de loading/erro
- **Ferramenta**: `node --test` (já configurada no projeto) para API. Para React, considerar testing-library.
- **Prior art**: `tests/webhook-signature.test.js` — 2 testes com `node:test` + `node:assert/strict`.

## Out of Scope

1. Loja (`store/`, `api/admin-orders.js`, `api/admin-products.js`, pagamentos MP)
2. Portal do Professor / Portal do Aluno
3. Supabase Auth (continua senha única via header)
4. Infraestrutura (Vercel + Supabase mantidos)
5. Funcionalidades novas não existentes hoje (relatórios, gráficos)
6. Página pública (index.html, piano, quiz)

## Further Notes

O plano completo está documentado em `refatora.md` na raiz do repositório. Cada fase deve ser validada em produção antes de avançar para a próxima. O painel clássico (`painel-x9k2f.html`) permanece acessível como fallback durante toda a transição.
