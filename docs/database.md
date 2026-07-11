# Banco de Dados

## Objetivo

Este documento descreve a estrutura **real** do banco de dados, conforme aplicada no Supabase (PostgreSQL).

> Revisão de 10/07/2026: reescrito para refletir o schema real (`supabase/schema.sql` + `supabase/financial-schema.sql` + `supabase/migrations/`). A versão anterior descrevia um schema idealizado (IDs em UUID, tabelas como `charges`, `financial_transactions`, `stock_movements` que nunca existiram, RLS por perfil de usuário) que não corresponde ao banco real.

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
Usa `active boolean` (students) ou `status` (enrollments, tuitions, lessons, orders) em vez de soft-delete genérico com `deleted_at`. Não há coluna `deleted_at` em nenhuma tabela hoje.

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
`id, name, cpf, email, phone, address, instruments, active, guardian_name, guardian_cpf, guardian_phone, created_at, updated_at`

## `enrollments`
`id, student_id (FK), teacher_id (FK, nullable), instrument, day_of_week, class_time, duration_minutes, classes_per_week, monthly_fee, status, notes, created_at, updated_at`

## `lessons`
`id, enrollment_id (FK), student_id (FK), teacher_id (FK, nullable), instrument, date, start_time, end_time, duration_minutes, lesson_type (regular|make_up|extra|trial), status (scheduled|completed|cancelled|make_up), created_at, updated_at`

## `attendance`
`id, lesson_id (FK), student_id (FK), status (present|absent|excused|late), late_minutes, notes, recorded_at, recorded_by`
Constraint: único por `(lesson_id, student_id)`.

---

# Tabelas — Módulo Professores

## `teachers`
`id, name, cpf, email, phone, specialty, days_of_week (text), rate_per_class, active, created_at, updated_at`

---

# Tabelas — Módulo Financeiro

## `tuitions`
`id, student_id (FK), enrollment_id (FK, nullable), reference_month, amount, discount_amount, discount_reason, due_date, status (pending|paid|overdue|cancelled), payment_method, paid_at, notes, created_at, updated_at`

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

O que **não** é usado: Views, Functions de negócio no banco, Triggers de auditoria. Toda regra de negócio (ex: geração automática de mensalidade) vive no backend (`api/admin-financial.js`), não no banco.

---

# Segurança (RLS) — decisão real, não "a definir"

Todas as tabelas financeiras/pedagógicas têm RLS **habilitado**, mas **sem policies**. Isso é intencional, não uma pendência:

- O frontend nunca fala diretamente com o Supabase para essas tabelas — só via `api/admin-financial.js`.
- O backend usa a **Service Role Key**, que ignora RLS por completo.
- O acesso ao backend é protegido por senha única (`ADMIN_PASSWORD`, header `x-admin-password`).

Não há perfis de acesso (Administrador / Secretaria / Financeiro / Professor) implementados — é um acesso único, tudo ou nada. Se perfis diferenciados forem necessários no futuro, a decisão de arquitetura precisa mudar (provavelmente adotando Supabase Auth de verdade), e este documento deve ser atualizado quando isso acontecer.

---
# Migration destacada: 045-add-cpf.sql

Além de adicionar `cpf` e `guardian_cpf` em `students` e `cpf` em `teachers`:
- Adiciona `email` em `teachers` (coluna que estava no schema consolidado mas faltava na migration)
- Adiciona `active boolean not null default true` em `teachers`
- Converte `days_of_week` de `text[]` para `text` usando `array_to_string` (com `DO` block que só executa se a coluna ainda for do tipo array)

# Migrations

Ficam em `supabase/migrations/` (por mudança de schema) e são espelhadas em `supabase/financial-schema.sql` (schema consolidado, usado para recriar o banco do zero). São escritas de forma idempotente (`IF NOT EXISTS`, `DO` blocks) porque, na prática, algumas migrations já foram aplicadas manualmente no SQL Editor do Supabase antes de serem commitadas — então precisam ser seguras para rodar de novo sem erro.

---

# Seeds

`supabase/seed-escola.sql` (dados de alunos/professores/vínculos de exemplo) e `supabase/seed-products.sql` (produtos da loja), usados em desenvolvimento local via `server-dev.js`.

---

# Evolução do Banco

Toda nova tabela ou coluna deve:
1. Ser criada via migration idempotente em `supabase/migrations/`
2. Ser espelhada em `financial-schema.sql` (ou `schema.sql`, se for da Loja)
3. Ter este documento atualizado **depois** de aplicada — não antes, como planejamento.
