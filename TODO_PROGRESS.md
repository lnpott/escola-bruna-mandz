# TODO_PROGRESS

## ✅ Implementado do implementation_plan.md (completo)

- [x] **Campos de CPF** — Migration 045-add-cpf.sql, API (admin-financial.js), Frontend (modais + tabelas)
- [x] **Ocultar IDs** — Colunas ID removidas de todas as tabelas (Alunos, Professores, Vínculos, Mensalidades, Receitas, Pagtos Professores, Custos, Investimentos)
- [x] **Menu Professores** — Aba própria no topo (separada do Financeiro)
- [x] **Formulário Vínculos** — Removidas referências mortas; modal renomeado para "Nova Matrícula"; submit usa safeGet/safeSet
- [x] **Horários sem segundos** — Já estavam em formato HH:MM, nenhum ajuste necessário

## ✅ Migrações atualizadas

- [x] **045-add-cpf.sql** — Agora cobre também: `email` em teachers, `active` em teachers, conversão de `days_of_week` de `text[]` para `text`

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
