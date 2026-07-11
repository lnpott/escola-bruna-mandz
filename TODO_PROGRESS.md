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

## Etapas

- [x] Etapa 1: Atualizar Supabase (supabase/financial-schema.sql)
- [x] Etapa 2: Atualizar backend api/admin-financial.js
- [x] Etapa 3: Atualizar painel painel-x9k2f.html (Agenda Mensal + Dashboard aulas + Aulas CRUD cards)
- [x] Etapa 4: Criar spec com proximas prioridades (docs/proxima-etapa-spec.md)
- [x] Etapa 6: Alunos Expandido (campos responsavel + CPF) — guardian_name, guardian_phone, guardian_cpf adicionados
- [ ] **Etapa 5: Mensalidades Automaticas ao criar vinculo**
- [ ] **Etapa 7: Testes funcionais ponta a ponta pos-deploy**

## Próximas pendências

1. 🔴 **Mensalidades Automáticas** — Ao criar enrollment com status='active', gerar tuition automaticamente para o mês corrente
2. 🟡 **Testes pós-deploy** — Validar fluxo completo em produção (vínculo → aula → presença → agenda mensal)
