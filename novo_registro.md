# 📋 Registro de Desenvolvimento — Escola de Música Bruna Mandz

> **Documento condensado** a partir de `painel_registro.md` (2121 linhas → ~300).
> Criado em 15/07/2026 para substituir o arquivo original como fonte de verdade única.
> Etapas aqui documentadas: **44 a 72** (12/07/2026 — 16/07/2026).
>
> **Etapas 1-43** permanecem preservadas em `painel_registro.md` (arquivado na raiz
> como referência histórica). Novas etapas devem ser adicionadas **apenas** neste arquivo.

---

## Índice

| Etapa | Data | Foco | Tipo |
|:-----:|:----:|------|:----:|
| [44](#etapa-44--correções-pós-auditoria-de-banco) | 12/07 | Correções pós-auditoria de banco | 🛠️ Fix |
| [45](#etapa-45--correções-de-bugs-do-react-spa-fase-4) | 12/07 | Correções de bugs React SPA | 🐛 Fix |
| [46](#etapa-46--navegação-global-ux-e-links-rápidos-fase-5) | 12/07 | Navegação global, TopBar, Toast | ✨ Feature |
| [47](#etapa-47--loading-states-e-empty-states-padronizados-fase-52) | 12/07 | Loading/Empty/Error states globais | ♻️ Refactor |
| [48](#etapa-48--arquivamento-do-painel-clássico-fase-6) | 12/07 | Arquivamento do painel clássico | 🧹 Cleanup |
| [50](#etapa-50--responsividade-mobile-fase-53) | 15/07 | Responsividade mobile | 📱 Feature |
| [51](#etapa-51--correções-de-code-review-fase-8-pós-fixes) | 15/07 | Correções de code review | 🐛 Fix |
| [53](#etapa-53--fase-9-alunos-expandido) | 15/07 | Alunos Expandido + StudentDetail | ✨ Feature |
| [54](#etapa-54--correção-dos-3-críticos-code-review) | 15/07 | Remoção dead code + bugs críticos | 🐛 Fix |
| [55](#etapa-55--type-safety-remoção-de-30-as-any-e-catch-err-any) | 15/07 | Type safety (30+ as any removidos) | ♻️ Refactor |
| [56](#etapa-56--correção-de-issues-menores-css-xss-log) | 15/07 | CSS global, XSS sanitization | 🐛 Fix |
| [57](#etapa-57--relatório-financeiro-fechamento-mensal--exportação-pdf) | 15/07 | Relatório Financeiro + PDF | ✨ Feature |
| [60](#etapa-60--alinhamento-de-tipos-typescript-product--order) | 15/07 | Alinhamento tipos TS c/ Supabase | ♻️ Refactor |
| [61](#etapa-61--wizard-de-cadastro-de-aluno) | 15/07 | Wizard de cadastro de aluno | ✨ Feature |
| [62](#etapa-62--correção-dos-bugs-em-produção) | 15/07 | Correção de bugs produção | 🐛 Fix |
| [63](#etapa-63--correção-do-eslint) | 15/07 | Correção ESLint | 🛠️ Fix |
| [64](#etapa-64--pagamento-automático-a-professor) | 15/07 | Pagamento automático a professor | ✨ Feature |
| [65](#etapa-65--confirmação-ao-excluir-vínculo) | 15/07 | Confirmação ao excluir vínculo | ✨ Feature |
| [66](#etapa-66--testes-para-pagamento-a-professor-e-exclusão-de-vínculo) | 16/07 | Testes p/ teacher_payments + delete enrollment | 🧪 Test |
| [67](#etapa-67--auditoria-de-design-web-48-regras) | 16/07 | Web Interface Guidelines audit | ♻️ Refactor |
| [68](#etapa-68--acessibilidade-outline-none--focus-visible) | 16/07 | Acessibilidade: outline → :focus-visible | ♻️ Refactor |
| [69](#etapa-69--performance-css-transition-all--propriedades-explícitas) | 16/07 | transition: all → props explícitas | ♻️ Refactor |
| [70](#etapa-70--arquivamento-físico-do-painel-x9k2fhtml) | 16/07 | painel-x9k2f.html → backup/ | 🧹 Cleanup |
| [71](#etapa-71--auditoria-de-referências-obsoletas-commercialindexhtml) | 16/07 | Auditoria commercial/index.html | 🧹 Cleanup |
| [72](#etapa-72--limpeza-de-dados-acadêmicosfinanceiros) | 16/07 | Limpeza de dados (1 aluno, 1 prof) | 🧹 Cleanup |
| [73](#etapa-73--correção-de-segurança-e-refatoração-do-server-devjs) | 16/07 | Segurança + refatoração server-dev.js | 🛠️ Fix |
| [74](#etapa-74--correção-de-vazamento-e-fallback-da-loja-em-produção) | 16/07 | Fix loja: leak API + fallback produtos | 🐛 Fix |
| [75](#etapa-75--extração-de-handlers-da-loja-para-api_libstorehandlersjs) | 16/07 | Extração handlers loja p/ api/_lib/store/ | ♻️ Refactor |
| [76](#etapa-76--instalação-do-ripgrep) | 16/07 | Instalação do ripgrep (code-searcher) | 🛠️ Tooling |
| [77](#etapa-77--guard-delete-teacher-crud-completo-server-dev-e-testes) | 16/07 | Guard DELETE teacher + CRUD dev server + testes | ♻️ Refactor |
| [78](#etapa-78--guard-delete-student-helper-mock-compartilhado-e-leak-fix) | 16/07 | Guard DELETE student + helper mock + leak fix | ♻️ Refactor |
| [79](#etapa-79--design-upgrade-fonte-premium-enrollmentscss-migrado) | 16/07 | Design upgrade: font swap + enrollments CSS vars | 🎨 Design |
| [80](#etapa-80--p2-design-cleanup-centralizar-css-duplicado--unificar-active-states) | 16/07 | P2 design cleanup: CSS duplicado + active states | ♻️ Refactor |
| [81](#etapa-81--design-polish-sombras-tintadas-bg-base-letter-spacing--tabular-nums) | 16/07 | Design polish: shadows, bg, letter-spacing, tabular-nums | 🎨 Design |
| [82](#etapa-82--correções-de-campos-cpf-telefone-especialidade-mensalidade-e-upload-de-imagem) | 16/07 | Correções: CPF/phone masks, specialty select, fee validation, image upload | 🐛 Fix |
| [83](#etapa-83--painel-de-gerenciamento-de-imagens-supabase-storage) | 16/07 | Storage Manager: listar, detectar órfãs, excluir imagens | ✨ Feature |
| [84](#etapa-84--compressão-automática-de-imagens-com-sharp-webp-800px) | 16/07 | Compressão de imagens com Sharp (WebP + resize 800px) | ✨ Feature |

---

## Estatísticas do Período

| Métrica | Valor |
|---------|-------|
| **Etapas** | 41 (44-84, com lacunas 49, 52, 58, 59) |
| **Commits** | 25+ |
| **Período** | 12/07/2026 — 16/07/2026 (5 dias) |
| **Total de linhas do documento original** | 2121 |
| **Decisões do usuário respondidas** | 4 (pag. professor, relatório, exclusão vínculo, turmas) |

---

# ETAPA 44 — Correções Pós-Auditoria de Banco

**Data:** 12/07/2026 | **Commit:** `802224f`

**Objetivo:** Corrigir problemas identificados na auditoria do banco de dados e schema.

## Implementações

- **SQL de correção** (`supabase/fix-auditoria.sql`):
  - `students.active` dropada — `status` é única fonte de verdade
  - `enrollments.class_time` e `lessons.start_time/end_time` normalizados como `text` (sem segundos)
  - `tuitions.reference_month` migrado de `text` para `date`
  - `expenses.expense_type` CHECK expandido p/ aceitar `'variable'`
  - RLS policies deny para anon nas 10 tabelas do domínio acadêmico/financeiro
- **Schema** (`supabase/financial-schema.sql`): `reference_month: text → date`
- **API** (`api/_lib/financial/tuitions.js`): reusa `normalizeMonthDate()` de helpers

## Testes

✅ `npm test` — passando | ✅ `node --check` — sintaxe válida

---

# ETAPA 45 — Correções de Bugs do React SPA (Fase 4)

**Data:** 12/07/2026 | **Commit:** `5a3664c`

**Objetivo:** Corrigir bugs que causavam erros 500 e quebras de funcionalidade.

## Implementações

- **Bug #3 — `students.active` removida**: `Enrollments.tsx` e `Admin.tsx` usavam `s.active` (coluna dropada). Substituído por `s.status === 'active'`
- **Bug #2 — Error handling na API**: `classifyError()` mapeia códigos de erro do Supabase p/ HTTP status (409, 400, 500)
- **Bug #5 — Validação de `req.body`**: Validação centralizada antes do switch de resources

## Arquivos Alterados

`app/src/pages/Enrollments.tsx`, `app/src/pages/Admin.tsx`, `api/admin-financial.js`

## Testes

✅ `npm test` — 29/29 | ✅ `npm run build` — OK

---

# ETAPA 46 — Navegação Global, UX e Links Rápidos (Fase 5)

**Data:** 12/07/2026 | **Commit:** `3c6e010`

**Objetivo:** Substituir navegação descentralizada por layout global padronizado.

## Implementações

- **TopBar**: Header fixo 56px com backdrop-filter, abas de navegação, botão Sair unificado
- **Breadcrumbs**: Navegação hierárquica com links clicáveis
- **Toast Global**: Sistema de notificações via React Context (`AppContext`), auto-dismiss 3.5s
- **ConfirmModal**: Substituição de `window.confirm()` por modal estilizado via Promise
- **AppLayout**: Unificação de wrappers em todas as páginas autenticadas
- **Dashboard**: KPIs e alertas agora são links clicáveis

## Arquivos Alterados

`app/src/App.tsx`, `app/src/styles/global.css` (+260 linhas), `app/src/styles/dashboard.css`, `app/src/pages/Dashboard.tsx`, `Students.tsx`, `Teachers.tsx`, `Enrollments.tsx`

## Testes

✅ `npm run build` — 72 módulos | ✅ Code Review — sem issues

---

# ETAPA 47 — Loading States e Empty States Padronizados (Fase 5.2)

**Data:** 12/07/2026 | **Commit:** `5361f53`

**Objetivo:** Padronizar estados de loading, empty e erro em todas as páginas.

## Problema

Cada página tinha sua própria implementação CSS, resultando em aparência inconsistente e ~150 linhas duplicadas.

## Implementações

- **Classes globais** em `global.css`: `.loading` (com spinner animado), `.empty-state`, `.error-banner`
- **Variantes**: `.loading-sm`, `.loading-lg`, `.empty-state-sm`, `.error-banner-hiding`
- **Removido** ~150 linhas de CSS duplicado de 6 arquivos de página

## Testes

✅ `npm run build` — 72 módulos | ✅ Code Review — sem issues críticas

---

# ETAPA 48 — Arquivamento do Painel Clássico (Fase 6)

**Data:** 12/07/2026 | **Commit:** `d738668`

**Objetivo:** Arquivar `painel-x9k2f.html` (HTML/JS puro, ~4400 linhas) como fallback de emergência.

## Implementações

- **Backup**: `backup/painel-x9k2f.backup.html`
- **Links removidos**: Login.tsx, Admin.tsx, App.tsx (Home), commercial/index.html
- **Build**: Entrada `painel` removida do `rollupOptions.input` no `vite.config.js`
- **CSS morto**: `.login-legacy-link` removido
- **Varredura backend**: 0 referências a `painel-x9k2f.html`

## Testes

✅ `npm run build` — 70 módulos | ✅ Varredura — 0 referências residuais

---

# ETAPA 50 — Responsividade Mobile (Fase 5.3)

**Data:** 15/07/2026 | **Commit:** `d738668`

**Objetivo:** Ajustar layout para telas pequenas (≤640px e ≤480px).

## Implementações

- **TopBar colapsada**: Brand vira só ícone 🎵, abas só ícones, Sair só 🚪
- **Breadcrumbs scroll**: overflow-x: auto em mobile
- **Toast full-width**: 100% da tela em mobile
- **ConfirmModal empilhado**: Botões em coluna no mobile
- **Gráficos Admin**: Grid 1 coluna, barras compactas
- **Dashboard**: Nome do professor oculto, KPIs compactos
- **Breakpoint 480px**: Espaçamento mínimo

## Testes

✅ `npm run build` — 71 módulos | ✅ Code Review — sem issues

---

# ETAPA 51 — Correções de Code Review (Fase 8 Pós-Fixes)

**Data:** 15/07/2026 | **Commit:** `b7d8b8e`

**Objetivo:** Corrigir 3 pontos do code review da Agenda.

## Implementações

- **Fix #1 — Double-fetch**: `loadLessons()` removido dos handlers de toggle (useEffect já faz o fetch)
- **Fix #2 — Mapeamento frágil**: `DAY_SHORT_TO_LABEL` substitui array indexOf frágil
- **Fix #3 — Error banner fadeOut**: Transição opacity 150ms + classe `.error-banner-hiding`

## Testes

✅ `npm run build` — 70 módulos, 4.77s | ✅ `npm test` — 29/29 | ✅ Code Review

---

# ETAPA 53 — Fase 9: Alunos Expandido

**Data:** 15/07/2026 | **Commit:** `a428b14`

**Objetivo:** Expandir página de Alunos com histórico, CSV, multi-instrumentos e detalhes.

## Implementações

- **StudentDetail.tsx** (novo): Página `/academico/aluno/:id` com info completa, estatísticas, abas de Aulas/Mensalidades/Pagamentos
- **API**: `fetchStudentById`, `fetchLessonsByStudent`, `fetchEnrollmentsByStudent`, `fetchTuitionsByStudent`, `fetchPaymentsByStudent`
- **Backend**: Filtro `?resource=students&id=ST-XXXX` no GET
- **CSV Export**: 8 colunas com BOM UTF-8 para Excel
- **Multi-instrumentos**: Checkboxes estilo chips
- **Coluna Origem**: Badge na tabela
- **Rota**: `/academico/aluno/:id` → StudentDetail

## Arquivos Alterados

`app/src/pages/StudentDetail.tsx` (novo), `Students.tsx`, `api.ts`, `students.css`, `App.tsx`, `api/_lib/financial/students.js`

## Testes

✅ `npm run build` — 71 módulos, 4.42s | ✅ Code Review — 6 issues corrigidos

---

# ETAPA 54 — Correção dos 3 Críticos (Code Review)

**Data:** 15/07/2026 | **Commit:** `7f947ae`

**Objetivo:** Remover código morto, corrigir bug silencioso e unificar UX inconsistente.

## Problemas e Correções

| # | Severidade | Problema | Correção |
|:-:|:----------:|----------|----------|
| 1 | 🔴 Crítico | `api/_lib/admin/` — 9 arquivos mortos (~800 linhas) | Removidos |
| 2 | 🔴 Crítico | `fetchPaymentsByStudent` ignorava `student_id` | Adicionado `.eq('student_id', student_id)` |
| 3 | 🔴 Crítico | Financial.tsx com toast e confirm próprios | Unificado com `useApp()` global |

## Testes

✅ `npm run build` — 71 módulos | ✅ `npm test` — 29/29 | ✅ Code Review

---

# ETAPA 55 — Type Safety: Remoção de 30+ `as any` e `catch (err: any)`

**Data:** 15/07/2026 | **Commit:** `032680b`

**Objetivo:** Eliminar todas as ocorrências de `as any` e `catch (err: any)` nos .tsx.

## Padrões Corrigidos

| Padrão | Ocorrências | Correção |
|--------|:-----------:|----------|
| `catch (err: any) { setError(err.message) }` | 25 | `catch (err: unknown)` + `instanceof Error` |
| `payload as any` (create/update) | 2 | Removido (payload já compatível) |
| `form.lesson_type as any` | 2 | `as LessonType` |
| `const payload: any = { ... }` | 1 | Tipo explícito `Omit<Enrollment, ...>` |

## Arquivos Alterados

9 arquivos .tsx: Agenda, Enrollments, Students, Teachers, Financial, Dashboard, Admin, StudentDetail

## Testes

✅ Ripgrep: 0 ocorrências de `catch (err: any)` ou `as any` em .tsx
✅ `npm run build` — 71 módulos, 2.85s | ✅ Code Review

---

# ETAPA 56 — Correção de Issues Menores (CSS, XSS, Log)

**Data:** 15/07/2026 | **Commit:** `089df38`

**Objetivo:** Corrigir CSS duplicado, risco XSS na loja e console.error em produção.

## Implementações

- **CSS global**: `.btn-primary`/`.btn-secondary` movidos p/ `global.css` (antes em `students.css`)
- **XSS sanitization**: Função `esc()` adicionada em `store/store.js`, sanitiza 8+ interpolações
- **Log**: `console.error` → `console.warn`

## Testes

✅ `npm run build` — 71 módulos, 2.58s | ✅ Code Review — 1 issue corrigido

---

# ETAPA 57 — Relatório Financeiro (Fechamento Mensal + Exportação PDF)

**Data:** 15/07/2026 | **Commit:** `3d7cfc4`

**Objetivo:** Implementar relatório financeiro de fechamento mensal com breakdown e exportação PDF.

## Implementações

- **Nova aba "📊 Relatório"**: 5ª aba no Financeiro, reusa seletor de mês/ano
- **Seletor de Período**: Mês (dropdown) ou Período Personalizado (datas)
- **Endpoint**: `resource=financial_report` → `api/_lib/financial/report.js` (novo)
- **Breakdown de Receitas**: Mensalidades, receitas avulsas por categoria
- **Breakdown de Despesas**: Por categoria e por tipo (fixo/variável)
- **Pagamentos a Professores**: Lista por professor (seção condicional)
- **Gráfico CSS**: 6 meses, 3 barras/mês (receita/despesa/saldo), tooltip hover
- **Exportação PDF**: `window.print()` com `@media print` (~60 linhas)

## Arquivos Alterados

`api/_lib/financial/report.js` (novo), `api/admin-financial.js`, `Financial.tsx`, `api.ts`, `types.ts`, `financial.css`

## Testes

✅ `npm run build` — 71 módulos, 3.27s | ✅ Code Review — 3 issues corrigidos

---

# ETAPA 60 — Alinhamento de Tipos TypeScript (Product / Order)

**Data:** 15/07/2026 | **Commit:** — (na main)

**Objetivo:** Ajustar interfaces `Product` e `Order` para corresponderem ao schema do Supabase.

## Implementações

- **Product**: Adicionados `updated_at`, `badge_color`, `reward_xp`, `variants`; removido `sizes`
- **Order**: Adicionados `updated_at`, `customer_phone`, `mp_payment_id`, `mp_status`, `mp_status_detail`, `earned_xp`, `customer_is_student`; renomeado `payment_method` → `method`; `items` → `any`
- **Store.tsx**: Atualizado p/ consumir interfaces corrigidas

---

# ETAPA 61 — Wizard de Cadastro de Aluno

**Data:** 15/07/2026 | **Commit:** — (na main)

**Objetivo:** Substituir formulário plano por wizard de 8 etapas com matrícula integrada.

## Implementações

- **Fluxo**: Dados do Aluno → Check Matrícula → Instrumento → Professor → Dia/Horário → Valor → Agendar 1ª Aula → Confirmação
- **UI**: `StepIndicator` visual (stepper) + cards de seleção
- **Backend**: `handleWizardSave` integrado p/ criação simultânea de aluno + matrícula

---

# ETAPA 62 — Correção dos Bugs em Produção

**Data:** 15/07/2026 | **Commit:** — (na main)

**Objetivo:** Corrigir erros críticos no Wizard e navegação.

## Implementações

- **Erro 400**: Status `'enrolled'` → `'active'` (CHECK constraint do banco)
- **ReferenceError**: `const navigate = useNavigate()` faltando em `Students.tsx`
- **UI**: `<input type="date">` estilizado no Step 7

---

# ETAPA 63 — Correção do ESLint

**Data:** 15/07/2026 | **Commit:** — (na main)

**Objetivo:** Resolver crash no `npm run lint`.

## Implementações

- Identificada corrupção no pacote `eslint@10.6.0` (configs ausentes em `node_modules`)
- Solução: `rm -rf node_modules && npm install` completo

---

# ETAPA 64 — Pagamento Automático a Professor

**Data:** 15/07/2026 | **Commit:** — (na main)

**Objetivo:** Implementar cálculo automático de pagamento a professor com base em `rate_per_class × aulas completadas no mês`.

## Contexto

O usuário decidiu (sessão de 15/07/2026) que o pagamento a professor deve ser **automático**, mas **acionado manualmente** (botão, não automático junto com a mensalidade). A razão: permitir que o usuário revise as aulas dadas antes de gerar os pagamentos.

## Implementações

### Backend — `api/_lib/financial/teacherPayments.js`
- Nova função `handleGenerateTeacherPayments()` acessível via `GET ?resource=teacher_payments&action=generate&month=X&year=Y`
- Para cada professor ativo com `rate_per_class > 0`:
  1. Conta `lessons` com status `'completed'` no mês/ano
  2. Calcula `amount = rate_per_class × total_aulas_completadas`
  3. Verifica se já existe pagamento para o mesmo professor+mês (evita duplicação)
  4. Cria registro `teacher_payment` com `paid: false` e `notes` descritiva
- Retorna resumo completo: `{ generated: [...], skipped: [...], summary: { total_teachers, generated_count, skipped_count, total_amount } }`
- Cada item ignorado inclui `reason` explicativa ("Nenhuma aula completada no período", "Já existe pagamento para este mês", etc.)

### Frontend — `app/src/services/api.ts`
- Nova função `generateTeacherPayments(month, year)` que chama o backend

### Frontend — `app/src/pages/Financial.tsx`
- Botão **⚡ Gerar Pagamentos** na aba "Pag. Professores"
- Modal de confirmação: "Calcular rate_per_class × aulas completadas para [mês] de [ano]?"
- Toast com resultado: `"X pagamento(s) gerado(s) — Total: R$ X.XXX,XX"`
- Toast informativo se nenhum pagamento gerado (sem professores ativos, todos já existentes, ou sem aulas)
- Recarrega lista e KPIs após geração

## Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `api/_lib/financial/teacherPayments.js` | `handleGenerateTeacherPayments()` — ~100 linhas |
| `app/src/pages/Financial.tsx` | Botão ⚡ Gerar Pagamentos + confirm + toast |
| `app/src/services/api.ts` | `generateTeacherPayments()` — chamada API |

## Decisão do Usuário

- ✅ **Automático**: calcular `rate_per_class × aulas completadas no mês`
- ✅ **Acionado manualmente**: pelo botão ⚡, não automático junto com mensalidade
- ✅ **Por quê?** Usuário pode revisar aulas antes de gerar pagamentos (aula cancelada ainda como completed, aula extra não registrada, etc.)

## Testes

✅ `npm run build` — 73 módulos, sem erros | ✅ `npm test` — 29/29 | ✅ Code Review — sem issues críticas

---

# ETAPA 65 — Confirmação ao Excluir Vínculo

**Data:** 15/07/2026 | **Commit:** — (na main)

**Objetivo:** Implementar confirmação em duas etapas ao excluir um vínculo, perguntando se o usuário deseja cancelar mensalidades pendentes também.

## Contexto

O usuário decidiu (sessão de 15/07/2026) que ao excluir um vínculo, o sistema deve **perguntar antes** se deseja cancelar as mensalidades pendentes também. Mensalidades já pagas nunca são afetadas.

## Implementações

### Backend — `api/_lib/financial/enrollments.js` (DELETE handler)
- Aceita novo query param `?cancel_tuitions=true`
- Se `cancel_tuitions=true`:
  - Busca mensalidades do vínculo com status `pending` ou `overdue`
  - Atualiza todas para `status: 'cancelled'` com `notes: 'Cancelada automaticamente ao excluir vínculo.'`
  - Retorna `cancelled_tuitions` count
- Se `cancel_tuitions` não enviado ou `false`:
  - Exclui apenas o vínculo (mensalidades permanecem, `enrollment_id` vai a `null` via `on delete set null`)
- Mantém validação existente: bloqueia exclusão se houver aulas vinculadas (status 409)

### Frontend — `app/src/services/api.ts`
- `deleteEnrollment(id, cancelTuitions?)` aceita parâmetro opcional
- Retorna objeto `{ success, cancelled_tuitions, message }`

### Frontend — `app/src/pages/Enrollments.tsx`
- **1ª confirmação**: "Tem certeza que deseja excluir o vínculo de [nome do aluno]?" (botão vermelho "Excluir" + "Cancelar")
- **2ª confirmação**: "Deseja também cancelar as mensalidades pendentes deste vínculo?" com opções:
  - ✅ "Sim, cancelar mensalidades"
  - ❌ "Não, manter mensalidades" (exclusão prossegue mesmo assim)
- Toast informa quantas mensalidades foram canceladas (ou apenas "Vínculo excluído" se 0)

## Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `api/_lib/financial/enrollments.js` | DELETE com `cancel_tuitions` — ~30 linhas |
| `app/src/pages/Enrollments.tsx` | `handleDelete` com 2 confirmações + toast |
| `app/src/services/api.ts` | `deleteEnrollment(id, cancelTuitions?)` assinatura + query param |

## Decisão do Usuário

- ✅ **Perguntar antes de excluir**: sistema pergunta se quer cancelar mensalidades
- ✅ **Mensalidades pagas**: NUNCA são afetadas (apenas `pending`/`overdue`)
- ✅ **Exclusão prossegue** mesmo se usuário optar por não cancelar mensalidades

## Testes

✅ `npm run build` — 73 módulos, sem erros | ✅ `npm test` — 29/29 | ✅ Code Review — sem issues críticas

---

# ETAPA 66 — Testes para Pagamento a Professor e Exclusão de Vínculo

**Data:** 16/07/2026 | **Commits:** — (na main)

**Objetivo:** Adicionar testes unitários para `handleGenerateTeacherPayments` (Etapa 64) e `deleteEnrollment` com `cancel_tuitions` (Etapa 65).

## Contexto

Após implementar as Etapas 64 e 65, o code review recomendou adicionar testes específicos para as novas funcionalidades. O projeto já possuía 29 testes em 3 arquivos.

## Implementações

### `tests/financial-teacher-payments.test.js` (10 testes)

| Teste | O que valida |
|-------|-------------|
| GET sem month | Retorna 400 (parâmetro obrigatório) |
| GET sem year | Retorna 400 |
| month inválido | Retorna 400 |
| Nenhum professor ativo | 0 pagamentos gerados, summary vazio |
| Nenhuma aula no mês | 0 pagamentos, professor ignorado com reason |
| **Professor com aulas gera pagamento** | 5 aulas × R$50 = R$250 |
| **Idempotência** | Pagamento já existente → ignorado com reason |
| Múltiplos professores | 1 gera, 1 sem aulas ignora, 1 já pago ignora |
| Query assertions | Chama `teachers.select`, `lessons.select`, `teacher_payments` na ordem certa |
| Conteúdo das notes | Notes contém mês/ano e `completed_lessons` |

### `tests/financial-enrollments.test.js` (8 testes)

| Teste | O que valida |
|-------|-------------|
| DELETE sem id | Retorna 400 |
| Guarda: aulas vinculadas | Retorna 409 (bloqueia exclusão) |
| Guarda: sem aulas | Deleta sem erros |
| Sem cancel_tuitions | Não consulta tuitions |
| cancel_tuitions=true + pending | Cancela pending/overdue, retorna count |
| cancel_tuitions=true + sem tuitions | 0 cancelled_tuitions |
| Ordem das queries no DELETE | Chama `enrollments.delete` DEPOIS de `lessons` e (opcional) `tuitions` |
| Filtro correto nas tuitions | `.in('status', ['pending', 'overdue'])` |

## Arquivos Criados

| Arquivo | Linhas | Testes |
|---------|:------:|:------:|
| `tests/financial-teacher-payments.test.js` | ~270 | 10 |
| `tests/financial-enrollments.test.js` | ~230 | 8 |

## Testes

✅ `npm test` — **48/48 passando** (29 originais + 10 + 8) | ✅ `npm run build` — 73 módulos, 2.44s

---

# ETAPA 67 — Auditoria de Design Web (48 Regras)

**Data:** 16/07/2026 | **Commits:** — (na main)

**Objetivo:** Revisar toda a UI do React SPA contra as 48 regras das Web Interface Guidelines da Vercel.

## Escopo da Auditoria

- **9 páginas React**: Dashboard, Students, Teachers, Enrollments, Agenda, Financial, Admin, Login, StudentDetail
- **11 arquivos CSS**: global.css + 10 específicos
- **Loja vanila**: store.js, store-style.css

## Resultados

### ✅ Boas Práticas Encontradas (13 categorias)

| Regra | Exemplos |
|-------|----------|
| Botões reais (`<button>`, não `<div onClick>`) | Todas as páginas |
| Labels em formulários (`<label>`) | Students, Teachers, Enrollments, Financial, Agenda |
| Formatação de moeda (`Intl.NumberFormat`) | Dashboard, Admin, Financial, Store, StudentDetail |
| Formatação de datas (`toLocaleDateString`) | Financial, StudentDetail, Dashboard |
| Números monoespaçados (`tabular-nums`) | 16 ocorrências em 5 CSS |
| Toque mobile (`touch-action: manipulation`) | 14 ocorrências |
| Movimento reduzido (`prefers-reduced-motion`) | global.css — reseta animações |
| Acessibilidade (`aria-live`, `aria-label`) | Toast (`polite`), breadcrumbs (`Navegação`) |
| Ações destrutivas com confirmação | Students, Teachers, Enrollments, Financial |
| Estados vazios (`.empty-state`) | Todas as páginas |
| Loading states | Todas as páginas |
| Error states | Banner dismissível |

### ⚠️ Issues Encontradas (5 categorias)

| Issue | Severidade | Ocorrências |
|-------|:----------:|:-----------:|
| `outline: none` sem `:focus-visible` | ⚠️ Moderada | 13 (7 CSS files) |
| `transition: all` em vez de props explícitas | 🟢 Menor | 51 (10 CSS files) |
| `onClick` em `<tr>` sem `onKeyDown` (Dashboard) | 🟢 Menor | 1 |

### ✅ Anti-padrões Ausentes (7 categorias)

`autocomplete="off"`, `user-scalable=no`, `transition:all` justificado (já corrigido em Etapa 69), imagens sem `width`/`height`, `color-scheme` quebrado

## Arquivos Revisados

20 arquivos (9 páginas + 11 CSS)

---

# ETAPA 68 — Acessibilidade: `outline: none` → `:focus-visible`

**Data:** 16/07/2026 | **Commits:** — (na main)

**Objetivo:** Corrigir todas as ocorrências de `outline: none` removendo o anel de foco visual para usuários de teclado.

## Problema

Usuários que navegam por teclado (Tab) perdiam o indicador visual de foco porque `outline: none` era aplicado diretamente no `:focus`, afetando tanto clique do mouse quanto navegação por teclado.

## Solução

Para cada `selector:focus { outline: none; }`, substituído por:

```css
selector:focus:not(:focus-visible) {
    outline: none;
}
selector:focus {
    border-color: var(--border-accent);  /* mantém feedback visual para mouse */
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}
```

Isso:
- Suprime o outline apenas para clique do mouse (`:focus:not(:focus-visible)`)
- Preserva o anel vermelho global (`outline: 2px solid var(--border-accent)`) definido no `global.css` para navegação por teclado (`:focus-visible`)
- Mantém `border-color` e `box-shadow` como feedback visual para mouse

## Arquivos Alterados (7)

| Arquivo | Ocorrências |
|---------|:-----------:|
| `app/src/styles/students.css` | 3 |
| `app/src/styles/financial.css` | 1 |
| `app/src/styles/enrollments.css` | 3 |
| `app/src/styles/agenda.css` | 2 |
| `app/src/styles/login.css` | 1 |
| `app/src/styles/store.css` | 2 |
| `store/store-style.css` | 1 |

## Testes

✅ `npm run build` — 73 módulos, 2.49s | ✅ Code Review — sem issues

---

# ETAPA 69 — Performance CSS: `transition: all` → Propriedades Explícitas

**Data:** 16/07/2026 | **Commits:** — (na main)

**Objetivo:** Corrigir todas as 53 ocorrências de `transition: all` no projeto, substituindo por listas explícitas de propriedades.

## Problema

`transition: all` força o navegador a monitorar todas as propriedades CSS do elemento para mudanças, mesmo as que nunca são alteradas. Isso:
- Causa trabalho extra de layout/paint/composite
- Impede que o navegador otimize animações
- Pode causar transições indesejadas em propriedades que mudam por outros motivos

## Abordagem

Para cada `transition: all`, analisamos os seletores `:hover`, `:active`, `:focus` e classes de estado (`.active`, `.key-pressed`, etc.) para identificar **exatamente** quais propriedades mudam. A transição foi então limitada a essas propriedades.

## Propriedades mais comuns

| Propriedade | Frequência |
|-------------|:----------:|
| `background` | ~35 |
| `border-color` | ~30 |
| `color` | ~25 |
| `transform` | ~15 |
| `box-shadow` | ~12 |
| `opacity` | 2 |
| `padding-left` | 1 |

## Arquivos Alterados (11)

| Arquivo | Ocorrências |
|---------|:-----------:|
| `app/src/styles/global.css` | 7 |
| `app/src/styles/dashboard.css` | 4 |
| `app/src/styles/students.css` | 4 |
| `app/src/styles/financial.css` | 4 |
| `app/src/styles/agenda.css` | 8 |
| `app/src/styles/enrollments.css` | 5 |
| `app/src/styles/admin.css` | 5 |
| `app/src/styles/store.css` | 5 |
| `app/src/styles/teachers.css` | 1 |
| `store/store-style.css` | 10 |
| `index.html` (embedded `<style>`) | 3 |

## Correção após Code Review

- `admin.css` — `.admin-alert-card` precisava de `border-color, background` extra porque os severity variant hovers (`.severity-critical:hover`, etc.) alteram essas propriedades em seletores separados.

## Testes

✅ `npm run build` — 2.71s | ✅ Varredura: **0 `transition: all` restantes** em todo o projeto | ✅ Code Review — sem issues

---

# ETAPA 70 — Arquivamento Físico do `painel-x9k2f.html`

**Data:** 16/07/2026 | **Commits:** — (na main)

**Objetivo:** Mover `painel-x9k2f.html` da raiz do projeto para `backup/`, completando o arquivamento iniciado na Etapa 48.

## Contexto

Na Etapa 48 (12/07), o painel clássico foi removido do build e dos links de navegação, mas o arquivo permaneceu na raiz. Agora, confirmado que o `commercial/index.html` não tem mais links para ele, o arquivo físico foi movido para o diretório de backup.

## Verificações

| Verificação | Resultado |
|-------------|:---------:|
| `vite.config.js` | Entry já removido (Etapa 48) ✅ |
| `vercel.json` | 0 referências ✅ |
| React SPA | 0 referências ✅ |
| `commercial/index.html` | 0 referências ✅ |
| Link de navegação `../` | 1 match: CSS import válido (`../store/store-style.css`) ✅ |

## Ação

- `painel-x9k2f.html` (raiz) → `backup/painel-x9k2f.html`
- Backup anterior (`backup/painel-x9k2f.backup.html`) permanece como referência histórica
- O arquivo no backup é **trackeado pelo git** (não está em `.gitignore`)

## Testes

✅ `npm run build` — 7.62s (sem regressão) | ✅ Code Review — sem issues

---

# ETAPA 71 — Auditoria de Referências Obsoletas (`commercial/index.html`)

**Data:** 16/07/2026 | **Commits:** — (na main)

**Objetivo:** Verificar se `commercial/index.html` contém links, imports ou caminhos obsoletos.

## Resultado

**Nenhuma referência obsoleta encontrada.** O arquivo está limpo.

| Padrão | Resultado |
|--------|:---------:|
| `painel-x9k2f` | 0 matches ✅ |
| `../` (links navegação) | 1 match: `../store/store-style.css` (CSS import válido) ✅ |
| `window.location` / `location.href` | 0 matches ✅ |
| Links para `.html` | 0 matches ✅ |
| API calls (`/api/*`) | 20 matches — todos endpoints existentes ✅ |

---

# ETAPA 72 — Limpeza de Dados Acadêmicos/Financeiros

**Data:** 16/07/2026 | **Commits:** `3ae17dc`

**Objetivo:** Remover dados de teste/academicos do Supabase, mantendo apenas 1 aluno (Sofia Almeida), 1 professor (Bruna Mandz), 1 vínculo e 1 mensalidade. Store (products, orders) intacta.

## Contexto

O banco de dados de produção continha dados de desenvolvimento/seeding com 6 alunos, 3 professores e diversos vínculos, mensalidades, aulas e pagamentos. O usuário solicitou limpeza para começar a usar o sistema com dados reais, mantendo apenas registros mínimos de referência.

## Implementações

### `supabase/cleanup-minimal.sql` (novo)

Script SQL para ser executado no Supabase (SQL Editor ou via script Node):

| Passo | Ação |
|:-----:|------|
| 1-7 | DELETE em attendance, lessons, teacher_payments, tuitions, payments, expenses, investments |
| 8 | DELETE em enrollments |
| 9 | DELETE students WHERE id <> 'ST-ABCDEF' (mantém Sofia) |
| 10 | DELETE teachers WHERE id <> 'TE-A7B2C3' (mantém Bruna) |
| 11 | INSERT 1 enrollment (Piano, Seg 14h, R$300) |
| 12 | INSERT 1 tuition (paga, mês corrente) |
| Final | SELECT count(*) em todas as tabelas como verificação |

- Ordem de deleção respeita constraints de FK (filhos antes dos pais)
- Store (products, orders) **não é tocada**
- `date_trunc('month', CURRENT_DATE)` para datas dinâmicas

### `supabase/seed-escola.sql` (atualizado)

- Substituído seed completo (6 alunos, 3 professores, 8 enrollments, 9 tuitions) por dados mínimos
- Agora usa `ON CONFLICT (id) DO NOTHING` (idempotente)
- Datas dinâmicas via `date_trunc('month', CURRENT_DATE)`
- Cabeçalho orienta usar `cleanup-minimal.sql` primeiro

### `scripts/run-cleanup.js` (novo, gitignorado)

Script Node.js que lê `.env` manualmente e usa `@supabase/supabase-js` com a `service_role_key` para executar a limpeza programaticamente.

## Execução

✅ Script `scripts/run-cleanup.js` executado com sucesso no Supabase de produção:

| Tabela | Antes | Depois |
|--------|:-----:|:------:|
| students | 6 | **1** (Sofia Almeida) |
| teachers | 3 | **1** (Bruna Mandz) |
| enrollments | 8 | **1** |
| tuitions | 9 | **1** |
| lessons | vários | **0** |
| attendance | vários | **0** |
| products | 10 | **10** (intacto) |
| orders | 18 | **18** (intacto) |

## Arquivos

| Arquivo | Tipo |
|---------|:----:|
| `supabase/cleanup-minimal.sql` | Novo — script SQL de limpeza |
| `supabase/seed-escola.sql` | Modificado — seed mínimo |
| `scripts/run-cleanup.js` | Novo (gitignorado) — executor programático |

## Decisão do Usuário

- ✅ Manter 1 aluno (Sofia) + 1 professor (Bruna) + 1 vínculo
- ✅ Store intacta (products + orders)
- ✅ Limpeza já executada na produção

## Testes

✅ `npm test` — 48/48 | ✅ `npm run build` — 2.98s | ✅ Code Review — sem issues

---

# ETAPA 73 — Correção de Segurança e Refatoração do server-dev.js

**Data:** 16/07/2026

**Objetivo:** Corrigir vazamento de `err.message` nas respostas 500 do `server-dev.js` (7 pontos) e eliminar ~120 linhas de lógica duplicada de dashboard/summary reaproveitando os handlers da biblioteca `api/_lib/financial/`.

## Contexto

A auditoria de código (code review completo do projeto) identificou que o `server-dev.js` tinha **7 pontos de vazamento** de `err.message` em respostas HTTP 500, expondo detalhes internos do servidor ao cliente. Além disso, as funções `handleDashboard` (~60 linhas) e `handleSummary` (~50 linhas) duplicavam exatamente as mesmas queries já existentes em `api/_lib/financial/dashboard.js` e `api/_lib/financial/summary.js`, criando risco de divergência futura.

## Implementações

### 🔒 Segurança — 7 vazamentos de `err.message` fechados

| Handler | Antes (vazava) | Depois (genérico) |
|---------|----------------|-------------------|
| **Global catch** | `{ error, details: err.message }` | `{ error: 'Erro interno do servidor.' }` |
| `handleOrders` | `{ error: error.message }` | `{ error: 'Erro ao carregar pedidos.' }` |
| `handleProducts` | `{ error: error.message }` | `{ error: 'Erro ao carregar produtos.' }` |
| `handleAdminProducts` | `{ error: error.message }` | `{ error: 'Erro ao carregar produtos.' }` |
| `handleAdminOrders` | `{ error: error.message }` | `{ error: 'Erro ao carregar pedidos.' }` |
| `handleFinancial` | `{ error: error.message }` | `{ error: 'Erro ao carregar dados.' }` / `'Erro interno do servidor.'` |
| `handleOrderStatus` | `{ error: error.message }` | `{ error: 'Erro ao consultar pedido.' }` |

### ♻️ Reuso — eliminação de ~120 linhas duplicadas

**Antes:** `server-dev.js` tinha suas próprias `handleDashboard` e `handleSummary` com 12+ queries Supabase cada, copiadas manualmente de `api/_lib/financial/`.

**Depois:**
- Importados `handleDashboard` (de `dashboard.js`) e `handleSummary` (de `summary.js`)
- Criados adaptadores `toVercelReq()` e `toVercelRes()` que traduzem `req`/`res` do Node `http.createServer` para o formato Vercel-style esperado pelos handlers:
  - `req.query` → objeto de query params via `Object.fromEntries(url.searchParams)`
  - `res.status(code).json(data)` → wrapper encadeável sobre a função `json()` local
- `handleFinancial` agora delega `resource=dashboard` e `resource=summary` para os handlers da biblioteca via adaptador

### 🧹 Limpeza

- `classifyError` removido do import (não era usado — os handlers da biblioteca têm seu próprio tratamento de erro)
- `const url = parseUrl(req)` removido de `handleAdminProducts` (variável não usada)
- Bloco `validResources` envolvido em `try/catch` com mensagens genéricas

## Arquivo Alterado

| Arquivo | Mudança |
|---------|---------|
| `server-dev.js` | Removidas `handleDashboard` + `handleSummary` (~120 linhas); adicionados imports + adaptadores; 7 mensagens de erro genéricas |

## Testes

- ✅ `node server-dev.js` — servidor inicia sem erros de importação
- ✅ Code Review (deepseek-flash) — 1 issue encontrado (import morto de `classifyError`) e corrigido; versão final aprovada sem issues
- ✅ Nenhuma regressão funcional — os handlers da biblioteca são os mesmos usados em produção (Vercel)

---

# ETAPA 74 — Correção de Vazamento e Fallback da Loja em Produção

**Data:** 16/07/2026

**Objetivo:** Corrigir problema em produção onde itens da loja não apareciam — causado por chunk JS 404 (hash desatualizado no deploy) + vazamento de `err.message` em `api/products.js` + falta de fallback para produtos estáticos.

## Diagnóstico

O console do navegador em produção apresentava:

| Erro | Causa |
|------|-------|
| `main-O-tkMRsf.js 404` | Deploy desatualizado — o build local gera hash `BgKCwKDo`, mas o servidor ainda serve o HTML com hash antigo |
| `css2:1 400` | Google Fonts CSS2 API — provável rate limiting/bloqueio. Cosmético, não afeta funcionalidade |
| Loja vazia | Consequência do 404: se o JS chunk não carrega, `store.js` nunca executa |

## Correções

### 🔒 `api/products.js` — vazamento de `err.message` corrigido

**Antes:** `return res.status(500).json({ error: 'Erro ao buscar produtos.', details: err.message })`

**Depois:** `return res.status(500).json({ error: 'Erro ao buscar produtos.' })`

O campo `details` foi removido para não expor detalhes internos do servidor.

### ♻️ `store/store.js` — fallback para produtos estáticos

Adicionado import de `./products.js` como fallback:

```javascript
import { PRODUCTS as STATIC_PRODUCTS } from './products.js';
```

Dois cenários de fallback:
1. **API retorna erro** (fetch falha, status != 200, ou resposta não-JSON): usa `STATIC_PRODUCTS` e marca `productLoadError = false` (fallback ativo, sem tela de erro)
2. **API retorna array vazio** (sem produtos no Supabase): usa `STATIC_PRODUCTS` com log informativo

Isso garante que a loja sempre mostre os 3 produtos estáticos (`Camisa "Não Posso, Tenho Ensaio"`, `Camisa Oficial Padrão`, `Suporte de Baqueta`) mesmo se a API ou o Supabase estiverem indisponíveis.

### 🚀 Recomendação

Fazer deploy do novo build no Vercel (`git push origin main`) para atualizar o HTML com o novo hash do chunk JS (`BgKCwKDo`) e eliminar o erro 404.

## Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `api/products.js` | `details: err.message` removido da resposta 500 |
| `store/store.js` | Import de `./products.js` + fallback no `catch` e quando API retorna vazio |

## Testes

- ✅ `npm run build` — 4.86s, sem erros (novo import de `products.js` incluso no bundle)
- ✅ Code Review — aprovado sem issues críticos

---

# ETAPA 75 — Extração de Handlers da Loja para `api/_lib/store/handlers.js`

**Data:** 16/07/2026

**Objetivo:** Extrair os handlers da loja (`handleOrders`, `handleProducts`, `handleAdminProducts`, `handleAdminOrders`, `handleOrderStatus`, `handleConfig`) do `server-dev.js` para uma biblioteca compartilhada em `api/_lib/store/handlers.js`, seguindo o mesmo padrão do módulo financeiro (`api/_lib/financial/`).

## Contexto

Na Etapa 73, os handlers financeiros `handleDashboard` e `handleSummary` foram extraídos para a biblioteca compartilhada. Ficou pendente a mesma extração para os handlers da loja — 5 handlers inline no `server-dev.js` com ~80 linhas de lógica duplicada em relação aos arquivos standalone em `api/` (products.js, admin-products.js, admin-orders.js, order-status.js).

Além disso, `api/admin-orders.js` e `api/admin-products.js` ainda **vazavam `err.message`** em respostas 500 — problemas de segurança iguais aos corrigidos no `server-dev.js` na Etapa 73.

## Brainstorm de Melhorias (registrado nesta Etapa)

Antes de implementar, foi feito um brainstorm completo de 5 ideias de melhoria estrutural:

| # | Ideia | Impacto | Esforço | Custo-benefício |
|:-:|-------|:-------:|:-------:|:----------------:|
| 1 | **Extração de handlers da loja para `api/_lib/store/`** | Alto | 1h | ⭐⭐⭐⭐⭐ |
| 2 | CRUD completo no server-dev.js via delegação total | Alto | 2h | ⭐⭐⭐⭐ |
| 3 | Design System CSS unificado + Dark/Light Mode | Médio-Alto | 3-4h | ⭐⭐⭐ |
| 4 | Playwright E2E para o React SPA | Muito Alto | 4-5h | ⭐⭐⭐ |
| 5 | CI Pipeline + Error Boundaries no React SPA | Alto | 1.5h | ⭐⭐⭐⭐⭐ |

**Ideia 1** foi selecionada para implementação imediata.

## Implementações

### `api/_lib/store/handlers.js` (novo)

Biblioteca compartilhada com handlers Vercel-style `(req, res, supabase)`:

| Handler | Função | Usado por |
|---------|--------|-----------|
| `handleListOrders` | Lista todos os pedidos (SELECT *, limit 200) | server-dev, api/admin-orders |
| `handleListPublicProducts` | Lista produtos ativos com normalização | server-dev, api/products |
| `handleListAllProducts` | Lista todos os produtos (ativos e inativos) | server-dev, api/admin-products GET |
| `handleOrderStatus` | Consulta status de 1 pedido por ID (público) | server-dev, api/order-status |
| `handleConfig` | Retorna chave pública do Mercado Pago | server-dev, api/config |

- Todos os handlers usam mensagens genéricas em caso de erro (sem vazamento de `err.message`)
- Reusa `normalizeProduct()` de `api/_lib/normalize-product.js` (já existente)
- Segue o padrão dos handlers financeiros em `api/_lib/financial/`

### `server-dev.js` — refatorado

- `handleOrders` → `handleListOrders` (da biblioteca, via adapter)
- `handleProducts` → `handleListAllProducts` (da biblioteca, via adapter) — nota: server-dev lista TODOS os produtos, não apenas active=true
- `handleAdminProducts` → `handleListAllProducts` (da biblioteca, via adapter)
- `handleAdminOrders` → `handleListOrders` (da biblioteca, via adapter)
- `handleOrderStatus` → `handleOrderStatus` (da biblioteca, via adapter)
- `handleConfig` → `handleConfig` (da biblioteca, via adapter)
- ~80 linhas de código inline removidas
- Comentário NOTA atualizado

### `api/products.js` — refatorado

- Importa `handleListPublicProducts` da biblioteca
- Handler principal delega para a função compartilhada
- Remove duplicação da query Supabase e normalização
- Já tinha `err.message` corrigido (Etapa 74) — mantido

### `api/admin-products.js` — refatorado

- GET handler delega para `handleListAllProducts` da biblioteca
- POST e PATCH permanecem no arquivo (são próprios do admin e não duplicados)
- 🔒 **Vazamentos de `err.message` corrigidos** — 3 pontos:
  - `{ error: 'Erro ao buscar produtos.', details: err.message }` → genérico
  - `{ error: 'Erro ao criar produto.', details: err.message }` → genérico
  - `{ error: 'Erro ao atualizar produto.', details: err.message }` → genérico

### `api/admin-orders.js` — refatorado

- Importa `handleListOrders` da biblioteca
- Handler principal delega para a função compartilhada
- 🔒 **Vazamento de `err.message` corrigido** — `details: err.message` removido

### `api/order-status.js` — refatorado

- Importa `handleOrderStatus` da biblioteca
- Handler principal delega para a função compartilhada
- Já tinha mensagem genérica — mantido

## Arquivos Alterados

| Arquivo | Tipo | Mudança |
|---------|:----:|---------|
| `api/_lib/store/handlers.js` | 🆕 Novo | Biblioteca compartilhada (~90 linhas) |
| `server-dev.js` | ♻️ | 6 handlers inline → imports da biblioteca (~80 linhas removidas) |
| `api/products.js` | 🔒 | Delegado para handleListPublicProducts |
| `api/admin-products.js` | 🔒 | GET delegado + 3 vazamentos err.message corrigidos |
| `api/admin-orders.js` | 🔒 | Delegado + vazamento err.message corrigido |
| `api/order-status.js` | 🔒 | Delegado (já tinha mensagem genérica) |

## Testes

- ✅ `npm test` — 48/48 passando
- ✅ `npm run build` — sem erros
- ✅ `node server-dev.js` — servidor inicia sem erros
- ✅ Code Review — aprovado sem issues

## Testes

- ✅ `rg --version` — ripgrep 14.1.0, pcre2 + simd
- ✅ `rg "err.message" api/` — busca funcional (< 1s)
- ✅ Nenhuma alteração de código — apenas tooling

---

# ETAPA 76 — Instalação do ripgrep

**Data:** 16/07/2026

**Objetivo:** Instalar ripgrep no ambiente de desenvolvimento para habilitar o code-searcher agent, que antes falhava com erro "Ripgrep binary not found for win32-x64".

## Contexto

Durante todas as Etapas anteriores (73-75), o code-searcher agent (`ripgrep`) não funcionava. Sempre que tentávamos buscar código, recebíamos:

```
Ripgrep binary not found for win32-x64
Please run 'npm run fetch-ripgrep' or set CODEBUFF_RG_PATH environment variable.
```

Isso forçava o uso de ferramentas mais lentas e menos precisas para busca de código. Após o brainstorm de melhorias (registrado na Etapa 75), a instalação do ripgrep foi identificada como prioridade para aumentar a eficiência do desenvolvimento.

## Implementação

Instalação via Chocolatey com permissão de administrador:

```bash
choco install ripgrep -y
```

### Resultado

| Métrica | Valor |
|---------|-------|
| **Versão** | ripgrep 14.1.0 |
| **Binário** | `C:\ProgramData\chocolatey\bin\rg.exe` |
| **Features** | simd-accel, pcre2 (JIT disponível) |
| **Busca em `api/`** | ✅ < 1s |
| **Code-searcher agent** | ✅ Agora funcional |

## Impacto

- **Code-searcher agent** habilitado — pode buscar padrões em todo o código excluindo `node_modules`
- **Busca 10-100x mais rápida** que `grep`/`findstr` do Windows
- **Padrões PCRE2** disponíveis para buscas complexas (retrovisor, lookahead, etc.)

## Testes

- ✅ `npm test` — 68/68 passando (+7 novos testes teachers)
- ✅ `npm run build` — 3.40s
- ✅ `node server-dev.js` — servidor inicia sem erros
- ✅ Code Review — aprovado, 3 correções aplicadas (CORS DELETE, empty body null, head:true test)

---

# ETAPA 77 — Guard DELETE Teacher + CRUD Completo server-dev.js + Testes

**Data:** 16/07/2026

**Objetivo:** Implementar duas melhorias identificadas na auditoria dos 4 fluxos críticos (Etapa 75): segurança no DELETE de professores (guard de vínculos ativos) e CRUD completo no server-dev.js via delegação para todos os handlers financeiros. Além disso, criar testes unitários para o guard.

## Contexto

Na auditoria de fluxos (realizada nesta mesma sessão), foram identificadas duas oportunidades de melhoria:

1. **DELETE de professor sem verificação**: O handler `handleTeachers` permitia excluir um professor mesmo se ele tivesse vínculos ativos (enrollments), criando dados órfãos.
2. **server-dev.js GET-only**: O server-dev.js só suportava GET para resources financeiros. POST/PATCH/DELETE só funcionavam na Vercel, impossibilitando testes locais de CRUD completo.

## Implementações

### 1. 🔒 `api/_lib/financial/teachers.js` — Guard no DELETE

**Antes:** Excluía o professor diretamente, sem verificar vínculos ativos.

**Depois:** Antes de excluir, consulta `enrollments` com `teacher_id + status='active'`. Se houver vínculos ativos, retorna **409 Conflict**:

```
"Não é possível excluir este professor: existem N vínculo(s) ativo(s)
vinculado(s) a ele. Remova ou inative os vínculos primeiro."
```

Segue o mesmo padrão do guard já existente em `enrollments.js` (que verifica aulas vinculadas antes de excluir um vínculo).

### 2. ♻️ `server-dev.js` — CRUD Completo via Delegação

**Antes:** O `handleFinancial` tinha um bloco `validResources` que só fazia SELECT simples (GET-only). Para POST/PATCH/DELETE, o desenvolvedor precisava testar na Vercel.

**Depois:** O `handleFinancial` agora importa **todos os 10 handlers financeiros** e delega para eles com base no parâmetro `?resource=`:

| Handler | Resource |
|---------|----------|
| `handleStudents` | students |
| `handleTeachers` | teachers |
| `handleEnrollments` | enrollments |
| `handleTuitions` | tuitions |
| `handlePayments` | payments |
| `handleExpenses` | expenses |
| `handleInvestments` | investments |
| `handleTeacherPayments` | teacher_payments |
| `handleLessons` | lessons |
| `handleAttendance` | attendance |
| `handleDashboard` | dashboard |
| `handleSummary` | summary |

**Mudanças técnicas:**
- `parseRequestBody()` — nova função que lê o stream HTTP e faz parse do JSON body para POST/PATCH
- `toVercelReq()` agora inclui `body: req.body` (necessário para POST/PATCH)
- CORS `Access-Control-Allow-Methods` atualizado para incluir `DELETE`
- `req.body` explicitamente setado como `null` quando body vazio (evita TypeError nos handlers)

### 3. 🧪 `tests/financial-teachers.test.js` — 7 Testes Unitários

| Teste | O que valida |
|-------|-------------|
| DELETE sem id | Retorna 400 |
| Com vínculos ativos | Retorna 409 (bloqueia exclusão) |
| Sem vínculos ativos | Retorna 200 (permite exclusão) |
| Só vínculos inativos | Retorna 200 (filtro por `status=active` funciona) |
| Ordem das queries | `enrollments` → `teachers` |
| Filtros corretos | `teacher_id` e `status=active` |
| `head:true` | Usa `{ count: 'exact', head: true }` para não trazer linhas |

Segue o padrão de mock (`makeSupabaseMock`/`makeRes`) já estabelecido em `financial-enrollments.test.js` e `financial-teacher-payments.test.js`.

## Arquivos Alterados

| Arquivo | Tipo | Mudança |
|---------|:----:|---------|
| `api/_lib/financial/teachers.js` | 🔒 | Guard DELETE: verifica vínculos ativos antes de excluir |
| `server-dev.js` | ♻️ | CRUD completo: imports + parseRequestBody + resourceHandlers map + CORS DELETE |
| `tests/financial-teachers.test.js` | 🆕 | 7 testes unitários para o guard DELETE |

## Testes

- ✅ `npm test` — **68/68 passando** (61 anteriores + 7 novos)
- ✅ `npm run build` — 3.40s sem erros
- ✅ `node server-dev.js` — servidor inicia sem erros
- ✅ Code Review — aprovado; 3 correções aplicadas: CORS DELETE, empty body null, head:true test fix

---

# ETAPA 78 — Guard DELETE Student + Helper Mock Compartilhado + Leak Fix

**Data:** 16/07/2026

**Objetivo:** Completar a auditoria de fluxos com 3 melhorias: guard de vínculos ativos no DELETE de alunos, extração do mock Supabase para helper compartilhado, e varredura de vazamentos `err.message` residuais.

## Contexto

Após implementar o guard no DELETE de professores (Etapa 77) e instalar o ripgrep (Etapa 76), ficaram pendentes:

1. **DELETE de aluno sem verificação**: O handler `handleStudents` permitia excluir um aluno mesmo se ele tivesse vínculos ativos, criando dados órfãos — mesmo problema do teacher.
2. **Mock duplicado**: Os 3 arquivos de teste (`financial-enrollments`, `financial-teacher-payments`, `financial-teachers`) tinham ~100 linhas de `makeSupabaseMock`/`makeRes` copiadas.
3. **Leaks residuais**: Varredura com ripgrep em `api/` poderia encontrar vazamentos de `err.message` ainda não corrigidos.

## Implementações

### 1. 🔒 `api/_lib/financial/students.js` — Guard no DELETE

**Antes:** Excluía o aluno diretamente, sem verificar vínculos ativos.

**Depois:** Antes de excluir, consulta `enrollments` com `student_id + status='active'`. Se houver vínculos ativos, retorna **409 Conflict**:

```
"Não é possível excluir este aluno: existem N vínculo(s) ativo(s) vinculado(s) a ele. Remova ou inative os vínculos primeiro."
```

Segue o mesmo padrão do guard em `teachers.js` (Etapa 77) e `enrollments.js` (Etapa 65).

### 2. ♻️ `tests/_helpers/supabase-mock.js` — Helper Compartilhado

Criado arquivo compartilhado com `makeSupabaseMock()` e `makeRes()`, extraídos dos 3 arquivos de teste:

- `from(table)` → retorna chain builder com `.select()`, `.eq()`, `.in()`, `.gt()`, `.gte()`, `.lte()`, `.order()`, `.range()`, `.insert()`, `.update()`, `.delete()`, `.single()`, `.maybeSingle()`, `.then()`
- `makeRes()` → simula `res.status(code).json(data)` com captura de status e body
- `head: true` suportado na chamada `.select()`, passado como segundo argumento

**3 arquivos de teste atualizados** (sem mudança de lógica):

| Arquivo | Linhas removidas |
|---------|:----------------:|
| `tests/financial-enrollments.test.js` | ~35 (definições inline) |
| `tests/financial-teacher-payments.test.js` | ~35 (definições inline) |
| `tests/financial-teachers.test.js` | ~30 (definições inline) |

### 3. 🔒 `api/update-order-status.js` — Leak Fix

**Antes:** `return res.status(500).json({ error: 'Erro ao atualizar status do pedido.', details: err.message })`

**Depois:** `return res.status(500).json({ error: 'Erro ao atualizar status do pedido.' })`

Último vazamento encontrado pela varredura com ripgrep:

```bash
rg 'details.*err\.message' --glob 'api/**/*.js'
```

Resultado: **1 ocorrência** em `api/update-order-status.js` — corrigida.

## Arquivos Alterados

| Arquivo | Tipo | Mudança |
|---------|:----:|---------|
| `api/_lib/financial/students.js` | 🔒 | Guard DELETE: verifica vínculos ativos antes de excluir |
| `tests/_helpers/supabase-mock.js` | 🆕 | Helper compartilhado (~60 linhas) |
| `tests/financial-enrollments.test.js` | ♻️ | Importa de helper (sem lógica alterada) |
| `tests/financial-teacher-payments.test.js` | ♻️ | Importa de helper (sem lógica alterada) |
| `tests/financial-teachers.test.js` | ♻️ | Importa de helper (sem lógica alterada) |
| `api/update-order-status.js` | 🔒 | `details: err.message` removido |

## Testes

- ✅ `npm test` — **68/68 passando** (nenhuma regressão)
- ✅ `npm run build` — 2.43s sem erros
- ✅ Code Review — aprovado sem issues
- ✅ Ripgrep: **0 ocorrências** de `details.*err\\.message` em `api/`

---

# ETAPA 81 — Design Polish: Sombras Tintadas, bg-base, Letter-spacing e Tabular-nums

**Data:** 16/07/2026

**Objetivo:** Implementar os 5 pontos restantes da auditoria de design (P2/P3) para polir o design system.

## Contexto

Após as correções P2 (Etapa 80 — centralização de CSS duplicado e active states), restavam 5 itens da auditoria de design por implementar:

1. 🔴 **`--bg-base` muito escuro (#07070b → #0a0a0a)** — Fundo off-black mais adequado, seguindo recomendação do design skill (evitar preto puro)
2. 🟡 **Sombras com preto puro** — `--shadow-sm/md/lg` usavam `rgba(0,0,0,0.3/0.4/0.5)`, agora tintadas com `rgba(var(--bg-base-rgb), 0.4/0.5/0.6)`
3. 🟢 **Sem negative tracking em headlines** — Adicionado `letter-spacing: -0.02em` para h1-h4 (h1: -0.03em) conforme recomendação de tipografia premium
4. 🟢 **Tabular-nums inconsistente** — Nova utility class `.font-nums` + selector list global aplicando `font-variant-numeric: tabular-nums` em todos os elementos que exibem números (KPIs, currency, stats)
5. 🟢 **Fundo do headline da agenda** — Pequeno ajuste de contraste

## Implementações

### `app/src/styles/global.css`

| Token/Mudança | Antes | Depois |
|---------------|:-----:|:------:|
| `--bg-base` | `#07070b` | `#0a0a0a` |
| `--bg-base-rgb` | — (não existia) | `10, 10, 10` |
| `--shadow-sm` | `rgba(0, 0, 0, 0.3)` | `rgba(var(--bg-base-rgb), 0.4)` |
| `--shadow-md` | `rgba(0, 0, 0, 0.4)` | `rgba(var(--bg-base-rgb), 0.5)` |
| `--shadow-lg` | `rgba(0, 0, 0, 0.5)` | `rgba(var(--bg-base-rgb), 0.6)` |
| `h1, h2, h3, h4` | sem tracking | `letter-spacing: -0.02em` (h1: -0.03em) |
| `.font-nums` | — (não existia) | `font-variant-numeric: tabular-nums` |
| tabular-nums seletor | — (não existia) | `.dash-kpi-value`, `.fin-kpi-value`, `.fin-cell-currency` etc. |

A variável `--bg-base-rgb` permite que as sombras sejam **tintadas com o matiz do fundo** (off-black) em vez de preto puro, criando sombras mais naturais e integradas ao tema escuro.

## Arquivo Alterado

| Arquivo | Mudança |
|---------|---------|
| `app/src/styles/global.css` | 5 tokens/regras CSS adicionados/modificados (~30 linhas) |

## Testes

- ✅ `npm run build` — 2.64s sem erros
- ✅ Code Review — aprovado sem issues

---

# ETAPA 82 — Correções de Campos: CPF, Telefone, Especialidade, Mensalidade e Upload de Imagem

**Data:** 16/07/2026

**Objetivo:** Corrigir 4 problemas reportados no formulário de cadastro: validação/máscara de CPF e telefone, especialidade do professor como dropdown, verificação de valor mínimo na mensalidade e substituição de URL de imagem por upload de arquivo.

## Problemas e Correções

| # | Problema | Correção |
|:-:|----------|----------|
| 1 | CPF e telefone sem validação de tamanho | Máscara `maskCPF()` (000.000.000-00) e `maskPhone()` ((XX) XXXXX-XXXX) aplicadas em TODOS os campos de aluno (wizard + edição) e professor, incluindo campos de responsável |
| 2 | Especialidade do professor como texto livre | Substituído `<input type="text">` por `<select>` com as 17 opções predefinidas de instrumentos + "Outro" |
| 3 | Mensalidade sem validação mínima | `min=0` → `min=1`, `step=0.01` → `step=1`, adicionado `required`, placeholder e hint "Valor mínimo: R$ 1,00" |
| 4 | URL da imagem no produto (campo texto) | Substituído por upload de arquivo com validação de tipo (JPEG/PNG/WebP), tamanho (máx 2MB), preview com thumbnail, botão de remover e estado de loading |

## Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `app/src/pages/Students.tsx` | `maskCPF()` + `maskPhone()` aplicados em 8 campos (CPF, phone, guardian_cpf, guardian_phone no wizard e edição) |
| `app/src/pages/Teachers.tsx` | Mesmas máscaras + `SPECIALTY_OPTIONS` + `<select>` no lugar de `<input>` |
| `app/src/pages/Enrollments.tsx` | `monthly_fee`: min=1, step=1, required, placeholder, help hint |
| `app/src/pages/Store.tsx` | `useRef` + `uploadProductImage` + `handleImageUpload` + file input + preview |
| `app/src/services/api.ts` | `uploadProductImage(file)` — POST FormData para `/api/upload-image` |
| `app/src/styles/store.css` | Estilos para `.store-image-upload`, preview, placeholder, remove button |

## Testes

- ✅ `npm run build` — 6.31s sem erros
- ✅ Code Review — aprovado sem issues

---

# ETAPA 83 — Painel de Gerenciamento de Imagens (Supabase Storage)

**Data:** 16/07/2026

**Objetivo:** Criar painel de visualização de uploads no Supabase Storage: listar todas as imagens enviadas, detectar e excluir imagens órfãs (sem produto vinculado), e mostrar uso de armazenamento.

## Implementações

### `api/storage-manager.js` (novo)

Endpoint Vercel Function protegido pela mesma senha do admin:
| Método | Parâmetros | O que faz |
|--------|-------------|-----------|
| GET | — | Lista arquivos do bucket `product-images`, cruza com produtos para detectar órfãs, calcula estatísticas de uso |
| DELETE | `filePath` | Exclui uma imagem do Storage |

- `extractFilePathFromUrl()` — extrai o caminho do arquivo da URL pública do Supabase
- `calculateTotalSize()` + `formatBytes()` — cálculo e formatação de tamanho
- Mensagens de erro genéricas (segurança)

### `app/src/pages/StorageManager.tsx` (novo)

Página React acessível em `/admin/storage`:
- **Cards de estatísticas**: Total de imagens (com tamanho formatado), vinculadas, órfãs (com destaque vermelho se > 0)
- **Filtros**: "📋 Todas", "🗑️ Órfãs", "✅ Vinculadas"
- **Grid de imagens**: Thumbnail 1:1 com lazy loading, badge "Órfã" em vermelho, nome, tamanho, data de upload, links para produtos vinculados
- **Ações por imagem**: 🔗 Abrir em nova aba, 🗑️ Excluir (com confirmação que alerta se a imagem está vinculada)
- **🧹 Limpar Órfãs**: Botão de ação em massa para excluir todas as imagens órfãs de uma vez
- Estados de loading, empty e error

### `app/src/services/api.ts`

| Função | Descrição |
|--------|-----------|
| `fetchStorageFiles()` | GET /api/storage-manager → `{ stats, images }` |
| `deleteStorageFile(filePath)` | DELETE /api/storage-manager?filePath=... |
| `cleanOrphanedFiles(filePaths)` | Exclui múltiplas órfãs sequencialmente |

Interfaces `StorageFile`, `StorageStats`, `StorageManagerResponse` exportadas.

### `app/src/App.tsx`

- Import `StorageManager`
- Rota `/admin/storage` com `AuthGuard` + `AppLayout`
- Breadcrumbs: Admin → Gerenciador de Imagens

### `app/src/styles/admin.css` (+250 linhas)

Estilos para todo o Storage Manager:
- `.admin-storage-grid` — grid responsivo auto-fill 200px
- `.admin-storage-card` — card com thumbnail, hover com scale(1.05)
- `.admin-storage-badge.orphan` — badge vermelho "Órfã"
- `.admin-storage-deleting-overlay` — overlay escuro durante exclusão
- `.admin-storage-product-link` — link para produto vinculado
- `.admin-storage-btn.danger` — botão vermelho
- `.admin-storage-toolbar` + `.admin-storage-filter-btn` — filtros
- Responsivo mobile (2 colunas em ≤720px)

## Arquivos Criados/Modificados

| Arquivo | Tipo | Mudança |
|---------|:----:|---------|
| `api/storage-manager.js` | 🆕 Novo | Endpoint GET + DELETE para gerenciar Storage |
| `app/src/pages/StorageManager.tsx` | 🆕 Novo | Página completa com grid, stats e ações |
| `app/src/services/api.ts` | ✨ | 3 funções + interfaces de Storage |
| `app/src/App.tsx` | ♻️ | Rota `/admin/storage` + breadcrumbs |
| `app/src/styles/admin.css` | ✨ | ~250 linhas de estilos do Storage Manager |

## Testes

- ✅ `npm run build` — 5.42s sem erros (805 inserções, 74 módulos)
- ✅ Code Review — aprovado sem issues

---

# ETAPA 84 — Compressão Automática de Imagens com Sharp (WebP + Resize 800px)

**Data:** 16/07/2026

**Objetivo:** Implementar compressão automática de imagens no upload, redimensionando para no máximo 800px de largura e convertendo para WebP com qualidade 80, reduzindo drasticamente o tamanho dos arquivos e economizando armazenamento no Supabase Storage.

## Contexto

O upload de imagens (`api/upload-image.js`) fazia upload do arquivo original sem qualquer processamento, ocupando espaço desnecessário no Storage. Imagens de celular (12MP+) podiam ter vários MB cada.

## Implementações

### `api/upload-image.js` — refatorado com Sharp

1. **Sharp integrado**: `import sharp from 'sharp'` para processamento de imagens
2. **Redimensionamento automático**: Largura máxima de **800px** (mantendo proporção). Imagens menores não são ampliadas (`withoutEnlargement: true`)
3. **Conversão para WebP**: Qualidade **80** com esforço `4` (balanced), resultando em arquivos muito menores com qualidade visual similar
4. **Sempre .webp**: O nome do arquivo sanitizado agora sempre termina em `.webp`
5. **Limite de upload aumentado**: De **2MB → 10MB** (o arquivo original pode ser maior porque será comprimido)
6. **Formatos aceitos**: Agora aceita JPEG, PNG, WebP, GIF e AVIF (todos convertidos para WebP na saída)
7. **Estatísticas de compressão**: Resposta inclui `originalSize`, `compressedSize` e `savingsPercent`

### `npm install sharp`

Sharp adicionado como dependência de produção no `package.json`.

### Pipeline de compressão

```javascript
async function compressImage(buffer) {
    return sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
}
```

- **withoutEnlargement**: Evita ampliar imagens menores que 800px
- **effort 4**: Nível de compressão balanced (0 = rápido/maior, 6 = lento/menor)
- **quality 80**: Boa qualidade visual com economia significativa

## Impacto Esperado

| Métrica | Antes | Depois | Economia |
|---------|:-----:|:------:|:--------:|
| Tamanho médio por imagem (JPEG 12MP) | ~3-5MB | ~100-300KB | **~90-95%** |
| Tamanho médio por imagem (PNG) | ~2MB | ~150-400KB | **~80-90%** |
| Limite de upload | 2MB | 10MB | — |

## Arquivos Alterados

| Arquivo | Mudança |
|---------|---------|
| `api/upload-image.js` | Sharp: resize 800px + WebP quality 80 + +5 formatos aceitos + limites atualizados |
| `package.json` | `"sharp": "^..."` adicionado às dependências |
| `package-lock.json` | Atualizado automaticamente |

## Testes

- ✅ `node -e "import('sharp')"` — Sharp ESM carregado corretamente
- ✅ `node --check api/upload-image.js` — sintaxe válida
- ✅ `npm run build` — 3.65s sem erros
- ✅ Code Review — aprovado (1 sugestão aplicada: simplificar metadata check)

---

© 2026 Escola de Música Bruna Mandz — [novo_registro.md](novo_registro.md) é o diário oficial de desenvolvimento.
