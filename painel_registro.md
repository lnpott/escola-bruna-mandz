---

# ETAPA 44 — CORREÇÕES PÓS-AUDITORIA DE BANCO

**Data:** 12/07/2026

**Horário:** —

**Agente Responsável:** Buffy (DeepSeek)

**Commit Git:** `802224f` (applied fixes) + `5a3664c` (Fase 4 React SPA bugs)

---

## Objetivo

Corrigir os problemas identificados na auditoria do banco de dados e schema, antes do merge da REFAC na main.

---

## Implementações Realizadas

### SQL de correção (supabase/fix-auditoria.sql)

Arquivo criado para aplicar no Supabase SQL Editor. Corrige:

- **Problema #1** — `students.active` dropada do banco real (`alter table students drop column if exists active`). `status` é a única fonte de verdade.
- **Problema #3** — `enrollments.class_time` garantido como `text`; dados existentes com segundos (`'15:00:00'`) truncados para `'15:00'`.
- **Problema #4** — `lessons.start_time` e `end_time` garantidos como `text`; dados com segundos normalizados.
- **Problema #5/7** — `tuitions.reference_month` migrado de `text 'YYYY-MM'` para `date` (primeiro dia do mês, ex: `2026-07-01`) — alinhado com `teacher_payments.reference_month`. Dados existentes convertidos.
- **Problema #8** — `expense_type` CHECK expandido para aceitar `'fixed'`, `'eventual'` e `'variable'` (React SPA usa `'variable'`, banco só aceitava `'eventual'`).
- **Observação #9** — Criadas policies RLS de deny para `anon` nas 10 tabelas do domínio acadêmico/financeiro (preventivo).

### Schema atualizado (supabase/financial-schema.sql)

- `tuitions.reference_month`: `text` → `date` (comentário no histórico atualizado)
- `expenses.expense_type` CHECK: adicionado `'variable'` ao enum

### API atualizada (api/_lib/financial/tuitions.js)

- Importado `normalizeMonthDate()` de `helpers.js` (função já existente, usada por `teacherPayments.js`)
- POST e PATCH agora usam `normalizeMonthDate(reference_month)` para garantir que o valor seja salvo no formato date correto (`YYYY-MM-DD`) antes de enviar ao banco
- **Não foi criada função nova** — reutiliza o helper existente, mantendo consistência com teacherPayments.js

### Problemas que NÃO precisaram de mudança de código

- **Problema #2 / #10 / #11** — `api/_lib/admin/` já foi removido na Etapa 42. Confirmado: diretório não existe no REFAC.
- **Problema #6** — `tuitions.billing_type` NULL nos registros de seed é comportamento esperado (coluna nullable). O painel não envia `billing_type` ao criar mensalidade avulsa; só enrollments que geram tuitions automaticamente devem preencher esse campo. Sem mudança de código necessária.

---

## Arquivos Alterados

- `supabase/fix-auditoria.sql` — **novo** (migration para aplicar no Supabase SQL Editor)
- `supabase/financial-schema.sql` — 2 linhas alteradas (`reference_month` e `expense_type` check)
- `api/_lib/financial/tuitions.js` — importa e usa `normalizeMonthDate()` de helpers em vez de `reference_month || null`

---

## Alterações no Banco

✅ `students.active` removida
✅ `enrollments.class_time` / `lessons.start_time` / `lessons.end_time` normalizados para text sem segundos
✅ `tuitions.reference_month` convertida para `date`
✅ `expenses.expense_type` check expandido
✅ Policies RLS deny-anon criadas nas 10 tabelas

---

## Testes

✅ `node --check` em `tuitions.js` — sintaxe válida
✅ `npm test` — testes passando

---

## Pendências

- ~~Aplicar `fix-auditoria.sql` no Supabase SQL Editor~~ ✅
- ~~Commit + push dos arquivos desta etapa~~ ✅
- ~~Fase 4: correções de bugs do React SPA~~ ✅
- Deploy na Vercel a partir da branch REFAC
- Validação funcional ponta a ponta (roteiro da Etapa 43 ainda válido)
- Merge da REFAC na main após validação

---

## Próxima Etapa

Deploy da REFAC na Vercel + validação funcional ponta a ponta.

---

# ETAPA 45 — CORREÇÕES DE BUGS DO REACT SPA (FASE 4)

**Data:** 12/07/2026

**Horário:** —

**Agente Responsável:** Buffy (DeepSeek)

**Commit Git:** `5a3664c` — "Fase 4: corrige bugs do React SPA (students.active, error handling, req.body validation)"

---

## Objetivo

Corrigir bugs identificados no React SPA que causavam erros 500 ao modificar dados e quebras de funcionalidade na interface.

---

## Diagnóstico

Três causas principais foram identificadas:

1. **Causa #3** — `Enrollments.tsx` e `Admin.tsx` referenciavam `students.active` (coluna removida na Etapa 44). `s.active` retornava `undefined` para todos os alunos, fazendo o select de alunos em Matrículas ficar vazio.

2. **Causa #2** — O catch genérico no router `admin-financial.js` transformava QUALQUER erro em 500 "Erro interno.", sem diferenciar erros de validação (400), conflito (409) ou erro interno (500).

3. **Causa #5** — Handlers faziam `const { ... } = req.body` sem validar se `body` existia, causando `TypeError` quando o frontend enviava Content-Type errado.

---

## Implementações Realizadas

### Bug #3 — students.active removida (app/src/pages/Enrollments.tsx + Admin.tsx)

- `s.active` substituído por `s.status === 'active'` em ambos os arquivos
- A coluna `active` foi dropada do banco na Etapa 44 — `status` é a única fonte de verdade
- `teachers.active` NÃO foi alterado (coluna ainda existe na tabela teachers)

### Bug #2 — Error handling na API (api/admin-financial.js)

- Importado `classifyError()` de `helpers.js` (já existente)
- O catch agora mapeia erros do Supabase para HTTP status adequados:
  - `23505` (unique violation) → **409** "Conflito: este registro já existe."
  - `23503` (FK violation) → **409** "Operação não permitida: existem registros vinculados..."
  - `23514` (CHECK violation) → **400** "Dados inválidos: um ou mais campos..."
  - `23502` (NOT NULL) → **400** "Um campo obrigatório está ausente ou vazio."
  - Outros → **500** "Erro interno do servidor."
- Resposta agora inclui `errorCode` para debug no frontend

### Bug #5 — Validação de req.body (api/admin-financial.js)

- Adicionada validação centralizada ANTES do switch de resources:
  - Se método for POST/PATCH e `req.body` estiver ausente ou não for objeto → retorna **400**
  - Protege todos os 12 handlers contra TypeError de uma vez

---

## Arquivos Alterados

- `app/src/pages/Enrollments.tsx` — `s.active` → `s.status === 'active'`
- `app/src/pages/Admin.tsx` — `s.active` → `s.status === 'active'`
- `api/admin-financial.js` — `classifyError` + validação de `req.body`

---

## Alterações no Banco

Nenhuma. Correções exclusivamente de código frontend e API.

---

## Testes

✅ `node --check` em `admin-financial.js` — sintaxe válida
✅ `npm test` — 29/29 passando
✅ `npm run build` (React SPA) — build OK sem erros

---

## Pendências

- Deploy da REFAC na Vercel
- Validação funcional ponta a ponta do React SPA
- Merge da REFAC na main após validação

---

## Próxima Etapa

Deploy da REFAC na Vercel + validação funcional do React SPA.


