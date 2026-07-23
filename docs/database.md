# Banco de Dados

## Objetivo

Este documento descreve a estrutura **real** do banco de dados, conforme aplicada no Supabase (PostgreSQL).

> Revisão de 12/07/2026: reescrito após refatoração de jul/2026. `students.active` removido (só use `status`), RLS policies limpas, migrations históricas consolidadas em `financial-schema.sql`.

> Revisão anterior (10/07/2026): reescrito para refletir o schema real (`supabase/schema.sql` + `supabase/financial-schema.sql` + `supabase/migrations/`). A versão anterior descrevia um schema idealizado (IDs em UUID, tabelas como `charges`, `financial_transactions`, `stock_movements` que nunca existiram, RLS por perfil de usuário) que não corresponde ao banco real.

---

# Tecnologia

Banco de Dados: PostgreSQL
Plataforma: Supabase

---

# Convenções reais

## Nome das tabelas
snake_case, plural — isso bateu com o planejamento original e foi seguido:

```
students, teachers, enrollments, lessons, attendance,
tuitions, payments, expenses, investments, teacher_payments,
orders, products
```

## Colunas
snake_case, incluindo `created_at` / `updated_at` (via trigger `set_updated_at`).

## Chave primária — DIFERENTE do planejado originalmente

As tabelas **não** usam `id UUID`. Usam `id TEXT`, com prefixo legível por tabela, gerado no backend (função `genId()`):

```
ST-XXXXXX   students
TE-XXXXXX   teachers
EN-XXXXXX   enrollments
TU-XXXXXX   tuitions
TP-XXXXXX   teacher_payments
LS-XXXXXX   lessons
AT-XXXXXX   attendance
BM-XXXXXXXX-XXXX   orders (gerado no frontend)
```

Essa escolha foi deliberada: IDs legíveis facilitam debug manual no SQL Editor e em logs, e evitam a necessidade da extensão `pgcrypto`/`uuid-ossp`.

## Exclusão de registros
Usa `status` (students, enrollments, tuitions, lessons, orders) em vez de soft-delete genérico com `deleted_at`. Não há coluna `deleted_at` em nenhuma tabela hoje.

> Nota: `students.active` foi **removido na refatoração de jul/2026** — era redundante com `students.status` (que tem 7 estágios: lead→cancelled). `status = 'active'` é a única fonte de verdade para alunos ativos. `teachers.active` foi mantido pois não há redundância (professores não têm ciclo de vida com múltiplos estágios).

---

# Estrutura Real

```
students
│
├── enrollments (student_id)
│      │
│      ├── lessons (enrollment_id)
│      │      │
│      │      └── attendance (lesson_id)
│      │
│      └── tuitions (enrollment_id, opcional)
│
└── payments (student_id, opcional — receita avulsa)

teachers
│
├── enrollments (teacher_id, opcional)
├── lessons (teacher_id, opcional)
└── teacher_payments (teacher_id)

expenses          (sem relação com aluno/professor — custo fixo/variável da escola)
investments       (sem relação com aluno/professor)

orders            (loja — sem FK para products; snapshot em jsonb)
products          (loja)
```

Não existem as tabelas `charges`, `financial_transactions`, `stock_movements`, `student_contacts`, `student_documents`, `teacher_availability`, `teacher_specialties`, `lesson_notes`, `categories` (para produtos) mencionadas em versões anteriores deste documento — nunca foram criadas.

---

# Tabelas — Módulo Alunos/Vínculos/Aulas

## `students`
`id, name, cpf, email, phone, address, instruments, status (lead|interested|enrolled|active|suspended|completed|cancelled), guardian_name, guardian_cpf, guardian_phone, enrolled_at, source (website|indicacao|social|presencial|outro), created_at, updated_at`

> `cpf` e `guardian_cpf` adicionados na migration 045; `guardian_name` e `guardian_phone` adicionados na migration 046.

> `status` substitui o antigo `active` (boolean) — removido na refatoração de jul/2026. Agora use `status = 'active'` para alunos ativos. `enrolled_at` e `source` também foram adicionados como parte do ciclo de vida do aluno (migration 050).

## `enrollments`
`id, student_id (FK), teacher_id (FK, nullable), instrument, day_of_week, class_time, duration_minutes, classes_per_week, monthly_fee, billing_type (weekly|monthly|full), total_amount, installments, status (active|inactive), notes, created_at, updated_at`

> `billing_type`, `total_amount` e `installments` adicionados na migration 043 para suportar modelo de cobrança misto.

## `lessons`
`id, enrollment_id (FK, nullable), student_id (FK), teacher_id (FK, nullable), instrument, date, start_time, end_time, duration_minutes, lesson_type (regular|make_up|extra|trial), status (scheduled|completed|cancelled|make_up), created_at, updated_at`

> `enrollment_id` foi tornado **nullable** na migration 047 — necessário para criar aulas avulsas sem vínculo, informando `student_id`, `teacher_id` e `instrument` diretamente. A FK usa `on delete set null`.

## `attendance`
`id, lesson_id (FK), student_id (FK), status (present|absent|excused|late), late_minutes, notes, recorded_at, recorded_by`
Constraint: único por `(lesson_id, student_id)`.

---

# Tabelas — Módulo Professores

## `teachers`
`id, name, cpf, email, phone, specialty, days_of_week (text — convertido de text[] para text na migration 045), rate_per_class, active boolean, created_at, updated_at`

> `cpf`, `email` e `active` adicionados na migration 045. `days_of_week` convertido de array para texto simples. `active` foi mantido (não é redundante — professores não têm ciclo de vida com múltiplos estágios como alunos).

---

# Tabelas — Módulo Financeiro

## `tuitions`
`id, student_id (FK), enrollment_id (FK, nullable), reference_month, amount, discount_amount, discount_reason, due_date, status (pending|paid|overdue|cancelled), payment_method, paid_at, billing_type, installment_number, notes, created_at, updated_at`

> `billing_type` e `installment_number` adicionados na migration 043.

## `teacher_payments`
`id, teacher_id (FK), reference_month, amount, paid, paid_at, notes, created_at, updated_at`

## `payments`
Receitas avulsas — categoria, valor, aluno relacionado (opcional).

## `expenses`
`expense_type (fixed|variable)`, categoria, valor, vencimento, pago/não pago.

## `investments`
Valor, data de compra, descrição.

---

# Tabelas — Módulo Loja

## `products`
`id, name, description, price, stock, active, category (roupas|acessorios|kits), badge, badge_color, image, reward_xp, variants (jsonb), created_at, updated_at`

## `orders`
`id, status (pending|approved|rejected|cancelled|refunded), method (pix|card|manual), customer_name, customer_email, customer_phone, items (jsonb), total, mp_payment_id, mp_status, mp_status_detail, earned_xp, customer_is_student, created_at, updated_at`

---

# Integridade

O que é usado de fato:
- Primary Keys (texto, com prefixo)
- Foreign Keys (`references ... on delete cascade` ou `on delete set null`, conforme o caso)
- Constraints `CHECK` para campos de enum (ex: `status`, `category`, `lesson_type`)
- Índices (`create index if not exists`) nas colunas mais consultadas (status, datas de referência, FKs)
- Triggers `set_updated_at` para manter `updated_at` automático

O que **não** é usado: Views, Functions de negócio no banco, Triggers de auditoria. Toda regra de negócio (ex: geração automática de mensalidade, removida na ETAPA 43) vivia no backend (`api/admin-financial.js`), não no banco.

---

# Segurança (RLS) — decisão real

Todas as tabelas têm RLS **habilitado**, mas **sem policies**. Isso é intencional:

- O frontend nunca fala diretamente com o Supabase para essas tabelas — só via `api/admin-financial.js`.
- O backend usa a **Service Role Key**, que ignora RLS por completo.
- O acesso ao backend é protegido por senha única (`ADMIN_PASSWORD`, header `x-admin-password`).

> As policies `"admin manage X" ... to authenticated` que existiam antes da refatoração de jul/2026 foram **removidas**. Elas nunca tinham efeito prático — o backend sempre acessou via service role key (que ignora RLS) e o projeto nunca usou Supabase Auth para login de usuários. Manter policies mortas dava uma falsa sensação de controle de acesso.

Não há perfis de acesso (Administrador / Secretaria / Financeiro / Professor) implementados — é um acesso único, tudo ou nada. Se perfis diferenciados forem necessários no futuro, a decisão de arquitetura precisa mudar (provavelmente adotando Supabase Auth de verdade), e este documento deve ser atualizado quando isso acontecer.

---
# Migrations

**A partir da refatoração de jul/2026, as migrations individuais não precisam mais ser executadas.** O schema consolidado em `supabase/financial-schema.sql` já nasce com todas as mudanças — aplicando-o uma vez, tudo está criado.

As migrations em `supabase/migrations/*.sql` e os arquivos `migration-*.sql` na raiz de `supabase/` são mantidos apenas como **registro histórico** do desenvolvimento incremental. VER `supabase/RESET_INSTRUCTIONS.md`.

## Histórico de migrations

| Migration | O que adiciona | Status |
|-----------|---------------|--------|
| `043-billing-type.sql` | `billing_type`, `total_amount`, `installments` em enrollments; `billing_type`, `installment_number` em tuitions | ✅ Consolidado em financial-schema.sql |
| `045-add-cpf.sql` | `cpf`, `guardian_cpf` em students; `cpf`, `email`, `active` em teachers; `days_of_week` text[]→text | ✅ Consolidado em financial-schema.sql |
| `046-add-guardian-fields.sql` | `guardian_name`, `guardian_phone` em students | ✅ Consolidado em financial-schema.sql |
| `047-make-enrollment-id-nullable.sql` | `enrollment_id` nullable em lessons (FK `on delete set null`) | ✅ Consolidado em financial-schema.sql |
| `050-student-lifecycle.sql` | `status` (7 estágios), `enrolled_at`, `source` em students; `source_check` constraint | ✅ Consolidado em financial-schema.sql |
| `051-fix-investments-category.sql` | Adiciona 'infraestrutura' e 'marketing' ao CHECK de `investments.category` | ✅ Banco já existente |
| `052-rls-deny-anon.sql` | Deny policies para role anon em todas as 12 tabelas (defense-in-depth) | ✅ Banco já existente |
| `053-add-investments-updated-at.sql` | Adiciona `updated_at` + trigger em `investments` (agora suporta PATCH) | ✅ Consolidado em financial-schema.sql |
| `054-products-low-stock-idx.sql` | Índice parcial `products_low_stock_idx` em `products(stock)` WHERE `active = true` | ✅ Pendente de aplicação no banco |

---

# Seeds

`supabase/seed-escola.sql` (dados de alunos/professores/vínculos de exemplo) e `supabase/seed-products.sql` (produtos da loja), usados em desenvolvimento local via `server-dev.js`.

> `seed-escola.sql` foi corrigido em jul/2026: o `INSERT INTO students` usava a coluna `active` (removida) e foi alterado para usar `status = 'active'`.

---

# Evolução do Banco

Toda nova tabela ou coluna deve:
1. Ser criada via migration idempotente em `supabase/migrations/`
2. Ser espelhada em `financial-schema.sql` (ou `schema.sql`, se for da Loja)
3. Ter este documento atualizado **depois** de aplicada — não antes, como planejamento.
