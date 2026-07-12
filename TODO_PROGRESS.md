# TODO_PROGRESS

## ✅ Implementado do implementation_plan.md (completo)

- [x] **Campos de CPF** — Migration 045-add-cpf.sql, API (admin-financial.js), Frontend (modais + tabelas)
- [x] **Ocultar IDs** — Colunas ID removidas de todas as tabelas (Alunos, Professores, Vínculos, Mensalidades, Receitas, Pagtos Professores, Custos, Investimentos)
- [x] **Menu Professores** — Aba própria no topo (separada do Financeiro)
- [x] **Formulário Vínculos** — Removidas referências mortas; modal renomeado para "Nova Matrícula"; submit usa safeGet/safeSet
- [x] **Horários sem segundos** — Já estavam em formato HH:MM, nenhum ajuste necessário

## ✅ Migrações atualizadas

- [x] **045-add-cpf.sql** — Agora cobre também: `email` em teachers, `active` em teachers, conversão de `days_of_week` de `text[]` para `text`
- [x] **046-add-guardian-fields.sql** — Adiciona `guardian_name` e `guardian_phone` em students (campos que já estavam na API e frontend mas não haviam sido formalizados no schema)

## ✅ Correções de bugs (jul/2026)

- [x] **Select de aluno oculto no modal de matrícula** — `openEnrollmentModal` agora restaura a visibilidade do select de `student_id` ao abrir o modal (antes ficava oculto após usar `openEnrollmentModalForStudent`)
- [x] **Modal de Nova Aula refatorado** — Substituído dropdown único de enrollment_id por selects separados: Aluno, Professor, Instrumento (com filtro por especialidade do professor)
- [x] **API de aulas flexível** — `handleLessons POST` aceita `student_id` + `teacher_id` + `instrument` diretamente, mantendo compatibilidade com `enrollment_id`
- [x] **Filtro de instrumentos por especialidade** — Matching exato com fallback para as próprias especialidades do professor
- [x] **Erro 500 ao criar aula** — `enrollment_id` tornado nullable em `lessons` (migration 047) + LEFT JOIN no GET (em vez de INNER JOIN)

## ✅ Correções de segurança e qualidade (jul/2026)

- [x] **Refatoração handleSummary/handleDashboard** — Extraído helper `computeFinancialSummary()` eliminando ~50 linhas de queries duplicadas; Dashboard agora inclui `paidTeacherPayments` no cálculo de `outgoings` (bug fix)
- [x] **Remoção de vazamento de err.message** — 10 ocorrências em 7 arquivos API: `details: err.message` removido das respostas 500, erro logado internamente via `console.error()`
- [x] **Helpers safeFloat/safeInt** — 26 substituições de `parseFloat`/`parseInt` por funções que rejeitam NaN e valores negativos (min=0 para valores financeiros); `installments` corrigido de float para `safeInt()`
- [x] **Helper resolvePaidTimestamp** — Lógica de `paid_at` extraída de handleExpenses/handleTeacherPayments para função centralizada
- [x] **Testes validados** — `npm test` (2/2 webhook), `npm run build` (4.30s, zero warnings)

## ✅ Migrações aplicadas no Supabase

- [x] **043-billing-type.sql** — billing_type, total_amount, installments em enrollments; billing_type, installment_number em tuitions
- [x] **045-add-cpf.sql** — CPF em students/teachers; email+active em teachers; days_of_week text
- [x] **046-add-guardian-fields.sql** — guardian_name, guardian_phone em students
- [x] **047-make-enrollment-id-nullable.sql** — enrollment_id nullable em lessons (FK on delete set null)
- [x] **050-student-lifecycle.sql** — status (lead→cancelled), enrolled_at, source em students

## ✅ React Frontend (app/)

### Setup
- [x] **React + TypeScript + Vite** — Instalado e configurado convivendo com HTML antigo
- [x] **tsconfig.json** — Configuração TypeScript com path alias @/*
- [x] **vite.config.js** — Plugin React, resolve.alias, 5 entry points (incluindo app/)
- [x] **react-router-dom** — Roteamento SPA

### Components created
- [x] **app/src/pages/Dashboard.tsx** — Dashboard com KPIs, aulas de hoje, alertas, pedidos, estoque baixo, auto-refresh 60s
- [x] **app/src/pages/Students.tsx** — CRUD completo: listagem, busca, filtro por status, modal com status lifecycle + source
- [x] **app/src/pages/Teachers.tsx** — CRUD completo: listagem, busca, modal com dias de atendimento (checkboxes), valor/aula
- [x] **app/src/pages/Agenda.tsx** — Calendário mensal com grid 7 colunas, navegação mês/mês, markers de aula, modais day-detail e CRUD
- [x] **app/src/pages/Enrollments.tsx** — CRUD de matrículas: tabela + busca + status filter + modal com billing_type, teacher/student selects
- [x] **app/src/pages/Financial.tsx** — Página financeira completa: KPIs, sub-abas Receitas/Custos/Investimentos/Pag. Professores, CRUD com modais
- [x] **app/src/pages/Admin.tsx** — Página de Administração com overview stats (6 cards), atalhos rápidos, info do sistema, tabela do banco

### Styles created
- [x] **app/src/styles/dashboard.css** — Dark theme KPIs, cards, responsive
- [x] **app/src/styles/students.css** — Status pills, modal, mobile
- [x] **app/src/styles/teachers.css** — Day checkbox grid, dark theme
- [x] **app/src/styles/agenda.css** — Calendar grid 7 colunas, markers, modais
- [x] **app/src/styles/enrollments.css** — Table + cards mobile, dark theme
- [x] **app/src/styles/financial.css** — ~470 linhas: KPIs, sub-tabs, modais, forms, table, responsive
- [x] **app/src/styles/admin.css** — ~260 linhas: overview cards, links grid, info grid, tabela, dark theme, responsivo

### Routes
- [x] **/** — Home (cards dos módulos)
- [x] **/dashboard** — Dashboard React
- [x] **/academico** — Alunos
- [x] **/academico/professores** — Professores (sub-nav dinâmica com active state)
- [x] **/academico/turmas** — Matrículas (Enrollments)
- [x] **/agenda** — Agenda Mensal (calendário)
- [x] **/financeiro** — Página Financeira completa
- [x] **/admin** — Administração (overview stats, atalhos, sistema)

### API functions added
- [x] **fetchFinancialSummary** — Resumo financeiro por mês/ano
- [x] **fetchPayments, createPayment** — Receitas avulsas
- [x] **fetchExpenses, createExpense, updateExpense** — Custos/Despesas
- [x] **fetchInvestments, createInvestment** — Investimentos
- [x] **fetchTeacherPayments, createTeacherPayment, updateTeacherPayment, deleteTeacherPayment** — Pagamentos a professores

## Etapas

- [x] Etapa 1: Atualizar Supabase (supabase/financial-schema.sql)
- [x] Etapa 2: Atualizar backend api/admin-financial.js
- [x] Etapa 3: Atualizar painel painel-x9k2f.html (Agenda Mensal + Dashboard aulas + Aulas CRUD cards)
- [x] Etapa 4: Criar spec com proximas prioridades (docs/proxima-etapa-spec.md)
- [x] Etapa 5: Alunos Expandido (campos responsavel + CPF) — guardian_name, guardian_phone, guardian_cpf adicionados
- [x] **Etapa 50: Setup React/TypeScript + ciclo de vida do aluno** — React app, Migration 050, API status/source/enrolled_at, frontend status lifecycle
- [x] **Etapa 51: Componentes React (Dashboard + Students + Teachers)** — Dashboard com KPIs, Students CRUD, Teachers CRUD
- [x] **Etapa 52: Agenda Mensal React** — Calendário grid, modais, CRUD de aulas
- [x] **Etapa 53: Matrículas (Enrollments) React** — CRUD com billing_type, busca, status filter
- [x] **Etapa 54: Financeiro React** — Página completa com KPIs, sub-abas, 4 CRUDs
- [x] **Etapa 55: Admin React** — Página de Administração com overview stats, atalhos, info do sistema, tabela resumo do banco
- [ ] **Etapa 6: Testes funcionais ponta a ponta pos-deploy**

## Próximas pendências

1. 🟡 **Testes pós-deploy** — Validar fluxo completo em produção (vínculo → aula → presença → agenda mensal)
2. ✅ **Migration 050 no Supabase** — Executada via Supabase CLI (ciclo de vida do aluno)
3. ✅ **Auth no React** — Login independente do painel clássico
4. ✅ **Módulo Admin** — Página de administração com overview stats, atalhos, sistema (React)
5. ✅ **Merge blackboxai/mcp-git-server → main** — Concluído + push para origin/main
6. ✅ **MCP_GIT_VERIFICATION.md** — Preenchido com output real do git status
7. ✅ **Commit das correções de segurança** — 7 arquivos API alterados, commit `267e883`
8. 🔵 **Exportar CSV** — Exportar pagamentos avulsos e custos
9. 🔵 **Edição de investimentos** — Atualmente só create
10. 🔵 **Filtro paid/unpaid** — Em custos e pagamentos a professores
